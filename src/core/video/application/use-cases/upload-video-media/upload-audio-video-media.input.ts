import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsIn,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { FileMediaDto } from '../../dto/file-media.dto';

export type UploadAudioMediaInputConstructorProps = {
  video_id: string;
  field: string;
  file: FileMediaDto;
};

export class UploadAudioMediaInput {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  video_id: string;

  @IsIn(['trailer', 'video'])
  @IsNotEmpty()
  field: string;

  @ValidateNested()
  file: FileMediaDto;

  constructor(props?: UploadAudioMediaInputConstructorProps) {
    if (!props) return;
    this.video_id = props.video_id;
    this.field = props.field;
    this.file = props.file;
  }

  validate() {
    return validateSync(this);
  }
}
