import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import Navbar from '../components/Navbar'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'

/**
 * Configuracion de rutas de la aplicacion
 * BrowserRouter + AuthProvider + Navbar con rutas protegidas.
 * @returns {JSX.Element}
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="min-h-screen bg-neutral-bg">
          <Routes>
            <Route path="/" element={<h1 className="p-6 text-xl">Página principal</h1>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<h1 className="p-6 text-xl">404 - Página no encontrada</h1>} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}
