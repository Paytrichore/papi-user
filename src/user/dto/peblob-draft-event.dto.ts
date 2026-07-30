import { IsIn, IsISO8601, IsString, IsUUID } from 'class-validator';

export class PeblobDraftEventDto {
  @IsIn(['peblob-created-from-draft'])
  eventType: 'peblob-created-from-draft';

  @IsUUID()
  eventId: string;

  @IsISO8601()
  occurredAt: string;

  @IsString()
  userId: string;

  @IsString()
  peblobId: string;

  @IsString()
  correlationId: string;
}
