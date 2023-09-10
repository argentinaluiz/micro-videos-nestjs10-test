import { UnitOfWorkFakeInMemory } from '../../../infra/db/in-memory/fake-unit-work-in-memory';
import { AggregateRoot } from '../../aggregate-root';
import { NotFoundError } from '../../errors/not-found.error';
import { Uuid } from '../../value-objects/uuid.vo';
import { InMemoryRepository } from '../in-memory.repository';

type StubAggregateConstructorProps = {
  entity_id?: Uuid;
  name: string;
  price: number;
};

class StubAggregate extends AggregateRoot {
  entity_id: Uuid;
  name: string;
  price: number;
  constructor(props: StubAggregateConstructorProps) {
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

class StubInMemoryRepository extends InMemoryRepository<StubAggregate, Uuid> {
  getAggregate(): new (...args: any[]) => StubAggregate {
    return StubAggregate;
  }
}

describe('InMemoryRepository Unit Tests', () => {
  let repository: StubInMemoryRepository;
  beforeEach(
    () =>
      (repository = new StubInMemoryRepository(new UnitOfWorkFakeInMemory())),
  );
  it('should inserts a new aggregate', async () => {
    const aggregate = new StubAggregate({ name: 'name value', price: 5 });
    await repository.insert(aggregate);
    expect(aggregate.toJSON()).toStrictEqual(repository.items[0].toJSON());
  });

  it('should finds a aggregate by id', async () => {
    let aggregateFound = await repository.findById(new Uuid());
    expect(aggregateFound).toBeNull();

    const aggregate = new StubAggregate({ name: 'name value', price: 5 });
    await repository.insert(aggregate);

    aggregateFound = await repository.findById(aggregate.entity_id);
    expect(aggregate.toJSON()).toStrictEqual(aggregateFound.toJSON());

    aggregateFound = await repository.findById(aggregate.entity_id);
    expect(aggregate.toJSON()).toStrictEqual(aggregateFound.toJSON());
  });

  it('should returns all entities', async () => {
    const aggregate = new StubAggregate({ name: 'name value', price: 5 });
    await repository.insert(aggregate);

    const entities = await repository.findAll();

    expect(entities).toStrictEqual([aggregate]);
  });

  it('should throws error on update when aggregate not found', () => {
    const aggregate = new StubAggregate({ name: 'name value', price: 5 });
    expect(repository.update(aggregate)).rejects.toThrow(
      new NotFoundError(aggregate.entity_id, StubAggregate),
    );
  });

  it('should updates an aggregate', async () => {
    const aggregate = new StubAggregate({ name: 'name value', price: 5 });
    await repository.insert(aggregate);

    const aggregateUpdated = new StubAggregate({
      entity_id: aggregate.entity_id,
      name: 'updated',
      price: 1,
    });
    await repository.update(aggregateUpdated);
    expect(aggregateUpdated.toJSON()).toStrictEqual(
      repository.items[0].toJSON(),
    );
  });

  it('should throws error on delete when aggregate not found', () => {
    const uuid = new Uuid();
    expect(repository.delete(uuid)).rejects.toThrow(
      new NotFoundError(uuid.id, StubAggregate),
    );

    expect(
      repository.delete(new Uuid('9366b7dc-2d71-4799-b91c-c64adb205104')),
    ).rejects.toThrow(
      new NotFoundError('9366b7dc-2d71-4799-b91c-c64adb205104', StubAggregate),
    );
  });

  it('should deletes an entity', async () => {
    const entity = new StubAggregate({ name: 'name value', price: 5 });
    await repository.insert(entity);

    await repository.delete(entity.entity_id);
    expect(repository.items).toHaveLength(0);

    await repository.insert(entity);

    await repository.delete(entity.entity_id);
    expect(repository.items).toHaveLength(0);
  });
});
