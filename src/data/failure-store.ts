import { injectable } from 'inversify';

@injectable()
export class FailureStore {
  private failures: Map<string, string>;

  constructor() {
    this.failures = new Map<string, string>();

    // Set an interval to clear the failures every hour.
    setInterval(() => this.failures.clear(), 1000 * 60 * 60);
  }

  add(messageId: string, responseId: string): void {
    this.failures.set(messageId, responseId);
  }

  get(messageId: string): string | undefined {
    return this.failures.get(messageId);
  }

  remove(messageId: string): void {
    this.failures.delete(messageId);
  }

  contains(messageId: string): boolean {
    return this.failures.has(messageId);
  }
}
