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
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('Init TranslationService');
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const prompt = `Translate the following text to ${targetLanguage}. Only return the translated text without any additional explanations or formatting:

    ${text}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`번역 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  async translateToEnglish(koreanText: string): Promise<string> {
    return this.translateText(koreanText, 'English');
  }

  async translateToKorean(englishText: string): Promise<string> {
    return this.translateText(englishText, 'Korean');
  }

  // HTML 태그가 포함된 텍스트 번역 (TinyMCE 콘텐츠용)
  async translateHtmlContent(
    htmlContent: string,
    targetLanguage: string,
  ): Promise<string> {
    const prompt = `Translate the following HTML content to ${targetLanguage}. Keep all HTML tags intact and only translate the text content inside the tags:
    
    ${htmlContent}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('HTML translation error:', error);
      throw new Error(`HTML 번역 중 오류가 발생했습니다: ${error.message}`);
    }
  }
}
