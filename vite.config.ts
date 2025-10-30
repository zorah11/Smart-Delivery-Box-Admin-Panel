import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/Smart-Delivery-Box-Admin-Panel/',
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy ThingSpeak API
      "/proxy/thingspeak": {
        target: "https://api.thingspeak.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/thingspeak/, ""),
      },
      // Proxy BulkSMS API
      "/proxy/sms": {
        target: "https://app.bulksmsug.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/sms/, "/api/v1"),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
