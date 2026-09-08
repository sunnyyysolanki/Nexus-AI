import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT || '5173'),
      host: true,
      proxy: {
        // Main API Gateway Route
        '/api': {
          target: env.VITE_GATEWAY_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        // Direct Health Probes for Individual Microservices
        '/direct/alert': {
          target: env.VITE_ALERT_SERVICE_URL || 'http://localhost:8083',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/direct\/alert/, ''),
        },
        '/direct/incident': {
          target: env.VITE_INCIDENT_SERVICE_URL || 'http://localhost:8084',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/direct\/incident/, ''),
        },
        '/direct/rca': {
          target: env.VITE_RCA_SERVICE_URL || 'http://localhost:8085',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/direct\/rca/, ''),
        },
        '/direct/log': {
          target: env.VITE_LOG_SERVICE_URL || 'http://localhost:8081',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/direct\/log/, ''),
        },
        '/direct/metric': {
          target: env.VITE_METRIC_SERVICE_URL || 'http://localhost:8082',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/direct\/metric/, ''),
        },
      },
    },
  };
});
