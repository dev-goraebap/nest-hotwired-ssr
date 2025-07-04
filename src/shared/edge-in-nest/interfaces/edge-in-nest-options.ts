export type EdgeInNestOptions = {
  baseViewPath: string;
  disks: string[];
  cache: boolean;
  assets?: {
    /**
     * Vite가 생성하는 manifest.json 파일의 절대 경로입니다.
     * @example join(process.cwd(), 'public', 'build', 'manifest.json')
     */
    manifest: string;
    /**
     * 버전 해시가 적용된 에셋 파일에 접근하기 위한 기본 URL 경로입니다.
     * @example '/public/builds'
     */
    assetsBaseUrl: string;
  };
};
export const EDGE_IN_NEST_OPTIONS = 'EDGE_IN_NEST_OPTIONS';
