import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss({
      content: ['./views/**/*.edge', './src/**/*.js'],
    }),
  ],
  build: {
    manifest: true,
    outDir: 'public/builds',
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'src/app.js'),
        tailwind: resolve(__dirname, 'src/tailwind.css'),
      },
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]',
      },
    },
  },
  server: {
    host: 'localhost',
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  publicDir: false,
});
