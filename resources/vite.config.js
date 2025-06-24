import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'assets/builds',
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'assets/javascripts/app.js'),
        global: resolve(__dirname, 'assets/stylesheets/global.css')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
});
