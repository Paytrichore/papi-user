import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { PeblobDraftEventDto } from './dto/peblob-draft-event.dto';
import { UserRealtimeService } from './user-realtime.service';
import { UserService } from './user.service';
import { WebhookSignatureService } from './webhook-signature.service';

interface RawBodyRequest extends Request {
  rawBody?: string;
}

@Controller('webhooks')
export class UserWebhookController {
  constructor(
    private readonly userService: UserService,
    private readonly signatureService: WebhookSignatureService,
    private readonly userRealtimeService: UserRealtimeService,
  ) {}

  @Post('peblob-draft-created')
  async handlePeblobDraftCreated(
    @Body() event: PeblobDraftEventDto,
    @Headers('x-webhook-signature') signature: string | undefined,
    @Headers('x-webhook-timestamp') timestamp: string | undefined,
    @Req() req: RawBodyRequest,
  ) {
    const rawBody = req.rawBody ?? JSON.stringify(event);

    this.signatureService.assertValidSignature(signature, timestamp, rawBody);

    const result = await this.userService.markDraftFromEvent(event);

    this.userRealtimeService.publish(event.userId, {
      type: 'draft.updated',
      payload: {
        drafted: result.user.drafted,
        peblobId: event.peblobId,
        eventId: event.eventId,
        status: result.status,
      },
    });

    return {
      status: result.status,
      userId: event.userId,
      eventId: event.eventId,
    };
  }
}
