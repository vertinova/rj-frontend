# UPLOAD FRONTEND KE HOSTINGER

## Build sudah selesai! ✅
Folder `dist/` sudah berisi file production terbaru dengan API URL yang benar:
- API: http://72.61.140.193:5005/api
- Uploads: http://72.61.140.193:5005/uploads

---

## Cara Upload ke Hostinger

### Opsi 1: Via File Manager Hostinger (Recommended)

1. **Login ke Hostinger Control Panel**
   - Buka https://hpanel.hostinger.com
   - Login dengan akun Anda

2. **Buka File Manager**
   - Pilih domain/website Anda
   - Klik "File Manager"

3. **Navigasi ke folder public_html**
   - Biasanya: `/domains/namadomain.com/public_html`
   - atau: `/public_html`

4. **Backup folder lama (Opsional tapi recommended)**
   - Rename folder yang ada menjadi `public_html_backup_old`
   - Atau download sebagai backup

5. **Upload file dari folder dist/**
   - Upload SEMUA file & folder dari `C:\laragon\www\rajawali\rj-frontend\dist\`
   - Pastikan struktur tetap sama:
     ```
     public_html/
     ├── index.html
     ├── assets/
     │   ├── index-BoutCkrN.js
     │   ├── index-DCQaOFSX.css
     │   └── ...
     ├── logo_lakaraja.png
     └── ...
     ```

6. **Test website**
   - Buka website Anda di browser
   - Test login taruna
   - Cek console (F12) apakah masih ada error

---

### Opsi 2: Via FTP (Jika lebih familiar)

1. **Download FTP Client**
   - FileZilla: https://filezilla-project.org/
   - WinSCP: https://winscp.net/

2. **Ambil kredensial FTP dari Hostinger**
   - Di hPanel: Files > FTP Accounts
   - Catat: Host, Username, Password, Port

3. **Connect via FTP**
   - Host: ftp.namadomain.com
   - Username: username@namadomain.com
   - Password: [dari hPanel]
   - Port: 21

4. **Upload folder dist/**
   - Remote path: `/public_html/`
   - Upload semua isi folder `dist/` ke `public_html/`

---

### Opsi 3: Via SSH/Terminal (Jika ada akses)

```bash
# Zip file dulu di local
cd C:\laragon\www\rajawali\rj-frontend
tar -czf dist.tar.gz dist/*

# Upload via SCP
scp dist.tar.gz user@namadomain.com:/home/user/

# SSH ke server
ssh user@namadomain.com

# Extract
cd public_html
tar -xzf ../dist.tar.gz --strip-components=1
```

---

## File yang Perlu Diupload (dari folder dist/)

✅ **index.html** - File utama
✅ **assets/** - Folder dengan JS & CSS
✅ **logo_lakaraja.png** - Logo
✅ **logo_rj.png** - Logo
✅ **manifest.json** - PWA manifest (jika ada)
✅ **sw.js** - Service worker (jika ada)
✅ **offline.html** - Offline page (jika ada)
✅ **public/** - Assets lainnya

---

## Troubleshooting

### Website masih menunjukkan error connection refused?

1. **Clear browser cache**
   - Ctrl + Shift + Delete
   - Pilih "Cached images and files"
   - Clear

2. **Hard reload**
   - Ctrl + Shift + R (Windows)
   - Cmd + Shift + R (Mac)

3. **Cek file yang terupload**
   - Pastikan file `index-BoutCkrN.js` ada di `assets/`
   - File size harus ~609 KB

4. **Cek console browser (F12)**
   - Lihat error apa yang muncul
   - Cek apakah API URL sudah benar ke 72.61.140.193:5005

### API masih ngarah ke localhost?

Artinya build tidak mengambil `.env.production`. Coba:

```bash
# Build ulang dengan force production mode
cd C:\laragon\www\rajawali\rj-frontend
npm run build
```

---

## Verifikasi Sukses

Setelah upload, buka browser dan test:

1. ✅ Website terbuka tanpa error
2. ✅ Login taruna bisa diakses
3. ✅ Cek Network tab (F12 > Network):
   - Request ke `http://72.61.140.193:5005/api/auth/login`
   - Bukan ke `localhost:5000`
4. ✅ Login dengan kredensial taruna berhasil

---

## Quick Check Commands

```powershell
# Cek isi dist folder
cd C:\laragon\www\rajawali\rj-frontend\dist
ls

# Cek ukuran build
Get-ChildItem -Recurse | Measure-Object -Property Length -Sum

# Lihat index.html
cat index.html
```

---

## Contact

Jika masih ada masalah setelah upload, screenshot:
1. Browser console (F12)
2. Network tab showing failed requests
3. File structure di Hostinger File Manager

---

**Build Location:** `C:\laragon\www\rajawali\rj-frontend\dist\`
**Ready to upload!** 🚀
