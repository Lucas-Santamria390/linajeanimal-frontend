import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminRoute from '../components/AdminRoute'
import Navbar from '../components/Navbar'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import EspeciesList from '../pages/EspeciesList'
import AnimalesList from '../pages/AnimalesList'
import RazasList from '../pages/RazasList'
import AnimalesForm from '../pages/AnimalesForm'
import RazasForm from '../pages/RazasForm'
import Perfil from '../pages/Perfil'
import Landing from '../pages/Landing'
import UsuariosList from '../pages/UsuariosList'
import UsuariosForm from '../pages/UsuariosForm'

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
            <Route path="/" element={<Landing />} />
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
            <Route
              path="/especies"
              element={
                <ProtectedRoute>
                  <EspeciesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/animales"
              element={
                <ProtectedRoute>
                  <AnimalesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/animales/nuevo"
              element={
                <ProtectedRoute>
                  <AnimalesForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/animales/:id/editar"
              element={
                <ProtectedRoute>
                  <AnimalesForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              }
            />
            <Route
              path="/razas"
              element={
                <ProtectedRoute>
                  <RazasList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/razas/nuevo"
              element={
                <ProtectedRoute>
                  <RazasForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/razas/:id/editar"
              element={
                <ProtectedRoute>
                  <RazasForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <UsuariosList />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/nuevo"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <UsuariosForm />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/:id/editar"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <UsuariosForm />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<h1 className="p-6 text-xl">404 - P\u00e1gina no encontrada</h1>} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}
