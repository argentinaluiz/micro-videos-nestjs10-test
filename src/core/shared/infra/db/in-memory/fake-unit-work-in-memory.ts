import { IUnitOfWork } from '../../../domain/repository/unit-of-work.interface';

export class UnitOfWorkFakeInMemory implements IUnitOfWork {
  constructor() {}

  start(): Promise<void> {
    return;
  }
  commit(): Promise<void> {
    return;
  }
  rollback(): Promise<void> {
    return;
  }
  do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    return workFn(this);
  }

  getTransaction() {
    return;
  }
}
