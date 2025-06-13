import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            // Optional: group other node_modules packages
            return 'vendor';
          }
          
          // Feature chunks
          if (id.includes('features/documentLibrary')) {
            return 'feature-documentLibrary';
          }
          if (id.includes('features/fileanalysis')) {
            return 'feature-fileAnalysis';
          }
          if (id.includes('features/documentComparison')) {
            return 'feature-documentComparison';
          }
          if (id.includes('features/myDrive')) {
            return 'feature-myDrive';
          }
          
          // Default: let Vite handle it
          return undefined;
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});