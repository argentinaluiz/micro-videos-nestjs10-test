import { Either } from '../../shared/domain/either';
import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
  MediaFileValidator,
} from '../../shared/domain/utils/media-file.validator';
import { AudioVideoMedia, AudioVideoMediaStatus } from './audio-video-media.vo';
import { VideoId } from './video.aggregate';

export class VideoMedia extends AudioVideoMedia {
  static max_size = 1024 * 1024 * 2;
  static mime_types = ['video/mp4'];

  static create({ name, raw_location }) {
    return new VideoMedia({
      name,
      raw_location,
      status: AudioVideoMediaStatus.PENDING,
    });
  }

  process() {
    return new VideoMedia({
      name: this.name,
      raw_location: this.raw_location,
      status: AudioVideoMediaStatus.PROCESSING,
    });
  }

  complete(encoded_location: string) {
    return new VideoMedia({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location,
      status: AudioVideoMediaStatus.COMPLETED,
    });
  }

  fail() {
    return new VideoMedia({
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
      VideoMedia.max_size,
      VideoMedia.mime_types,
    );
    return Either.safe<
      VideoMedia,
      InvalidMediaFileSizeError | InvalidMediaFileMimeTypeError
    >(() => {
      const { name } = mediaFileValidator.validate({
        raw_name,
        data,
        mime_type,
        size,
      });
      return VideoMedia.create({
        name: `${video_id.id}-${name}`,
        raw_location: `videos/${video_id.id}/videos`,
      });
    });
  }
}
