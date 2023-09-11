import { VideoAudioUploadedIntegrationEvents } from '../../../video/domain/integration-events/video-audio-uploaded.int-event';

export const MessageIntegrationEventsMap = {
  [VideoAudioUploadedIntegrationEvents.name]: {
    exchange: 'amq.direct',
    routing_key: 'video.audio.uploaded',
  },
  ['test']: {
    exchange: 'test-exchange',
    routing_key: 'test-event',
  },
};
