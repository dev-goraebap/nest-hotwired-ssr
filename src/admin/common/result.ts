export class Result<T = any> {
  readonly success: boolean;
  readonly data: T | null;
  readonly failure: boolean;
  readonly messages: string[];

  private constructor(
    success: boolean,
    data: T | null = null,
    messages: string[] = [],
  ) {
    this.success = success;
    this.data = data;
    this.failure = !success;
    this.messages = messages;
  }

  /**
   * 첫 번째 메시지만 반환
   */
  get firstMessage(): string | null {
    return this.messages.length > 0 ? this.messages[0] : null;
  }

  /**
   * 모든 메시지를 배열로 반환
   */
  get fullMessages(): string[] {
    return this.messages;
  }

  /**
   * 성공 결과 생성
   */
  static success<U>(data?: U, message?: string): Result<U> {
    const messages = message ? [message] : [];
    return new Result<U>(true, data || null, messages);
  }

  /**
   * 실패 결과 생성
   */
  static failure<U>(messages: string | string[]): Result<U> {
    const messageArray = Array.isArray(messages) ? messages : [messages];
    return new Result<U>(false, null, messageArray);
  }

  /**
   * 값이 존재하면 성공, 없으면 실패 결과 생성
   */
  static from<U>(data: U | null | undefined, errorMessage: string): Result<U> {
    if (data === null || data === undefined) {
      return Result.failure<U>(errorMessage);
    }
    return Result.success<U>(data);
  }
}
