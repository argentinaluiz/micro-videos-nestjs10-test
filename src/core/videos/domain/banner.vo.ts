import { Either } from '../../shared/domain/either';
import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
  MediaFileValidator,
} from '../../shared/domain/utils/media-file.validator';
import { ImageMedia } from './image-media.vo';
import { VideoId } from './video.aggregate';

export class Banner extends ImageMedia {
  static max_size = 1024 * 1024 * 2;
  static mime_types = ['image/jpeg', 'image/png'];

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
      Banner.max_size,
      Banner.mime_types,
    );
    return Either.safe<
      Banner,
      InvalidMediaFileSizeError | InvalidMediaFileMimeTypeError
    >(() => {
      const { checksum, name } = mediaFileValidator.validate({
        raw_name,
        data,
        mime_type,
        size,
      });
      return new Banner({
        checksum,
        name,
        location: `videos/${video_id.id}/images`,
      });
    });
  }
}
