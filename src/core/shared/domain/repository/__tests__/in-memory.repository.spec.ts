import { Entity } from '../../entity';
import { NotFoundError } from '../../errors/not-found.error';
import { Uuid } from '../../value-objects/uuid.vo';
import { InMemoryRepository } from '../in-memory.repository';

type StubEntityConstructorProps = {
  entity_id?: Uuid;
  name: string;
  price: number;
};

class StubEntity extends Entity {
  entity_id: Uuid;
  name: string;
  price: number;
  constructor(props: StubEntityConstructorProps) {
    super();
    this.entity_id = props.entity_id ?? new Uuid();
    this.name = props.name;
    this.price = +props.price;
  }

  toJSON() {
    return {
      id: this.entity_id.id,
      name: this.name,
      price: this.price,
    };
  }
}

class StubInMemoryRepository extends InMemoryRepository<StubEntity, Uuid> {
  getEntity(): new (...args: any[]) => StubEntity {
    return StubEntity;
  }
}

describe('InMemoryRepository Unit Tests', () => {
  let repository: StubInMemoryRepository;
  beforeEach(() => (repository = new StubInMemoryRepository()));
  it('should inserts a new entity', async () => {
    const entity = new StubEntity({ name: 'name value', price: 5 });
    await repository.insert(entity);
    expect(entity.toJSON()).toStrictEqual(repository.items[0].toJSON());
  });

  it('should finds a entity by id', async () => {
    let entityFound = await repository.findById(new Uuid());
    expect(entityFound).toBeNull();

    const entity = new StubEntity({ name: 'name value', price: 5 });
    await repository.insert(entity);

    entityFound = await repository.findById(entity.entity_id);
    expect(entity.toJSON()).toStrictEqual(entityFound.toJSON());

    entityFound = await repository.findById(entity.entity_id);
    expect(entity.toJSON()).toStrictEqual(entityFound.toJSON());
  });

  it('should returns all entities', async () => {
    const entity = new StubEntity({ name: 'name value', price: 5 });
    await repository.insert(entity);

    const entities = await repository.findAll();

    expect(entities).toStrictEqual([entity]);
  });

  it('should throws error on update when entity not found', () => {
    const entity = new StubEntity({ name: 'name value', price: 5 });
    expect(repository.update(entity)).rejects.toThrow(
      new NotFoundError(entity.entity_id, StubEntity),
    );
  });

  it('should updates an entity', async () => {
    const entity = new StubEntity({ name: 'name value', price: 5 });
    await repository.insert(entity);

    const entityUpdated = new StubEntity({
      entity_id: entity.entity_id,
      name: 'updated',
      price: 1,
    });
    await repository.update(entityUpdated);
    expect(entityUpdated.toJSON()).toStrictEqual(repository.items[0].toJSON());
  });

  it('should throws error on delete when entity not found', () => {
    const uuid = new Uuid();
    expect(repository.delete(uuid)).rejects.toThrow(
      new NotFoundError(uuid.id, StubEntity),
    );

    expect(
      repository.delete(new Uuid('9366b7dc-2d71-4799-b91c-c64adb205104')),
    ).rejects.toThrow(
      new NotFoundError('9366b7dc-2d71-4799-b91c-c64adb205104', StubEntity),
    );
  });

  it('should deletes an entity', async () => {
    const entity = new StubEntity({ name: 'name value', price: 5 });
    await repository.insert(entity);

    await repository.delete(entity.entity_id);
    expect(repository.items).toHaveLength(0);

    await repository.insert(entity);

    await repository.delete(entity.entity_id);
    expect(repository.items).toHaveLength(0);
  });
});
