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
    outDir: 'assets/builds',
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'javascripts/app.js'),
        tailwind: resolve(__dirname, 'stylesheets/tailwind.css')
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
