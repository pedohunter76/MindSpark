import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Prevent crashes if libraries access process.env directly
      'process.env': {},
      // Define process.env.API_KEY for client-side access.
      // JSON.stringify is crucial to ensure it is inserted as a string literal.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
    build: {
      outDir: 'dist',
    }
  };
});