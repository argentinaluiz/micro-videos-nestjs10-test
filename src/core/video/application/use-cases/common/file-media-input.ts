import { IsInstance, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class FileMediaInput {
  @IsString()
  @IsNotEmpty()
  raw_name: string;

  @IsInstance(Buffer)
  @IsNotEmpty()
  data: Buffer;

  @IsString()
  @IsNotEmpty()
  mime_type: string;

  @IsNotEmpty()
  @IsInt()
  size: number;
}
