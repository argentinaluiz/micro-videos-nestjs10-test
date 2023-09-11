import { InMemorySearchableRepository } from '../../../../shared/domain/repository/in-memory.repository';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { Video, VideoId } from '../../../domain/video.aggregate';
import {
  IVideoRepository,
  VideoFilter,
} from '../../../domain/video.repository';

export class VideoInMemoryRepository
  extends InMemorySearchableRepository<Video, VideoId, VideoFilter>
  implements IVideoRepository
{
  sortableFields: string[] = ['title', 'created_at'];

  getAggregate(): new (...args: any[]) => Video {
    return Video;
  }

  protected async applyFilter(
    items: Video[],
    filter: VideoFilter,
  ): Promise<Video[]> {
    if (!filter) {
      return items;
    }

    return items.filter((i) => {
      const containsTitle =
        filter.title &&
        i.title.toLowerCase().includes(filter.title.toLowerCase());
      const containsCategoriesId =
        filter.categories_id &&
        filter.categories_id.some((c) => i.categories_id.has(c.id));
      const containsGenreId =
        filter.genres_id && filter.genres_id.some((c) => i.genres_id.has(c.id));
      const containsCastMemberId =
        filter.cast_members_id &&
        filter.cast_members_id.some((c) => i.cast_members_id.has(c.id));

      const filterMap = [
        [filter.title, containsTitle],
        [filter.categories_id, containsCategoriesId],
        [filter.genres_id, containsGenreId],
        [filter.cast_members_id, containsCastMemberId],
      ].filter((i) => i[0]);

      return filterMap.every((i) => i[1]);
    });
  }

  protected async applySort(
    items: Video[],
    sort: string | null,
    sort_dir: SortDirection | null,
  ): Promise<Video[]> {
    return !sort
      ? super.applySort(items, 'created_at', 'desc')
      : super.applySort(items, sort, sort_dir);
  }
}
