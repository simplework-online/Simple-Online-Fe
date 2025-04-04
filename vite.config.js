import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Set the port to 5173
    host: '0.0.0.0', // This allows access from external IPs, including VPS
  },
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "./src") }] // Use path.resolve instead
  }
})
