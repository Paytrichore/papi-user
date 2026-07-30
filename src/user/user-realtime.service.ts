import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export interface UserRealtimeEvent {
  type: 'draft.updated';
  payload: {
    drafted: boolean;
    peblobId: string;
    eventId: string;
    status: 'processed' | 'duplicate';
  };
}

@Injectable()
export class UserRealtimeService {
  private readonly streams = new Map<string, Subject<MessageEvent>>();

  subscribe(userId: string): Observable<MessageEvent> {
    if (!this.streams.has(userId)) {
      this.streams.set(userId, new Subject<MessageEvent>());
    }

    return this.streams.get(userId)!.asObservable();
  }

  publish(userId: string, event: UserRealtimeEvent): void {
    const stream = this.streams.get(userId);
    if (!stream) {
      return;
    }

    stream.next({ data: event });
  }
}
