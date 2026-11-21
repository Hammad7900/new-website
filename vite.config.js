import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const removePrivateApiFilesFromBuild = {
  name: 'remove-private-api-files-from-build',
  apply: 'build',
  async closeBundle() {
    const apiOutput = resolve(process.cwd(), 'dist', 'api');
    let entries = [];
    try {
      entries = await readdir(apiOutput, { withFileTypes: true });
    } catch {
      return;
    }
    await Promise.all(entries
      .filter((entry) => entry.isFile() && (entry.name === 'config.php' || entry.name.startsWith('.cj_token_')))
      .map((entry) => rm(resolve(apiOutput, entry.name), { force: true })));
  },
};

export default defineConfig({
  plugins: [react(), removePrivateApiFilesFromBuild],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
});
