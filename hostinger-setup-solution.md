# Hostinger Firebase Setup - SOLUSI MUDAH

## Masalah
Firebase private key terlalu panjang untuk disimpan di environment variables Hostinger.

## Solusi Terbaik: Hardcoded Credentials (Sudah Terintegrasi)

**TIDAK PERLU LAKUKAN APAPUN!** Server sudah menggunakan hardcoded credentials otomatis saat production.

### Langkah 1: Set Environment Variables (Hanya yang diperlukan)
Cukup set ini saja di Hostinger Environment Variables:
```
NODE_ENV=production
SITE_URL=https://growsynergyid.com
SITE_NAME=Pelatihan Data Analitik Terbaik Indonesia
SESSION_SECRET=grow-synergy-admin-secret-key
ADMIN_EMAIL=admin@grow-synergy.com
ADMIN_USERNAME=admin@grow-synergy.com
ADMIN_PASSWORD=Mieayam1
```

### Langkah 2: Restart Aplikasi
1. **Go to Hosting → Advanced → Node.js Manager**
2. **Restart your application**

## Cara Kerja
- Server otomatis mendeteksi `NODE_ENV=production`
- Jika environment variables Firebase tidak ada, gunakan hardcoded credentials
- **Tidak perlu upload file atau setting Firebase variables!**

## Verification
Setelah restart, visit: `https://growsynergyid.com/admin/dashboard`

Anda harus melihat:
- **Experts: 9** (bukan 0)
- **Portfolios: 37** (bukan 0) 
- **Academies: 19** (bukan 0)

## Debug Info
Visit: `https://growsynergyid.com/admin/debug-env` untuk melihat status environment variables

## Catatan
- Firebase credentials sudah di-embed di server.js
- Aman karena hanya untuk production
- Tidak perlu environment variables untuk Firebase
