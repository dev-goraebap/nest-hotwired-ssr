export class Result {
  private readonly data: any;
  private readonly message: string;
  private readonly isSuccess: boolean;

  constructor(data: any, message: string, isSuccess: boolean) {
    this.data = data;
    this.message = message;
    this.isSuccess = isSuccess;
  }

  static success(data: any, message: string = '작업이 성공하였습니다.') {
    return new Result(data, message, true);
  }

  static failure(message: string = '작업이 실패하였습니다.') {
    return new Result(null, message, false);
  }
}
