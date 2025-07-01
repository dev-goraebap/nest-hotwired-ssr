import * as vision from '@google-cloud/vision';
import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  GOOGLE_VISION_OPTIONS,
  GoogleVisionOptions,
} from './google-vision-options.factory';

@Injectable()
export class GoogleVisionService {
  private readonly logger = new Logger(GoogleVisionService.name);
  private client: vision.v1.ImageAnnotatorClient;

  constructor(
    @Inject(GOOGLE_VISION_OPTIONS)
    private readonly options: GoogleVisionOptions,
  ) {
    // 환경변수 GOOGLE_APPLICATION_CREDENTIALS 또는 직접 keyFilename 지정 가능
    this.client = new vision.v1.ImageAnnotatorClient({
      // keyFilename: '경로/서비스계정.json', // 필요시 지정
      keyFilename: this.options.keyFilename,
    });
    this.logger.debug('Init GoogleVisionService');
  }

  // 이미지에서 텍스트 추출
  async extractTextLines(buffer: Buffer): Promise<string[]> {
    try {
      const [result] = await this.client.textDetection({
        image: { content: buffer },
      });
      const annotations = result.textAnnotations;
      if (!annotations || annotations.length === 0) return [];
      return (
        annotations[0].description
          ?.split('\n')
          .map((line) => line.trim())
          .filter(Boolean) ?? []
      );
    } catch (e) {
      this.logger.error('Google Vision API 오류:', e);
      throw new Error('이미지 텍스트 추출 중 오류');
    }
  }

  // 이미지에서 대표 색상 추출
  async extractColors(
    buffer: Buffer,
  ): Promise<
    { hex: string; rgb: string; score: number; pixelFraction: number }[]
  > {
    try {
      const [result] = await this.client.imageProperties({
        image: { content: buffer },
      });
      const colors =
        result.imagePropertiesAnnotation?.dominantColors?.colors ?? [];
      return colors.map((colorInfo) => {
        const { red, green, blue } = colorInfo.color!;
        return {
          hex: `#${this.toHex(red)}${this.toHex(green)}${this.toHex(blue)}`,
          rgb: `rgb(${red}, ${green}, ${blue})`,
          score: colorInfo.score ?? 0,
          pixelFraction: colorInfo.pixelFraction ?? 0,
        };
      });
    } catch (e) {
      this.logger.error('Google Vision 색상 추출 오류:', e);
      return [];
    }
  }

  private toHex(value: number | null | undefined): string {
    return (value ?? 0).toString(16).padStart(2, '0');
  }
}
