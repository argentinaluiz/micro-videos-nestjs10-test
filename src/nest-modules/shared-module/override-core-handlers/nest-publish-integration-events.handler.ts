import { Job } from 'bull';
import { PublishIntegrationEventsHandler } from '../../../core/shared/application/handlers/publish-integration-events.handler';
import { IIntegrationEvent } from '../../../core/shared/domain/events/integration-event.interface';
import { Process, Processor } from '@nestjs/bull';

@Processor('integration-events')
export class NestPublishIntegrationEventHandler extends PublishIntegrationEventsHandler {
  @Process()
  async handleJob(job: Job<IIntegrationEvent>): Promise<void> {
    this.handle(job.data);
  }
}
