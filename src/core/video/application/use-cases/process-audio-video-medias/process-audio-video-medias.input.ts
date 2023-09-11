import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsIn,
  validateSync,
} from 'class-validator';

export type ProcessAudioVideoMediasInputConstructorProps = {
  video_id: string;
  encoded_location: string;
  field: 'trailer' | 'video';
};

export class ProcessAudioVideoMediasInput {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  video_id: string;

  @IsNotEmpty()
  encoded_location: string;

  @IsIn(['trailer', 'video'])
  @IsNotEmpty()
  field: 'trailer' | 'video';

  constructor(props?: ProcessAudioVideoMediasInputConstructorProps) {
    if (!props) return;
    this.video_id = props.video_id;
    this.encoded_location = props.encoded_location;
    this.field = props.field;
  }
}

export class ValidateProcessAudioVideoMediasInput {
  static validate(input: ProcessAudioVideoMediasInput) {
    return validateSync(input);
  }
}
