# RJ Apps - Progressive Web App

## 🚀 Fitur PWA

### ✅ Yang Sudah Diimplementasikan:

1. **Manifest.json**
   - Nama aplikasi: RJ Apps
   - Icon: Logo Rajawali
   - Theme color: #3498db
   - Background color: #0a0a1a
   - Display mode: standalone

2. **Service Worker (sw.js)**
   - Cache static assets
   - Offline support
   - Cache-first strategy
   - Auto update on new version
   - Push notification support

3. **Install Button**
   - Auto-detect install prompt
   - Tombol install di navbar (icon download hijau dengan animasi pulse)
   - Hilang otomatis setelah terinstall
   - Smooth install experience

4. **PWA Features**
   - Add to Home Screen
   - Offline mode
   - Fast loading dengan cache
   - App-like experience
   - Shortcuts untuk quick access

## 📱 Cara Install

### Desktop (Chrome/Edge):
1. Buka website
2. Klik icon download hijau di navbar
3. Atau klik icon + di address bar
4. Klik "Install"

### Mobile (Android):
1. Buka website di Chrome
2. Tap icon download hijau di navbar
3. Atau tap menu (⋮) → "Add to Home screen"
4. Aplikasi akan muncul di home screen

### iOS (Safari):
1. Buka website di Safari
2. Tap icon Share
3. Scroll dan tap "Add to Home Screen"
4. Konfirmasi nama aplikasi

## 🎨 Customization

### Icon
- Lokasi: `/public/logo_rj.png`
- Size: 512x512px (recommended)
- Format: PNG dengan transparent background

### Colors
- Theme color: `#3498db` (biru)
- Background: `#0a0a1a` (dark)
- Bisa diubah di `manifest.json`

### Cache Strategy
Service worker menggunakan cache-first strategy:
- Static assets di-cache saat install
- Dynamic content di-cache saat diakses
- Offline fallback tersedia

## 🔧 Development

### Test PWA di Localhost:
1. Build production: `npm run build`
2. Preview: `npm run preview`
3. Buka DevTools → Application → Service Workers
4. Check manifest di Application → Manifest

### Debug Service Worker:
- Chrome: `chrome://serviceworker-internals`
- Edge: `edge://serviceworker-internals`

### Clear Cache:
1. DevTools → Application → Storage
2. Clear site data
3. Unregister service worker
4. Reload

## 📊 Browser Support

| Browser | Install | Offline | Notifications |
|---------|---------|---------|---------------|
| Chrome  | ✅      | ✅      | ✅            |
| Edge    | ✅      | ✅      | ✅            |
| Firefox | ✅      | ✅      | ✅            |
| Safari  | ⚠️      | ✅      | ❌            |
| Opera   | ✅      | ✅      | ✅            |

⚠️ Safari memiliki support terbatas untuk install prompt

## 🎯 Future Enhancements

- [ ] Background sync untuk offline actions
- [ ] Push notifications untuk updates
- [ ] Periodic background sync
- [ ] App shortcuts untuk quick actions
- [ ] Share target API
- [ ] Better offline experience
- [ ] Cache management dashboard

## 📝 Notes

- Service worker hanya bekerja di HTTPS atau localhost
- Clear cache setelah update manifest
- Test di berbagai browser untuk compatibility
- Monitor cache size untuk performance
