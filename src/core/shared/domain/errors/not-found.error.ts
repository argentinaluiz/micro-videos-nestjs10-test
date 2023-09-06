import { AggregateRoot } from '../aggregate-root';

export class NotFoundError extends Error {
  constructor(
    id: any[] | any,
    aggregateClass: new (...args: any[]) => AggregateRoot,
  ) {
    const idsMessage = Array.isArray(id) ? id.join(', ') : id;
    super(`${aggregateClass.name} Not Found using ID ${idsMessage}`);
    this.name = 'NotFoundError';
  }
}
