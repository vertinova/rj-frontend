# Frontend - Paskibra Rajawali

Frontend aplikasi menggunakan React + Vite untuk sistem manajemen Paskibra Rajawali MAN 1 Kabupaten Bogor.

## 📋 Prerequisites

- Node.js v18+
- npm atau yarn

## 🚀 Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` menjadi `.env`:
```bash
copy .env.example .env
```

3. Konfigurasi file `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOADS_URL=http://localhost:5000/uploads
```

4. Jalankan development server:
```bash
npm run dev
```

5. Buka browser: `http://localhost:5173`

## 📁 Struktur Folder

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, CSS, etc
│   ├── components/     # Reusable components
│   │   ├── common/    # Common components (Button, Modal, etc)
│   │   ├── admin/     # Admin-specific components
│   │   └── taruna/    # Taruna-specific components
│   ├── context/        # React Context (Auth, etc)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   │   ├── admin/     # Admin pages
│   │   └── taruna/    # Taruna pages
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main App component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## 🛣️ Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### Taruna Routes (Protected)
- `/taruna` - Dashboard taruna
- `/taruna/pendaftaran` - Form pendaftaran
- `/taruna/status` - Status pendaftaran
- `/taruna/absensi` - Absensi
- `/taruna/profil` - Profil user

### Admin Routes (Protected)
- `/admin` - Dashboard admin
- `/admin/pendaftar` - Manajemen pendaftar
- `/admin/users` - Manajemen users
- `/admin/absensi` - Lihat semua absensi
- `/admin/profil` - Profil admin

## 🔧 Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📦 Dependencies

### Core
- **react** - UI library
- **react-dom** - React DOM renderer
- **react-router-dom** - Routing
- **vite** - Build tool & dev server

### Utilities
- **axios** - HTTP client
- **react-hot-toast** - Toast notifications
- **react-icons** - Icon library
- **date-fns** - Date utilities

## 🎨 Styling

Aplikasi menggunakan vanilla CSS dengan CSS variables untuk theming. Global styles ada di `src/index.css`.

### CSS Variables
```css
--primary-color: #2563eb
--secondary-color: #1e40af
--success-color: #10b981
--danger-color: #ef4444
--warning-color: #f59e0b
```

## 🔐 Authentication

Aplikasi menggunakan JWT token yang disimpan di localStorage. Token otomatis ditambahkan ke setiap request API melalui axios interceptor.

## 📱 Responsive Design

Aplikasi fully responsive dengan breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚧 Development Status

✅ Completed:
- Project structure
- Authentication (Login/Register)
- Protected routes
- Basic dashboard layout
- API integration setup

🚧 In Progress:
- Taruna features (Pendaftaran, Absensi)
- Admin features (Manajemen pendaftar, users)
- UI components
- Export functionality (PDF, Excel)

## 📄 License

MIT
