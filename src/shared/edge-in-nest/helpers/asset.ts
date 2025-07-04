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
