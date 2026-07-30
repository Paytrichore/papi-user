import { UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { WebhookSignatureService } from './webhook-signature.service';

describe('WebhookSignatureService', () => {
  const fixedNow = 1735600000000;
  const secret = 'test-secret';
  const body = '{"eventType":"peblob-created-from-draft"}';
  let service: WebhookSignatureService;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow);
    process.env.WEBHOOK_SHARED_SECRET = secret;
    process.env.WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = '300';
    service = new WebhookSignatureService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.WEBHOOK_SHARED_SECRET;
    delete process.env.WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS;
  });

  it('accepts a valid signature', () => {
    const timestamp = String(fixedNow);
    const signature = createHmac('sha256', secret)
      .update(`${timestamp}.${body}`)
      .digest('hex');

    expect(() => {
      service.assertValidSignature(`sha256=${signature}`, timestamp, body);
    }).not.toThrow();
  });

  it('rejects an invalid signature', () => {
    const timestamp = String(fixedNow);

    expect(() => {
      service.assertValidSignature('sha256=bad-signature', timestamp, body);
    }).toThrow(UnauthorizedException);
  });

  it('rejects stale timestamps', () => {
    const staleTimestamp = String(fixedNow - 301000);
    const signature = createHmac('sha256', secret)
      .update(`${staleTimestamp}.${body}`)
      .digest('hex');

    expect(() => {
      service.assertValidSignature(`sha256=${signature}`, staleTimestamp, body);
    }).toThrow(UnauthorizedException);
  });
});
