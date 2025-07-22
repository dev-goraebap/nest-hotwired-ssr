import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TranslationService {
  private genAI: GoogleGenerativeAI;

  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')!;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const prompt = `
    - 다음 텍스트를 ${targetLanguage}로 번역해줘. 
    - 번역된 텍스트만 반환하고 다른 설명이나 형식은 포함하지말아줘:
    ${text}`;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await this.model.generateContent(prompt);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const response = await result.response;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
      return response.text().trim();
    } catch (error) {
      console.error('Translation error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`번역 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  async translateToEnglish(koreanText: string): Promise<string> {
    return this.translateText(koreanText, '영어');
  }

  async translateToKorean(englishText: string): Promise<string> {
    return this.translateText(englishText, '한국어');
  }

  // HTML 태그가 포함된 텍스트 번역 (TinyMCE 콘텐츠용)
  async translateHtmlContent(
    htmlContent: string,
    targetLanguage: string,
  ): Promise<string> {
    const prompt = `
    - 다음 HTML 콘텐츠를 ${targetLanguage}로 번역해줘. 
    - HTML 태그는 그대로 유지하고 태그 안의 텍스트 내용만 번역해줘
    - md 문법 백틱+html 로 감싸지마:
    
    ${htmlContent}`;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await this.model.generateContent(prompt);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const response = await result.response;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
      let translatedContent = response.text().trim();

      // ```html로 감싸진 경우 제거
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      if (translatedContent.startsWith('```html')) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-call
        translatedContent = translatedContent
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .replace(/^```html\s*/, '')
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .replace(/\s*```$/, '');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
      return response.text().trim();
    } catch (error) {
      console.error('HTML translation error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`HTML 번역 중 오류가 발생했습니다: ${error.message}`);
    }
  }
}
