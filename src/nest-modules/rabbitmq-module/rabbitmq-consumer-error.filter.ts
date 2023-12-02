import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RabbitmqRetriableError } from './rabbitmq-retriable.error';
import { Message, MessagePropertyHeaders } from 'amqplib';
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';
import { EntityValidationError } from '../../core/shared/domain/validators/validation.error';
import { NotFoundError } from '../../core/shared/domain/errors/not-found.error';

@Catch(RabbitmqRetriableError)
export class RabbitMQConsumerErrorFilter implements ExceptionFilter {
  static readonly RETRY_HEADER = 'x-retry-count';
  static readonly MAX_RETRIES = 3;

  static readonly NON_RETRIABLE_ERRORS = [EntityValidationError, NotFoundError];

  constructor(private amqpConnection: AmqpConnection) {}

  async catch(exception: RabbitmqRetriableError, host: ArgumentsHost) {
    if (host.getType<'rmq'>() !== 'rmq') {
      return;
    }

    const hasNonRetriableError =
      RabbitMQConsumerErrorFilter.NON_RETRIABLE_ERRORS.some(
        (error) => exception.cause instanceof error,
      );

    if (hasNonRetriableError) {
      return new Nack(false);
    }

    const ctx = host.switchToRpc();
    const message: Message = ctx.getContext();
    // console.log('data', ctx.getData()); //dados da mensagem
    // console.log('context', ctx.getContext()); //tipo mensagem
    if (this.shouldRetry(message.properties.headers)) {
      await this.retry(message);
      return;
    } else {
      return new Nack(false);
    }
  }

  private shouldRetry(headers: MessagePropertyHeaders): boolean {
    return (
      !(RabbitMQConsumerErrorFilter.RETRY_HEADER in headers) ||
      headers[RabbitMQConsumerErrorFilter.RETRY_HEADER] <
        RabbitMQConsumerErrorFilter.MAX_RETRIES
    );
  }

  private async retry(message: Message) {
    const headers = message.properties.headers;
    headers[RabbitMQConsumerErrorFilter.RETRY_HEADER] = headers[
      RabbitMQConsumerErrorFilter.RETRY_HEADER
    ]
      ? headers[RabbitMQConsumerErrorFilter.RETRY_HEADER] + 1
      : 1;
    headers['x-delay'] = 5000;
    return this.amqpConnection.publish(
      'delay.exchange',
      message.fields.routingKey,
      message.content,
      {
        correlationId: message.properties.correlationId,
        headers,
      },
    );
  }
}
