import { CastMemberId } from '../../../cast-member/domain/cast-member.aggregate';
import { CategoryId } from '../../../category/domain/category.aggregate';
import { GenreId } from '../../../genre/domain/genre.aggregate';
import { VideoSearchParams } from '../video.repository';

describe('VideoSearchParams', () => {
  describe('create', () => {
    it('should create a new instance with default values', () => {
      const searchParams = VideoSearchParams.create();

      expect(searchParams).toBeInstanceOf(VideoSearchParams);
      expect(searchParams.filter).toBeNull();
    });

    it('should create a new instance with provided values', () => {
      const arrange = [
        { input: { title: 'Movie' }, expected: { title: 'Movie' } },
        {
          input: { categories_id: ['123e4567-e89b-12d3-a456-426655440000'] },
          expected: {
            categories_id: [
              new CategoryId('123e4567-e89b-12d3-a456-426655440000'),
            ],
          },
        },
        {
          input: { genres_id: ['123e4567-e89b-12d3-a456-426655440000'] },
          expected: {
            genres_id: [new GenreId('123e4567-e89b-12d3-a456-426655440000')],
          },
        },
        {
          input: { cast_members_id: ['6b1e1e7e-0c4c-4f31-ae6d-1d9cfc2b4d9e'] },
          expected: {
            cast_members_id: [
              new CastMemberId('6b1e1e7e-0c4c-4f31-ae6d-1d9cfc2b4d9e'),
            ],
          },
        },
        {
          input: {
            title: 'Movie',
            categories_id: ['123e4567-e89b-12d3-a456-426655440000'],
            genres_id: ['123e4567-e89b-12d3-a456-426655440000'],
            cast_members_id: ['6b1e1e7e-0c4c-4f31-ae6d-1d9cfc2b4d9e'],
          },
          expected: {
            title: 'Movie',
            categories_id: [
              new CategoryId('123e4567-e89b-12d3-a456-426655440000'),
            ],
            genres_id: [new GenreId('123e4567-e89b-12d3-a456-426655440000')],
            cast_members_id: [
              new CastMemberId('6b1e1e7e-0c4c-4f31-ae6d-1d9cfc2b4d9e'),
            ],
          },
        },
      ];

      arrange.forEach((item) => {
        const searchParams = VideoSearchParams.create({
          filter: item.input,
        });
        expect(searchParams).toBeInstanceOf(VideoSearchParams);
        expect(searchParams.filter).toEqual(item.expected);
      });
    });
  });
});
