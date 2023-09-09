import { ValueObject } from '../../shared/domain/value-object';

export abstract class ImageMedia extends ValueObject {
  readonly checksum: string;
  readonly name: string;
  readonly location: string;

  constructor({
    checksum,
    name,
    location,
  }: {
    checksum: string;
    name: string;
    location: string;
  }) {
    super();
    this.checksum = checksum;
    this.name = name;
    this.location = location;
  }

  toJSON() {
    return {
      checksum: this.checksum,
      name: this.name,
      location: this.location,
    };
  }
}

