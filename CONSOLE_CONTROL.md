# Console Control System

## Overview
Console control system ini dirancang untuk menonaktifkan semua `console.log` dan metode console lainnya saat aplikasi berjalan di production environment (Hostinger), namun tetap aktif saat development.

## Cara Kerja

### Otomatis Deteksi Environment
- **Development**: Console aktif untuk `localhost`, `127.0.0.1`, `192.168.x.x`, atau ketika ada port number
- **Staging**: Console aktif untuk domain `staging.`, `dev.`, `test.`
- **Production**: Console nonaktif untuk domain production (seperti di Hostinger)

### Override Manual
Anda bisa memaksa console aktif dengan menambahkan parameter URL:
- `?debug=true`
- `?console=true`

### Fitur Tambahan
- **Restore Console**: Di production, bisa restore console dengan `restoreConsole()` di browser console
- **Check Status**: Cek status console dengan `isConsoleDisabled()` di browser console

## File yang Terpengaruh

### Script Utama
- `/public/js/console-control.js` - Script control utama

### Template yang sudah ditambahkan
- `src/views/layout.hbs` - Layout utama (semua halaman publik)
- `public/index.html` - Halaman index utama
- `src/views/admin/*.hbs` - Semua halaman admin
- `src/views/*.hbs` - Semua halaman publik lainnya

## Cara Menggunakan

### Saat Development (Local)
Console akan otomatis aktif, semua `console.log` akan muncul di browser dev tools.

### Saat Production (Hostinger)
Console akan otomatis nonaktif, tidak ada output console yang muncul.

### Saat Debugging di Production
Jika perlu debugging di production, tambahkan parameter:
```
https://yourdomain.com/?debug=true
```

## Metode Console yang Dikontrol
- `console.log`
- `console.debug`
- `console.info`
- `console.warn`
- `console.error` (bisa diaktifkan jika needed)
- `console.table`
- `console.trace`
- `console.group`, `console.groupEnd`, `console.groupCollapsed`
- `console.clear`
- `console.assert`
- `console.count`, `console.countReset`
- `console.dir`, `console.dirxml`
- `console.time`, `console.timeEnd`, `console.timeLog`
- `console.profile`, `console.profileEnd`

## Keuntungan
1. **Performance**: Mengurangi overhead console logging di production
2. **Security**: Mencegah exposure informasi sensitif melalui console
3. **Clean Production**: Tidak ada console logs yang mengganggu di production
4. **Easy Debugging**: Tetap mudah debugging saat development
5. **Flexible Override**: Bisa di-override saat perlu debugging di production

## Deployment
Script ini sudah terintegrasi dengan auto-deploy system di Hostinger dan akan otomatis berjalan saat deployment.
