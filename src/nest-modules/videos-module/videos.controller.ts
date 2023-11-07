import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Inject,
  ParseUUIDPipe,
  ValidationPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
//import { UpdateVideoDto } from './dto/update-video.dto';
//import { SearchVideoDto } from './dto/search-videos.dto';
//import { VideoCollectionPresenter, VideoPresenter } from './videos.presenter';
import { CreateVideoUseCase } from '../../core/video/application/use-cases/create-video/create-video.use-case';
import { UpdateVideoUseCase } from '../../core/video/application/use-cases/update-video/update-video.use-case';
//import { DeleteVideoUseCase } from '../../core/video/application/use-cases/delete-video/delete-video.use-case';
import { GetVideoUseCase } from '../../core/video/application/use-cases/get-video/get-video.use-case';
//import { ListVideosUseCase } from '../../core/video/application/use-cases/list-videos/list-videos.use-case';
import { UpdateVideoInput } from '../../core/video/application/use-cases/update-video/update-video.input';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateVideoDto } from './dto/update-video.dto';
import { UploadAudioVideoMediasUseCase } from '../../core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { VideoOutput } from '../../core/video/application/use-cases/common/video-output';
import { UploadAudioVideoMediaInput } from '../../core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-media.input';
import { ValidateUploadImageMediaInput } from '../../core/video/application/use-cases/upload-image-medias/upload-image-media.input';

@Controller('videos')
export class VideosController {
  @Inject(CreateVideoUseCase)
  private createUseCase: CreateVideoUseCase;

  @Inject(UpdateVideoUseCase)
  private updateUseCase: UpdateVideoUseCase;

  @Inject(UploadAudioVideoMediasUseCase)
  private uploadAudioVideoMedia: UploadAudioVideoMediasUseCase;

  // @Inject(DeleteVideoUseCase)
  // private deleteUseCase: DeleteVideoUseCase;

  @Inject(GetVideoUseCase)
  private getUseCase: GetVideoUseCase;

  // @Inject(ListVideosUseCase)
  // private listUseCase: ListVideosUseCase;

  @Post()
  async create(@Body() createVideoDto: CreateVideoDto) {
    const output = await this.createUseCase.execute(createVideoDto);
    //return VideosController.serialize(output);
    return output;
  }

  // @Get()
  // async search(@Query() searchParams: SearchVideoDto) {
  //   const output = await this.listUseCase.execute(searchParams);
  //   return new VideoCollectionPresenter(output);
  // }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    const output = await this.getUseCase.execute({ id });
    return VideosController.serialize(output);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'thumbnail_half', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      thumbnail_half?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
    @Body() updateVideoDto: any,
  ) {
    const hasFiles = files ? Object.keys(files).length : false;
    const hasData = Object.keys(updateVideoDto).length;
    if (hasFiles && hasData) {
      throw new BadRequestException('Files and data cannot be sent together');
    }

    if (hasData) {
      const data = await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(updateVideoDto, {
        metatype: UpdateVideoDto,
        type: 'body',
      });
      const input = new UpdateVideoInput({ id, ...data });
      const output = await this.updateUseCase.execute(input);
      return output;
    }

    if (hasFiles && Object.keys(files).length > 1) {
      throw new BadRequestException('Only one file can be sent');
    }

    const fieldField = Object.keys(files)[0];

    const data: UploadAudioVideoMediaInput = {
      video_id: id,
      field: fieldField,
      file: {
        raw_name: files[fieldField][0].originalname,
        data: files[fieldField][0].buffer,
        mime_type: files[fieldField][0].mimetype,
        size: files[fieldField][0].size,
      },
    };

    const input = await new ValidationPipe({
      errorHttpStatusCode: 422,
    }).transform(data, {
      metatype: ValidateUploadImageMediaInput,
      type: 'body',
    });

    const output = await this.uploadAudioVideoMedia.execute(input);
    return output;

    // const input = new UpdateVideoInput({ id, ...updateVideoDto });
    // const output = await this.updateUseCase.execute(input);
    // return output;
    //return VideosController.serialize(output);
  }

  @Patch(':id/upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'thumbnail_half', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  uploadFile(
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      thumbnail_half?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
    @Body() data,
  ) {
    console.log(files, data);
  }

  // @HttpCode(204)
  // @Delete(':id')
  // remove(
  //   @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  // ) {
  //   return this.deleteUseCase.execute({ id });
  // }

  static serialize(output: VideoOutput) {
    //return new VideoPresenter(output);
  }
}
