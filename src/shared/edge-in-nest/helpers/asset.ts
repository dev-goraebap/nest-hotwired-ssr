import { readFileSync } from 'fs';

export type AssetHelperOptions = {
  manifest: string;
  assetsBaseUrl: string;
};

export function assetHelperFactory(options: AssetHelperOptions) {
  let manifest: Record<string, any> | null = null;

  function getManifest() {
    if (manifest) {
      return manifest;
    }

    try {
      const manifestContent = readFileSync(options.manifest, 'utf-8');
      manifest = JSON.parse(manifestContent);
      return manifest;
    } catch (error) {
      console.error(`Error reading manifest file at ${options.manifest}:`, error);
      return null;
    }
  }

  return function asset(path: string): string {
    // 개발 환경에서는 Vite 개발 서버 URL을 반환
    if (process.env.NODE_ENV === 'development') {
      // Vite 개발 서버는 resources 디렉토리를 기준으로 서빙합니다.
      // 예: src/app.js -> http://localhost:5173/resources/src/app.js
      return `http://localhost:5173/${path}`;
    }

    // 프로덕션 환경에서는 매니페스트 파일을 통해 해시된 에셋 경로를 반환
    const manifest = getManifest();

    if (!manifest) {
      console.warn(`Manifest file not found or failed to parse.`);
      return '';
    }

    const manifestEntry = manifest[path];

    if (!manifestEntry) {
      console.warn(`Asset not found in manifest: ${path}`);
      return '';
    }

    return `${options.assetsBaseUrl}/${manifestEntry.file}`;
  };
}
