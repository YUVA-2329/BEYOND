import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: [
          '**/legacy_cricket/**',
          '**/node_modules/**',
          '**/.git/**',
          '**/intro/**',
          '**/dist/**',
          '**/temp_*/**',
          '**/undergroundz*/**',
          '**/smart-city*/**',
          '**/salaar/**',
          '**/SD_Forge/**',
          '**/Sarath*/**',
          '**/web*/**',
          '**/YUVA*/**',
          '**/video_*/**',
          '**/sql-*/**',
          '**/spirit*/**',
          '**/stitch_*/**',
          '**/srevices/**',
          '**/startup/**',
          '**/sketch/**',
          '**/server/**',
          '**/ram-medicals/**',
          '**/powernext*/**',
          '**/waste/**',
          '**/yyy/**',
          '**/v4/**',
          '**/SYNERGY-AI/**',
        ],
      },
    },
  };
});
