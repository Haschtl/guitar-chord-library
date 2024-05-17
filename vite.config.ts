import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base:"/guitar-chord-library/",
  plugins: [react()],
  build: {
    minify: false,
    sourcemap: false,
  },
});
