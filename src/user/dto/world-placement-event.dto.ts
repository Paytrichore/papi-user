import {
  IsISO8601,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class WorldPlacementPointsEventDto {
  @IsIn(['world-placement-points-spent'])
  eventType: 'world-placement-points-spent';

  @IsUUID()
  eventId: string;

  @IsISO8601()
  occurredAt: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  points: 2;

  @IsString()
  @IsNotEmpty()
  peblobId: string;

  @IsInt()
  x: number;

  @IsInt()
  y: number;

  @IsUUID()
  correlationId: string;
}

export class WorldPlacementPointsRefundEventDto {
  @IsIn(['world-placement-points-refunded'])
  eventType: 'world-placement-points-refunded';

  @IsUUID()
  eventId: string;

  @IsISO8601()
  occurredAt: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  points: 2;

  @IsString()
  @IsNotEmpty()
  peblobId: string;

  @IsInt()
  x: number;

  @IsInt()
  y: number;

  @IsUUID()
  correlationId: string;
}
