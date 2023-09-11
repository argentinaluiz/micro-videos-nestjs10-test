import { Either } from '../../shared/domain/either';
import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
  MediaFileValidator,
} from '../../shared/domain/utils/media-file.validator';
import {
  AudioVideoMedia,
  AudioVideoMediaStatus,
} from '../../shared/domain/value-objects/audio-video-media.vo';
import { VideoId } from './video.aggregate';

export class Trailer extends AudioVideoMedia {
  static max_size = 1024 * 1024 * 2;
  static mime_types = ['video/mp4'];

  static create({ name, raw_location }) {
    return new Trailer({
      name,
      raw_location,
      status: AudioVideoMediaStatus.PENDING,
    });
  }

  process() {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      status: AudioVideoMediaStatus.PROCESSING,
    });
  }

  complete(encoded_location: string) {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location,
      status: AudioVideoMediaStatus.COMPLETED,
    });
  }

  fail() {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      status: AudioVideoMediaStatus.FAILED,
    });
  }

  static createFromFile({
    raw_name,
    data,
    mime_type,
    size,
    video_id,
  }: {
    raw_name: string;
    data: Buffer;
    mime_type: string;
    size: number;
    video_id: VideoId;
  }) {
    const mediaFileValidator = new MediaFileValidator(
      Trailer.max_size,
      Trailer.mime_types,
    );
    return Either.safe<
      Trailer,
      InvalidMediaFileSizeError | InvalidMediaFileMimeTypeError
    >(() => {
      const { name } = mediaFileValidator.validate({
        raw_name,
        data,
        mime_type,
        size,
      });
      return Trailer.create({
        name: `${video_id.id}-${name}`,
        raw_location: `videos/${video_id.id}/videos`,
      });
    });
  }
}
