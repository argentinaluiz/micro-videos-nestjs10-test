import { ImageMedia } from '../image-media.vo';

describe('ImageMedia Unit Tests', () => {
  describe('constructor', () => {
    it('should create a valid ImageMedia object', () => {
      // Arrange
      const checksum = 'checksum';
      const name = 'name';
      const location = 'location';

      // Act
      const imageMedia = new ImageMedia({ checksum, name, location });

      // Assert
      expect(imageMedia).toBeDefined();
      expect(imageMedia.checksum).toEqual(checksum);
      expect(imageMedia.name).toEqual(name);
      expect(imageMedia.location).toEqual(location);
    });
  });

  describe('toJSON', () => {
    it('should return a JSON object with the ImageMedia properties', () => {
      // Arrange
      const checksum = 'checksum';
      const name = 'name';
      const location = 'location';
      const imageMedia = new ImageMedia({ checksum, name, location });

      // Act
      const json = imageMedia.toJSON();

      // Assert
      expect(json).toBeDefined();
      expect(json).toEqual({ checksum, name, location });
    });
  });
});
