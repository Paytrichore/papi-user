import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';

@Injectable()
export class WebhookSignatureService {
  private readonly toleranceSeconds = Number(
    process.env.WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS ?? '300',
  );

  assertValidSignature(
    signatureHeader: string | undefined,
    timestampHeader: string | undefined,
    rawBody: string,
  ): void {
    const secret = process.env.WEBHOOK_SHARED_SECRET;
    if (!secret) {
      throw new UnauthorizedException('Webhook secret not configured');
    }

    if (!signatureHeader || !timestampHeader) {
      throw new UnauthorizedException('Missing webhook signature headers');
    }

    const timestampMs = Number(timestampHeader);
    if (!Number.isFinite(timestampMs)) {
      throw new UnauthorizedException('Invalid webhook timestamp');
    }

    const now = Date.now();
    const maxSkewMs = this.toleranceSeconds * 1000;
    if (Math.abs(now - timestampMs) > maxSkewMs) {
      throw new UnauthorizedException('Stale webhook timestamp');
    }

    const signedPayload = `${timestampHeader}.${rawBody}`;
    const expected = createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    const provided = signatureHeader.replace(/^sha256=/, '');
    const expectedBuffer = Buffer.from(expected, 'utf8');
    const providedBuffer = Buffer.from(provided, 'utf8');

    if (
      expectedBuffer.length !== providedBuffer.length ||
      !timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }
}
