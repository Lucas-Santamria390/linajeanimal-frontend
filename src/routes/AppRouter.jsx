import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminRoute from '../components/AdminRoute'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Loading from '../components/Loading'

const Landing = lazy(() => import('../pages/Landing'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const EspeciesList = lazy(() => import('../pages/EspeciesList'))
const EspeciesForm = lazy(() => import('../pages/EspeciesForm'))
const AnimalesList = lazy(() => import('../pages/AnimalesList'))
const AnimalDetail = lazy(() => import('../pages/AnimalDetail'))
const RazasList = lazy(() => import('../pages/RazasList'))
const AnimalesForm = lazy(() => import('../pages/AnimalesForm'))
const RazasForm = lazy(() => import('../pages/RazasForm'))
const Perfil = lazy(() => import('../pages/Perfil'))
const UsuariosList = lazy(() => import('../pages/UsuariosList'))
const UsuariosForm = lazy(() => import('../pages/UsuariosForm'))
const NotFound = lazy(() => import('../pages/NotFound'))

/**
 * Configuracion de rutas de la aplicacion
 * BrowserRouter + AuthProvider + Navbar + Sidebar + lazy loading con Suspense.
 * @returns {JSX.Element}
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <div className="md:flex">
          <Sidebar />
          <main className="min-h-screen flex-1 bg-neutral-bg">
            <Suspense fallback={<Loading />}>
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
                  path="/especies/nuevo"
                  element={
                    <ProtectedRoute>
                      <EspeciesForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/especies/:id/editar"
                  element={
                    <ProtectedRoute>
                      <EspeciesForm />
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
                  path="/animales/:id"
                  element={
                    <ProtectedRoute>
                      <AnimalDetail />
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
