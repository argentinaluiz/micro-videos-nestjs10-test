import { validate as uuidValidate } from 'uuid';
import InvalidUuidError, { Uuid } from '../uuid.vo';

describe('Uuid Unit Tests', () => {
  const validateSpy = jest.spyOn(Uuid.prototype as any, 'validate');

  test('should throw error when uuid is invalid', () => {
    expect(() => new Uuid('invalid-uuid')).toThrowError(
      new InvalidUuidError('invalid-uuid'),
    );
    expect(validateSpy).toHaveBeenCalledTimes(1);
  });

  test('should accept a uuid passed in constructor', () => {
    const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';
    const vo = new Uuid(uuid);
    expect(vo.id).toBe(uuid);
    expect(validateSpy).toHaveBeenCalledTimes(1);
  });

  test('should accept a uuid passed in constructor', () => {
    const vo = new Uuid();
    expect(uuidValidate(vo.id)).toBe(true);
    expect(validateSpy).toHaveBeenCalledTimes(1);
  });
});
