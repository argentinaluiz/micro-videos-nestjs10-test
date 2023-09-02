import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { ValueObject } from "../value-object";

export class Uuid extends ValueObject<string> {
  constructor(readonly id?: string) {
    super(id || uuidv4());
    this.validate();
  }

  private validate() {
    const isValid = uuidValidate(this.value);
    if (!isValid) {
      throw new InvalidUuidError();
    }
  }
}

export class InvalidUuidError extends Error {
  constructor(message?: string) {
    super(message || "ID must be a valid UUID");
    this.name = "InvalidUuidError";
  }
}

export default InvalidUuidError;
