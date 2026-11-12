# Panduan Kontribusi

Dokumen ini menjelaskan alur kerja (workflow) yang wajib diikuti oleh semua developer agar kode tetap rapi, stabil, dan siap production.

## Daftar Isi

- [Alur Kerja Branch](#alur-kerja-branch)
- [Branch Protection](#branch-protection)
- [Langkah Berkontribusi](#langkah-berkontribusi)
- [Penamaan Branch](#penamaan-branch)
- [Aturan Commit](#aturan-commit)
- [Aturan Pull Request](#aturan-pull-request)
- [Syarat CI/CD (GitHub Actions)](#syarat-cicd-github-actions)
- [Checklist Sebelum Membuat Pull Request](#checklist-sebelum-membuat-pull-request)

---

## Alur Kerja Branch

Proyek ini menggunakan tiga jenis branch:

| Branch      | Fungsi                                                   | Push Langsung |
| ----------- | -------------------------------------------------------- | ------------- |
| `main`      | Kode yang sudah stabil dan siap **production**           | ❌ Dilarang   |
| `dev`       | Tempat integrasi semua fitur sebelum masuk ke production | ❌ Dilarang   |
| `feature/*` | Tempat developer mengerjakan fitur, perbaikan, dll.      | ✅ Boleh      |

Alur perubahan kode:

```
feature/nama-fitur  ──(Pull Request)──►  dev  ──(Pull Request)──►  main
                                          │                          │
                                     tahap integrasi          siap production
```

1. Developer **selalu** bekerja di branch `feature/*` (dibuat dari `dev`).
2. Setelah selesai, buat **Pull Request (PR)** dari `feature/*` ke `dev`.
3. Setelah `dev` stabil dan siap dirilis, buat **Pull Request** dari `dev` ke `main`.

> ⚠️ **Dilarang** membuat Pull Request langsung dari `feature/*` ke `main`.

---

## Branch Protection

Branch `dev` dan `main` dilindungi dengan aturan berikut:

- ❌ Tidak dapat di-push secara langsung (`git push origin dev` / `git push origin main` akan ditolak).
- ✅ Semua perubahan **wajib** melalui Pull Request.
- ✅ Semua status check (GitHub Actions) **harus hijau** sebelum PR dapat di-merge.
- ✅ Branch harus up-to-date dengan branch tujuan sebelum merge.

Jika kamu mencoba push langsung ke `dev` atau `main`, push tersebut akan ditolak oleh GitHub.

---

## Langkah Berkontribusi

### 1. Clone repository

```bash
git clone <url-repository>
cd <nama-repository>
```

### 2. Pindah ke `dev` dan ambil perubahan terbaru

```bash
git checkout dev
git pull origin dev
```

### 3. Buat branch feature baru

```bash
git checkout -b feature/nama-fitur
```

### 4. Kerjakan perubahan dan commit

```bash
git add .
git commit -m "feat: menambahkan fitur login"
```

### 5. Push branch feature ke remote

```bash
git push origin feature/nama-fitur
```

### 6. Buat Pull Request ke `dev`

- Buka repository di GitHub.
- Klik **Compare & pull request**.
- Pastikan **base branch** adalah `dev` dan **compare branch** adalah `feature/nama-fitur`.
- Isi judul dan deskripsi PR dengan jelas.
- Tunggu semua GitHub Actions berstatus hijau ✅, lalu minta review.

### 7. Rilis ke production

Apabila `dev` sudah stabil dan siap production:

- Buat Pull Request dari `dev` ke `main`.
- Pastikan semua GitHub Actions hijau ✅.
- Setelah disetujui, merge ke `main`.

---

## Penamaan Branch

Gunakan format `<tipe>/<deskripsi-singkat>` dengan huruf kecil dan tanda hubung (`-`).

| Tipe        | Kegunaan                             | Contoh                          |
| ----------- | ------------------------------------ | ------------------------------- |
| `feature/`  | Menambahkan fitur baru               | `feature/halaman-login`         |
| `fix/`      | Memperbaiki bug                      | `fix/error-validasi-email`      |
| `docs/`     | Perubahan dokumentasi                | `docs/update-readme`            |
| `refactor/` | Merapikan kode tanpa ubah perilaku   | `refactor/struktur-folder-api`  |

> Semua branch kerja dibuat dari `dev`, bukan dari `main`.

---

## Aturan Commit

Pesan commit **harus jelas** dan **ditulis dalam bahasa Indonesia** dengan format:

```
<tipe>: <deskripsi singkat dalam bahasa Indonesia>
```

### Tipe Commit

| Tipe        | Kegunaan                                                    |
| ----------- | ----------------------------------------------------------- |
| `feat`      | Menambahkan fitur baru                                      |
| `fix`       | Memperbaiki bug                                             |
| `docs`      | Perubahan dokumentasi                                       |
| `style`     | Perubahan format/gaya kode (tanpa mengubah logika)          |
| `refactor`  | Merapikan kode tanpa menambah fitur atau memperbaiki bug    |
| `test`      | Menambah atau memperbaiki pengujian                         |
| `chore`     | Perubahan konfigurasi, dependensi, atau tugas pendukung     |
| `perf`      | Peningkatan performa                                        |
| `ci`        | Perubahan pada konfigurasi CI/CD                            |

### Contoh Commit yang Benar ✅

```
feat: menambahkan fitur login dengan email
fix: memperbaiki error saat upload gambar
docs: memperbarui panduan instalasi
refactor: merapikan struktur folder service
test: menambahkan pengujian untuk fungsi validasi
chore: memperbarui versi dependensi
```

### Contoh Commit yang Salah ❌

```
update                      # tidak jelas
fix bug                     # tidak ada tipe & tidak spesifik
feat: add login feature     # tidak menggunakan bahasa Indonesia
Menambahkan fitur login     # tidak ada tipe commit
```

### Tips Menulis Commit

- Gunakan kata kerja di awal deskripsi (menambahkan, memperbaiki, menghapus, memperbarui).
- Tulis dengan huruf kecil setelah tanda titik dua.
- Jangan diakhiri dengan tanda titik.
- Satu commit sebaiknya hanya untuk satu perubahan logis.

---

## Aturan Pull Request

- Judul PR mengikuti format commit, contoh: `feat: menambahkan fitur login dengan email`.
- Jelaskan **apa** yang diubah dan **mengapa** pada deskripsi PR.
- Sertakan tangkapan layar (screenshot) bila ada perubahan tampilan.
- Hubungkan dengan issue terkait bila ada (contoh: `Closes #12`).
- Satu PR sebaiknya fokus pada satu fitur atau perbaikan.
- Selesaikan konflik (conflict) dengan branch tujuan sebelum meminta review.

### Arah Pull Request

| Dari        | Ke     | Tujuan                         |
| ----------- | ------ | ------------------------------ |
| `feature/*` | `dev`  | Integrasi fitur                |
| `fix/*`     | `dev`  | Integrasi perbaikan            |
| `dev`       | `main` | Rilis ke production            |

---

## Syarat CI/CD (GitHub Actions)

Pull Request **tidak dapat di-merge** apabila ada GitHub Actions yang masih **merah** ❌.

- Semua check wajib berstatus **hijau** ✅ sebelum merge.
- Jika ada check yang gagal, perbaiki terlebih dahulu di branch kamu, lalu push kembali.
- Jangan meminta merge selama status check masih merah atau belum selesai berjalan.

Langkah jika Actions gagal:

1. Buka tab **Checks** atau **Actions** pada PR untuk melihat log error.
2. Perbaiki masalah di branch kamu.
3. Commit dan push perbaikannya.
4. Tunggu Actions berjalan ulang hingga hijau.

---

## Checklist Sebelum Membuat Pull Request

- [ ] Branch dibuat dari `dev` dan menggunakan penamaan yang benar.
- [ ] Pesan commit jelas, berbahasa Indonesia, dan sesuai format.
- [ ] Kode sudah dijalankan dan diuji secara lokal.
- [ ] Tidak ada konflik dengan branch tujuan.
- [ ] Base branch PR sudah benar (`dev`, atau `main` khusus rilis dari `dev`).
- [ ] Deskripsi PR sudah lengkap.
- [ ] Semua GitHub Actions berstatus hijau ✅.

---

Jika ada pertanyaan, silakan buka issue atau hubungi maintainer proyek. Selamat berkontribusi! 🚀
