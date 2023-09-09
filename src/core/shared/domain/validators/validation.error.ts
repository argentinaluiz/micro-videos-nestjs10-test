import { FieldsErrors } from '../validators/validator-fields-interface';

export class ValidationError extends Error {}

export abstract class BaseValidationError extends Error {
  constructor(
    public error: FieldsErrors[],
    message = 'Validation Error',
  ) {
    super(message);
  }

  setFromError(field: string, error: Error) {
    if (error) {
      this.error[field] = [error.message];
    }
  }

  count() {
    return Object.keys(this.error).length;
  }
}

export class AggregateValidationError extends BaseValidationError {
  constructor(error: FieldsErrors[]) {
    super(error, 'Aggregate Validation Error');
    this.name = 'AggregateValidationError';
  }
}

export class SearchValidationError extends BaseValidationError {
  constructor(error: FieldsErrors[]) {
    super(error, 'Search Validation Error');
    this.name = 'SearchValidationError';
  }
}

export class LoadAggregateError extends Error {
  constructor(
    public error: FieldsErrors[],
    message?: string,
  ) {
    super(message ?? 'An aggregate not be loaded');
    this.name = 'LoadAggregateError';
  }
}
