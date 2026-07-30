import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserEntity, UserDocument } from './user.model';
import { UserService } from './user.service';
import { PeblobDraftEventDto } from './dto/peblob-draft-event.dto';

describe('UserService markDraftFromEvent', () => {
  let service: UserService;

  const mockModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(UserEntity.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('marks draft from a new event', async () => {
    const user = {
      drafted: false,
      processedEventIds: [],
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as UserDocument;

    const event: PeblobDraftEventDto = {
      eventType: 'peblob-created-from-draft',
      eventId: '7f718931-f6c7-4d01-81f9-4ef79d5baf47',
      occurredAt: '2026-07-30T10:00:00.000Z',
      userId: 'user-1',
      peblobId: 'peblob-1',
      correlationId: 'corr-1',
    };

    jest.spyOn(service, 'checkAndUpdateDLA').mockResolvedValue(user);

    const result = await service.markDraftFromEvent(event);

    expect(result.status).toBe('processed');
    expect(result.user.drafted).toBe(true);
    expect(result.user.processedEventIds).toContain(event.eventId);
    expect(result.user.lastDraftPeblobId).toBe(event.peblobId);
    expect(result.user.save).toHaveBeenCalledTimes(1);
  });

  it('returns duplicate when event already processed', async () => {
    const user = {
      drafted: true,
      processedEventIds: ['7f718931-f6c7-4d01-81f9-4ef79d5baf47'],
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as UserDocument;

    const event: PeblobDraftEventDto = {
      eventType: 'peblob-created-from-draft',
      eventId: '7f718931-f6c7-4d01-81f9-4ef79d5baf47',
      occurredAt: '2026-07-30T10:00:00.000Z',
      userId: 'user-1',
      peblobId: 'peblob-1',
      correlationId: 'corr-1',
    };

    jest.spyOn(service, 'checkAndUpdateDLA').mockResolvedValue(user);

    const result = await service.markDraftFromEvent(event);

    expect(result.status).toBe('duplicate');
    expect(result.user.save).not.toHaveBeenCalled();
  });
});
