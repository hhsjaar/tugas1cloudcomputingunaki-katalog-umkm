# Katalog Produk UMKM — Praktik Container & Registry

Aplikasi web sederhana (Node.js, tanpa dependensi eksternal) untuk tugas Cloud Computing.

## Struktur

```
katalog-umkm/
├── server.js            # aplikasi web (/, /api/products, /health)
├── data/products.json   # data katalog
├── package.json
├── Dockerfile
├── .dockerignore
├── docker-compose.yml   # bonus: 2 replika + load balancer
└── nginx/nginx.conf
```

## Menjalankan tanpa Docker

```bash
node server.js
# buka http://localhost:3000
```

## Langkah praktik

```bash
# Soal 5 — build, run, cek
docker build -t katalog-umkm:v1.0 .
docker run -d --name katalog -p 8080:3000 katalog-umkm:v1.0
docker ps
docker logs katalog
curl http://localhost:8080/health

# Soal 6 — tag, push, pull
docker login -u hhsjaar
docker tag katalog-umkm:v1.0 hhsjaar/katalog-umkm:v1.0
docker tag katalog-umkm:v1.0 hhsjaar/katalog-umkm:latest
docker push hhsjaar/katalog-umkm:v1.0
docker push hhsjaar/katalog-umkm:latest
docker rm -f katalog
docker rmi hhsjaar/katalog-umkm:v1.0 hhsjaar/katalog-umkm:latest katalog-umkm:v1.0
docker pull hhsjaar/katalog-umkm:v1.0
docker run -d --name katalog -p 8080:3000 hhsjaar/katalog-umkm:v1.0

# Soal 7 — uji kegagalan
docker stop katalog      # akses ke http://localhost:8080 gagal
docker start katalog     # akses pulih

# Bonus — 2 replika + load balancer
docker compose up -d
docker compose stop app1    # aplikasi tetap bisa diakses lewat app2
docker compose start app1
```

Jangan menyimpan kata sandi atau token Docker Hub di repository.
