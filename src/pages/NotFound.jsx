import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="text-center text-white px-6">
        <h1 className="text-9xl font-bold mb-4">404</h1>
        <h2 className="text-4xl font-semibold mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-xl mb-8 opacity-90">
          Maaf, halaman yang Anda cari tidak tersedia.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
        >
          Kembali ke Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
