import { Test, TestingModule } from '@nestjs/testing';
import {
  RawBodyRequest,
  UserWebhookController,
} from './user-webhook.controller';
import { UserService } from './user.service';
import { WebhookSignatureService } from './webhook-signature.service';
import { UserRealtimeService } from './user-realtime.service';
import { PeblobDraftEventDto } from './dto/peblob-draft-event.dto';

describe('UserWebhookController', () => {
  let controller: UserWebhookController;

  const mockUserService = {
    markDraftFromEvent: jest.fn(),
  };

  const mockSignatureService = {
    assertValidSignature: jest.fn(),
  };

  const mockRealtimeService = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserWebhookController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: WebhookSignatureService,
          useValue: mockSignatureService,
        },
        {
          provide: UserRealtimeService,
          useValue: mockRealtimeService,
        },
      ],
    }).compile();

    controller = module.get<UserWebhookController>(UserWebhookController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('validates signature, processes event and publishes realtime update', async () => {
    const event: PeblobDraftEventDto = {
      eventType: 'peblob-created-from-draft',
      eventId: '7f718931-f6c7-4d01-81f9-4ef79d5baf47',
      occurredAt: '2026-07-30T10:00:00.000Z',
      userId: 'user-1',
      peblobId: 'peblob-1',
      correlationId: 'corr-1',
    };

    mockUserService.markDraftFromEvent.mockResolvedValue({
      status: 'processed',
      user: { drafted: true },
    });

    const response = await controller.handlePeblobDraftCreated(
      event,
      'sha256=signature',
      String(Date.now()),
      { rawBody: JSON.stringify(event) } as RawBodyRequest,
    );

    expect(mockSignatureService.assertValidSignature).toHaveBeenCalled();
    expect(mockUserService.markDraftFromEvent).toHaveBeenCalledWith(event);
    expect(mockRealtimeService.publish).toHaveBeenCalledWith(
      event.userId,
      expect.objectContaining({ type: 'draft.updated' }),
    );
    expect(response.status).toBe('processed');
  });
});
