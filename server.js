// Katalog Produk UMKM - aplikasi web sederhana untuk praktik containerisasi
// Tanpa dependensi eksternal: hanya modul bawaan Node.js.

const http = require("http");
const os = require("os");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || "v1.0";
const STARTED_AT = new Date();

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "products.json"), "utf8")
);

function rupiah(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPage() {
  const cards = products
    .map(
      (p) => `
      <div class="card">
        <div class="emoji">${p.icon}</div>
        <h3>${escapeHtml(p.nama)}</h3>
        <p class="kat">${escapeHtml(p.kategori)}</p>
        <p class="harga">${rupiah(p.harga)}</p>
        <p class="stok">Stok: ${p.stok}</p>
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Katalog Produk UMKM</title>
  <style>
    body { font-family: system-ui, Arial, sans-serif; margin: 0; background: #f4f6f8; color: #1f2933; }
    header { background: #1e3a5f; color: #fff; padding: 20px 32px; }
    header h1 { margin: 0 0 4px; font-size: 26px; }
    header p { margin: 0; opacity: .85; }
    .info { background: #e3ecf7; padding: 10px 32px; font-size: 14px; }
    .info code { background: #fff; padding: 2px 6px; border-radius: 4px; }
    main { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; padding: 24px 32px; }
    .card { background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
    .emoji { font-size: 40px; }
    .card h3 { margin: 8px 0 4px; font-size: 17px; }
    .kat { margin: 0; color: #6b7280; font-size: 13px; }
    .harga { margin: 8px 0 0; font-weight: bold; color: #1e7a46; font-size: 18px; }
    .stok { margin: 4px 0 0; font-size: 13px; color: #6b7280; }
    footer { padding: 12px 32px 24px; font-size: 13px; color: #6b7280; }
  </style>
</head>
<body>
  <header>
    <h1>Katalog Produk UMKM</h1>
    <p>Aplikasi praktik containerisasi &mdash; Cloud Computing</p>
  </header>
  <div class="info">
    Versi: <code>${APP_VERSION}</code> &nbsp;|&nbsp;
    Dilayani oleh instance (hostname container): <code>${escapeHtml(os.hostname())}</code>
  </div>
  <main>${cards}
  </main>
  <footer>Endpoint lain: <code>/api/products</code> (data JSON) dan <code>/health</code> (health check).</footer>
</body>
</html>`;
}

function sendJson(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj, null, 2));
}

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  console.log(`${new Date().toISOString()} ${req.method} ${url}`);

  if (url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(renderPage());
  }
  if (url === "/api/products" && req.method === "GET") {
    return sendJson(res, 200, { instance: os.hostname(), jumlah: products.length, data: products });
  }
  if (url === "/health") {
    return sendJson(res, 200, {
      status: "ok",
      version: APP_VERSION,
      instance: os.hostname(),
      uptime_detik: Math.round((Date.now() - STARTED_AT.getTime()) / 1000),
    });
  }
  sendJson(res, 404, { error: "Halaman tidak ditemukan" });
});

server.listen(PORT, () => {
  console.log(`Katalog UMKM ${APP_VERSION} berjalan di port ${PORT}`);
});

// Berhenti dengan rapi saat container dihentikan (docker stop mengirim SIGTERM)
function shutdown(signal) {
  console.log(`Menerima ${signal}, menutup server...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
