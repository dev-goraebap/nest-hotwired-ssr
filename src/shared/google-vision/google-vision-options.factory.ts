export type GoogleVisionOptions = {
  keyFilename: string;
};
export const GOOGLE_VISION_OPTIONS = 'GOOGLE_VISION_OPTIONS';

export interface GoogleVisionOptionsFactory {
  create(): Promise<GoogleVisionOptions> | GoogleVisionOptions;
}
