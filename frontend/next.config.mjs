/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Uploads are intentionally served by the local Traefik gateway in development.
    // remotePatterns below limits this exception to property-service upload paths.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Property-service uploads are served through the local reverse proxy.
      { protocol: "http", hostname: "localhost", pathname: "/static/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/static/uploads/**" },
    ],
  },
};

export default nextConfig;
