import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    tailwindcss({
      content: [
        './views/**/*.edge',
        './javascripts/**/*.js',
      ],
    }),
  ],
  build: {
    // manifest.json 파일 생성
    manifest: true,
    outDir: 'assets/builds',
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'javascripts/app.js'),
        tailwind: resolve(__dirname, 'stylesheets/tailwind.css')
      },
      output: {
        // 해시가 포함된 파일명으로 변경
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]',
      },
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
});
