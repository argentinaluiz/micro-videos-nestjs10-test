export class RabbitmqRetriableError extends Error {
  constructor(readonly cause: Error) {
    super('RabbitmqRetriableError');
    this.name = 'RabbitmqRetriableError';
  }
}
