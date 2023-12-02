import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class TestFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log()
    console.log('TestFilter');
  }
}
