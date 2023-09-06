import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize/types';
import { IUnitOfWork } from '../../../domain/repository/unit-of-work.interface';

export class UnitOfWorkSequelize implements IUnitOfWork {
  private transaction: Transaction;

  constructor(private sequelize: Sequelize) {}

  async start(): Promise<void> {
    if (!this.transaction) {
      this.transaction = await this.sequelize.transaction();
    }
  }

  async commit(): Promise<void> {
    this.validateTransaction();
    await this.transaction.commit();
    this.transaction = null;
  }

  async rollback(): Promise<void> {
    this.validateTransaction();
    await this.transaction.rollback();
    this.transaction = null;
  }

  async do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    try {
      if (this.transaction) {
        const result = await workFn(this);
        this.transaction = null;
        return result;
      }

      const result = await this.sequelize.transaction(async (t) => {
        this.transaction = t;
        return workFn(this);
      });
      this.transaction = null;
      return result;
    } catch (e) {
      this.transaction = null;
      throw e;
    }
  }

  getTransaction() {
    return this.transaction;
  }

  private validateTransaction() {
    if (!this.transaction) {
      throw new Error('No transaction started');
    }
  }
}
