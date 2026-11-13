# 1. Image dasar: Node.js 24 LTS berbasis Alpine (ukuran kecil)
FROM node:24-alpine

# 2. Folder kerja di dalam container
WORKDIR /app

# 3. Salin manifest dulu agar layer ini bisa di-cache
COPY package.json ./

# 4. Instal dependensi produksi (aplikasi ini belum punya dependensi,
#    baris ini tetap disiapkan jika nanti ditambah library)
RUN npm install --omit=dev && npm cache clean --force

# 5. Salin kode aplikasi dan data
COPY server.js ./
COPY data ./data

# 6. Variabel lingkungan default
ENV NODE_ENV=production \
    PORT=3000 \
    APP_VERSION=v1.0

# 7. Jalankan sebagai user non-root (praktik keamanan)
USER node

# 8. Dokumentasi port yang dipakai aplikasi
EXPOSE 3000

# 9. Health check: Docker menandai container "unhealthy" jika /health gagal
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# 10. Perintah saat container dijalankan
CMD ["node", "server.js"]
