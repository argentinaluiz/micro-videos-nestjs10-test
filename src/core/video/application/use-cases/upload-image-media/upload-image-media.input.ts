import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsIn,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { FileMediaDto } from '../../dto/file-media.dto';

export type UploadImageMediaInputConstructorProps = {
  video_id: string;
  field: string;
  file: FileMediaDto;
};

export class UploadImageMediaInput {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  video_id: string;

  @IsIn(['banner', 'thumbnail', 'thumbnail_half'])
  @IsNotEmpty()
  field: string;

  @ValidateNested()
  file: FileMediaDto;

  constructor(props?: UploadImageMediaInputConstructorProps) {
    if (!props) return;
    this.video_id = props.video_id;
    this.field = props.field;
    this.file = props.file;
  }

  validate() {
    return validateSync(this);
  }
}
