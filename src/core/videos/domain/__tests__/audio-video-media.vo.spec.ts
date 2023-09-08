import {
  AudioVideoMedia,
  AudioVideoMediaStatus,
} from '../audio-video-media.vo';

describe('AudioVideoMedia Unit Tests', () => {
  describe('constructor', () => {
    it('should create a valid AudioVideoMedia object', () => {
      // Arrange
      const checksum = 'checksum';
      const name = 'name';
      const raw_location = 'raw_location';
      const encoded_location = 'encoded_location';
      const status = AudioVideoMediaStatus.PENDING;

      // Act
      const audioVideoMedia = new AudioVideoMedia({
        checksum,
        name,
        raw_location,
        encoded_location,
        status,
      });

      // Assert
      expect(audioVideoMedia).toBeDefined();
      expect(audioVideoMedia.checksum).toEqual(checksum);
      expect(audioVideoMedia.name).toEqual(name);
      expect(audioVideoMedia.raw_location).toEqual(raw_location);
      expect(audioVideoMedia.encoded_location).toEqual(encoded_location);
      expect(audioVideoMedia.status).toEqual(status);
    });
  });

  describe('create', () => {
    it('should create a valid AudioVideoMedia object with status PENDING', () => {
      // Arrange
      const checksum = 'checksum';
      const name = 'name';
      const raw_location = 'raw_location';
      const status = AudioVideoMediaStatus.PENDING;

      // Act
      const audioVideoMedia = AudioVideoMedia.create({
        checksum,
        name,
        raw_location,
      });

      // Assert
      expect(audioVideoMedia).toBeDefined();
      expect(audioVideoMedia.checksum).toEqual(checksum);
      expect(audioVideoMedia.name).toEqual(name);
      expect(audioVideoMedia.raw_location).toEqual(raw_location);
      expect(audioVideoMedia.encoded_location).toEqual(null);
      expect(audioVideoMedia.status).toEqual(status);
    });
  });

  describe('process', () => {
    it('should create a valid AudioVideoMedia object with status PROCESSING', () => {
      // Arrange
      const checksum = 'checksum';
      const name = 'name';
      const raw_location = 'raw_location';
      const audioVideoMedia = AudioVideoMedia.create({
        checksum,
        name,
        raw_location,
      });

      // Act
      const audioVideoMediaProcessing = audioVideoMedia.process();

      // Assert
      expect(audioVideoMediaProcessing).toBeDefined();
      expect(audioVideoMediaProcessing.checksum).toEqual(checksum);
      expect(audioVideoMediaProcessing.name).toEqual(name);
      expect(audioVideoMediaProcessing.raw_location).toEqual(raw_location);
      expect(audioVideoMediaProcessing.encoded_location).toEqual(null);
      expect(audioVideoMediaProcessing.status).toEqual(
        AudioVideoMediaStatus.PROCESSING,
      );
    });
  });

  describe('complete', () => {
    it('should create a valid AudioVideoMedia object with status COMPLETED', () => {
      // Arrange
      const checksum = 'checksum';
      const name = 'name';
      const raw_location = 'raw_location';
      const encoded_location = 'encoded_location';
      const audioVideoMedia = AudioVideoMedia.create({
        checksum,
        name,
        raw_location,
      });

      // Act
      const audioVideoMediaCompleted =
        audioVideoMedia.complete(encoded_location);

      // Assert
      expect(audioVideoMediaCompleted).toBeDefined();
      expect(audioVideoMediaCompleted.checksum).toEqual(checksum);
      expect(audioVideoMediaCompleted.name).toEqual(name);
      expect(audioVideoMediaCompleted.raw_location).toEqual(raw_location);
      expect(audioVideoMediaCompleted.encoded_location).toEqual(
        encoded_location,
      );
      expect(audioVideoMediaCompleted.status).toEqual(
        AudioVideoMediaStatus.COMPLETED,
      );
    });
  });

  describe('fail', () => {
    it('should create a valid AudioVideoMedia object with status FAILED', () => {
      // Arrange
      const checksum = 'checksum';
      const name = 'name';
      const raw_location = 'raw_location';
      const audioVideoMedia = AudioVideoMedia.create({
        checksum,
        name,
        raw_location,
      });

      // Act
      const audioVideoMediaFailed = audioVideoMedia.fail();

      // Assert
      expect(audioVideoMediaFailed).toBeDefined();
      expect(audioVideoMediaFailed.checksum).toEqual(checksum);
      expect(audioVideoMediaFailed.name).toEqual(name);
      expect(audioVideoMediaFailed.raw_location).toEqual(raw_location);
      expect(audioVideoMediaFailed.encoded_location).toEqual(null);
      expect(audioVideoMediaFailed.status).toEqual(
        AudioVideoMediaStatus.FAILED,
      );
    });
  });

  describe('toJSON', () => {
    it('should return a JSON object with the AudioVideoMedia properties', () => {
      // Arrange
      const checksum = 'checksum';
      const name = 'name';
      const raw_location = 'raw_location';
      const encoded_location = 'encoded_location';
      const status = AudioVideoMediaStatus.PENDING;
      const audioVideoMedia = new AudioVideoMedia({
        checksum,
        name,
        raw_location,
        encoded_location,
        status,
      });

      // Act
      const json = audioVideoMedia.toJSON();

      // Assert
      expect(json).toBeDefined();
      expect(json).toEqual({
        checksum,
        name,
        raw_location,
        encoded_location,
        status,
      });
    });
  });
});
