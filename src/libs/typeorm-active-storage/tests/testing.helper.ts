export class TestingHelper {
  /**
   * @description
   * 네트워크 요청으로 넘어온 파일인척하는 파일 제공
   */
  static createRealMulterFile(
    originalname: string = 'test.txt',
    mimetype: string = 'text/plain',
    content: string = 'test file content',
  ): Promise<Express.Multer.File> {
    return new Promise((resolve) => {
      // 수동으로 파일 데이터 설정
      const buffer = Buffer.from(content);
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname,
        encoding: '7bit',
        mimetype,
        size: buffer.length,
        buffer,
        destination: '',
        filename: 'test.txt',
        path: '',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        stream: undefined as any,
      };
      resolve(file);
    });
  }
}
