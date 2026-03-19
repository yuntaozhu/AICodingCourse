import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Load GEMINI_API_KEY explicitly if needed, but loadEnv already loads it into env
  // The user specifically mentioned GEMINI_API_KEY
  const geminiApiKey = env.GEMINI_API_KEY;

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      hmr: process.env.DISABLE_HMR === 'true' ? false : true,
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
    },
  };
});
