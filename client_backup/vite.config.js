import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Adjust this if the app is deployed in a subdirectory
  plugins: [react()],
})
