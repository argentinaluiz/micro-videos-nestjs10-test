import { ValueObject } from '../../shared/domain/value-object';

export enum AudioVideoMediaStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class AudioVideoMedia extends ValueObject {
  readonly checksum: string;
  readonly name: string;
  readonly raw_location: string;
  readonly encoded_location: string | null;
  readonly status: AudioVideoMediaStatus;

  constructor({
    checksum,
    name,
    raw_location,
    encoded_location,
    status,
  }: {
    checksum: string;
    name: string;
    raw_location: string;
    encoded_location?: string;
    status: AudioVideoMediaStatus;
  }) {
    super();
    this.checksum = checksum;
    this.name = name;
    this.raw_location = raw_location;
    this.encoded_location = encoded_location ?? null;
    this.status = status;
  }

  static create({ checksum, name, raw_location }) {
    return new AudioVideoMedia({
      checksum,
      name,
      raw_location,
      status: AudioVideoMediaStatus.PENDING,
    });
  }

  process() {
    return new AudioVideoMedia({
      checksum: this.checksum,
      name: this.name,
      raw_location: this.raw_location,
      status: AudioVideoMediaStatus.PROCESSING,
    });
  }

  complete(encoded_location: string) {
    return new AudioVideoMedia({
      checksum: this.checksum,
      name: this.name,
      raw_location: this.raw_location,
      encoded_location,
      status: AudioVideoMediaStatus.COMPLETED,
    });
  }

  fail() {
    return new AudioVideoMedia({
      checksum: this.checksum,
      name: this.name,
      raw_location: this.raw_location,
      status: AudioVideoMediaStatus.FAILED,
    });
  }

  toJSON() {
    return {
      checksum: this.checksum,
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location,
      status: this.status,
    };
  }
}
