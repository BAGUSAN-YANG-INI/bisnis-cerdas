# UMKM Financial Health Platform - Docker & CI/CD Setup

Infrastruktur dasar container Docker, Docker Compose, dan GitHub Actions CI/CD untuk proyek **UMKM Financial Health Platform**.

---

## 🚀 Quick Navigation

- 📖 **[Panduan Lengkap Developer (DEVELOPMENT_GUIDE.md)](DEVELOPMENT_GUIDE.md)**: Panduan detail langkah inisialisasi Laravel & React via Docker, cheatsheet artisan/npm, dan konfigurasi database.
- 🤝 **[Panduan Kontribusi & Git Workflow (CONTRIBUTING.md)](CONTRIBUTING.md)**: Aturan penamaan branch, format commit bahasa Indonesia, dan branch protection.

---

## 🏷️ Daftar Base Image & Versi Teknologi (Menggunakan Image Lokal)

Semua image dasar Docker telah disesuaikan agar **memanfaatkan image lokal yang sudah ada di Docker mesin Anda** sehingga tidak perlu mendownload ulang dan menghemat ruang penyimpanan (*disk space*):

| Layanan / Tool | Base Image / Tag | Peran & Detail |
| :--- | :--- | :--- |
| **Backend Runtime** | `php:8.4-cli` | Image PHP 8.4 CLI lokal (Debian) + ekstensi `pdo_mysql`, `mbstring`, `bcmath`, `gd`, `zip` |
| **Dependency Manager** | `composer:2.8` | Composer 2.8 disalin langsung ke binary path |
| **Frontend Runtime** | `node:20-alpine` | Node.js 20 LTS Alpine (untuk dev server & build React/Vite) |
| **Frontend Production** | `nginx:1.28-alpine` | Image Nginx 1.28 Alpine lokal (Web server statis untuk stage production GHCR) |
| **Database** | `mysql:8.4` | Image MySQL 8.4 lokal |

---

## 📁 Struktur Konfigurasi

```text
bisnis-cerdas/
├── .github/
│   └── workflows/
│       ├── backend-ci.yml          # CI Backend (Dummy lint & test, GHCR upload khusus branch main)
│       └── frontend-ci.yml         # CI Frontend (Dummy lint & test, GHCR upload khusus branch main)
├── backend/
│   ├── .dockerignore               # Filter file untuk image backend
│   ├── .env.example                # Template konfigurasi environment Laravel
│   ├── .gitignore                  # Perlindungan file sensitif backend
│   ├── docker-entrypoint.sh        # Entrypoint container backend
│   └── Dockerfile                  # PHP 8.2 Alpine + pdo_mysql, bcmath, gd, zip, composer
├── frontend/
│   ├── .dockerignore               # Filter file untuk image frontend
│   ├── .env.example                # Template konfigurasi environment React
│   ├── .gitignore                  # Perlindungan file sensitif frontend
│   ├── Dockerfile                  # Multi-stage Dockerfile (Node 20 Alpine & Nginx)
│   └── nginx.conf                  # Konfigurasi Nginx untuk stage production
├── .env.example                    # Template variabel environment root / docker-compose
├── .gitignore                      # Gitignore komprehensif root
├── CONTRIBUTING.md                 # Aturan kontribusi & branch protection
├── docker-compose.yml              # Orkestrasi Backend, Frontend, dan MySQL
└── README.md                       # Panduan setup
```

---

## 👨‍💻 Panduan Inisialisasi untuk Developer

### 1. Developer Backend (Laravel)
Letakkan atau inisialisasi aplikasi Laravel di dalam direktori `backend/`:
```bash
cd backend
composer create-project laravel/laravel temp
mv temp/* .
rmdir temp
```
*Pastikan konfigurasi `.env` pada Laravel mengarah ke service MySQL (`DB_HOST=mysql`, `DB_PORT=3306`, `DB_DATABASE=bisnis_cerdas`).*

### 2. Developer Frontend (React + Vite)
Inisialisasi aplikasi React di dalam direktori `frontend/`:
```bash
cd frontend
npm create vite@latest . -- --template react
npm install
```

---

## 🐳 Menjalankan Docker Compose

1. **Salin template environment:**
   ```bash
   cp .env.example .env
   ```
2. **Jalankan semua service:**
   ```bash
   docker-compose up -d --build
   ```
3. **Port yang tersedia:**
   - **Frontend:** `http://localhost:3000`
   - **Backend:** `http://localhost:8000`
   - **MySQL:** `localhost:3306`

---

## 🚀 Alur CI/CD & GHCR (GitHub Actions)

Sesuai aturan branch protection pada [CONTRIBUTING.md](CONTRIBUTING.md):
- **Pull Request ke `dev` atau `main`:**
  - `backend-lint-and-test` & `frontend-lint-and-test` akan berjalan.
  - Menggunakan dummy assertions pada fase inisialisasi agar status check PR **langsung berstatus hijau (✅)** tanpa error.
- **Upload ke GHCR (GitHub Container Registry):**
  - **Hanya berjalan di branch `main`** setelah Pull Request berhasil di-merge (push ke `main`).
  - Image di-publish ke:
    - `ghcr.io/<repo>/backend`
    - `ghcr.io/<repo>/frontend`
