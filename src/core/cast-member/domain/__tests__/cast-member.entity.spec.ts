import { Uuid } from '../../../shared/domain/value-objects/uuid.vo';
import { CastMemberType } from '../cast-member-type.vo';
import { CastMember } from '../cast-member.entity';

describe('CastMember Unit Tests', () => {
  let validateSpy: any;
  beforeEach(() => {
    validateSpy = jest.spyOn(CastMember, 'validate');
  });
  test('constructor of cast member', () => {
    const director = CastMemberType.createADirector();
    let castMember = new CastMember({
      name: 'test',
      type: director,
    });
    expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
    expect(castMember.name).toBe('test');
    expect(castMember.type).toEqual(director);
    expect(castMember.created_at).toBeInstanceOf(Date);

    const created_at = new Date();
    castMember = new CastMember({
      name: 'test',
      type: director,
      created_at,
    });
    expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
    expect(castMember.name).toBe('test');
    expect(castMember.type).toEqual(director);
    expect(castMember.created_at).toBe(created_at);
  });

  describe('id field', () => {
    const actor = CastMemberType.createADirector();
    const arrange = [
      { name: 'Movie', type: actor },
      { name: 'Movie', type: actor, id: null },
      { name: 'Movie', type: actor, id: undefined },
      { name: 'Movie', type: actor, id: new Uuid() },
    ];

    test.each(arrange)('when props is %j', (item) => {
      const castMember = new CastMember(item);
      expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
    });
  });

  describe('create command', () => {
    test('should create a cast member', () => {
      const actor = CastMemberType.createADirector();
      const castMember = CastMember.create({
        name: 'test',
        type: actor,
      });
      expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
      expect(castMember.name).toBe('test');
      expect(castMember.type).toEqual(actor);
      expect(castMember.created_at).toBeInstanceOf(Date);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('cast_member_id field', () => {
    const arrange = [{ id: null }, { id: undefined }, { id: new Uuid() }];

    test.each(arrange)('should be is %j', (props) => {
      const castMember = new CastMember(props as any);
      expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
    });
  });

  test('should change name', () => {
    const actor = CastMemberType.createADirector();
    const castMember = CastMember.create({
      name: 'test',
      type: actor,
    });
    castMember.changeName('new name');
    expect(castMember.name).toBe('new name');
    expect(validateSpy).toHaveBeenCalledTimes(2);
  });

  test('should change type', () => {
    const actor = CastMemberType.createADirector();
    const castMember = CastMember.create({
      name: 'test',
      type: actor,
    });
    const director = CastMemberType.createADirector();
    castMember.changeType(director);
    expect(castMember.type).toEqual(director);
    expect(validateSpy).toHaveBeenCalledTimes(2);
  });
});

describe('CastMember Validator', () => {
  describe('create command', () => {
    test('should an invalid cast member with name property', () => {
      expect(() =>
        CastMember.create({ name: null } as any),
      ).containsErrorMessages({
        name: [
          'name should not be empty',
          'name must be a string',
          'name must be shorter than or equal to 255 characters',
        ],
      });

      expect(() =>
        CastMember.create({ name: '' } as any),
      ).containsErrorMessages({
        name: ['name should not be empty'],
      });

      expect(() => CastMember.create({ name: 5 } as any)).containsErrorMessages(
        {
          name: [
            'name must be a string',
            'name must be shorter than or equal to 255 characters',
          ],
        },
      );

      expect(() =>
        CastMember.create({ name: 't'.repeat(256) } as any),
      ).containsErrorMessages({
        name: ['name must be shorter than or equal to 255 characters'],
      });
    });

    it('should a invalid cast member using type property', () => {
      expect(() =>
        CastMember.create({ type: null } as any),
      ).containsErrorMessages({
        type: [
          'type should not be empty',
          'type must be an instance of CastMemberType',
        ],
      });

      expect(() =>
        CastMember.create({ type: '' } as any),
      ).containsErrorMessages({
        type: [
          'type should not be empty',
          'type must be an instance of CastMemberType',
        ],
      });

      expect(() => CastMember.create({ type: 5 } as any)).containsErrorMessages(
        {
          type: ['type must be an instance of CastMemberType'],
        },
      );
    });
  });

  describe('changeName method', () => {
    it('should a invalid cast member using name property', () => {
      const director = CastMemberType.createADirector();
      const castMember = CastMember.create({
        name: 'Movie',
        type: director,
      });
      expect(() => castMember.changeName(null)).containsErrorMessages({
        name: [
          'name should not be empty',
          'name must be a string',
          'name must be shorter than or equal to 255 characters',
        ],
      });

      expect(() => castMember.changeName('')).containsErrorMessages({
        name: ['name should not be empty'],
      });

      expect(() => castMember.changeName(5 as any)).containsErrorMessages({
        name: [
          'name must be a string',
          'name must be shorter than or equal to 255 characters',
        ],
      });

      expect(() =>
        castMember.changeName('t'.repeat(256)),
      ).containsErrorMessages({
        name: ['name must be shorter than or equal to 255 characters'],
      });
    });
  });

  describe('changeType method', () => {
    it('should a invalid cast member using type property', () => {
      const director = CastMemberType.createADirector();
      const castMember = CastMember.create({
        name: 'Movie',
        type: director,
      } as any);
      expect(() => castMember.changeType(null)).containsErrorMessages({
        type: [
          'type should not be empty',
          'type must be an instance of CastMemberType',
        ],
      });

      expect(() => castMember.changeType('' as any)).containsErrorMessages({
        type: [
          'type should not be empty',
          'type must be an instance of CastMemberType',
        ],
      });

      expect(() => castMember.changeType(5 as any)).containsErrorMessages({
        type: ['type must be an instance of CastMemberType'],
      });
    });
  });
});
