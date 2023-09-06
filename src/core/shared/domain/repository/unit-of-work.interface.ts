export interface IUnitOfWork {
  start(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
  getTransaction(): any;
}
