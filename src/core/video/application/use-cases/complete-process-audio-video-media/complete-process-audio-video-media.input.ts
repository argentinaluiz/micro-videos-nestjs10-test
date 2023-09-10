import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsIn,
  validateSync,
} from 'class-validator';

export type CompleteProcessAudioVideoMediaInputConstructorProps = {
  video_id: string;
  encoded_location: string;
  field: 'trailer' | 'video';
};

export class CompleteProcessAudioVideoMediaInput {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  video_id: string;

  @IsNotEmpty()
  encoded_location: string;

  @IsIn(['trailer', 'video'])
  @IsNotEmpty()
  field: 'trailer' | 'video';

  constructor(props?: CompleteProcessAudioVideoMediaInputConstructorProps) {
    if (!props) return;
    this.video_id = props.video_id;
    this.encoded_location = props.encoded_location;
    this.field = props.field;
  }
}

export class ValidateCompleteProcessAudioVideoMediaInput {
  static validate(input: CompleteProcessAudioVideoMediaInput) {
    return validateSync(input);
  }
}
