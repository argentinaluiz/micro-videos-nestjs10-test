import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsIn,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { FileMediaInput } from '../../dto/file-media.input';

export type UploadImageMediaInputConstructorProps = {
  video_id: string;
  field: string;
  file: FileMediaInput;
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
  file: FileMediaInput;

  constructor(props?: UploadImageMediaInputConstructorProps) {
    if (!props) return;
    this.video_id = props.video_id;
    this.field = props.field;
    this.file = props.file;
  }
}

export class ValidateUploadImageMediaInput {
  static validate(input: UploadImageMediaInput) {
    return validateSync(input);
  }
}
