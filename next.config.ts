import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Vercel (producción)
  env: {
    // Estas variables estarán disponibles en el cliente si tienen NEXT_PUBLIC_
    NEXT_PUBLIC_APP_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  // Asegurar que las rutas de API funcionen correctamente
  async headers() {
    return [
      {
        // Configurar CORS para los webhooks
        source: "/api/webhooks/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};

export default nextConfig;
