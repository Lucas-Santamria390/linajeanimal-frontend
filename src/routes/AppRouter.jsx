import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/routes/ProtectedRoute'
import AdminRoute from '../components/routes/AdminRoute'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import Loading from '../components/ui/Loading'

const Landing = lazy(() => import('../pages/Landing'))
const Login = lazy(() => import('../pages/auth/Login'))
const Register = lazy(() => import('../pages/auth/Register'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const EspeciesList = lazy(() => import('../pages/especies/EspeciesList'))
const EspeciesForm = lazy(() => import('../pages/especies/EspeciesForm'))
const AnimalesList = lazy(() => import('../pages/animales/AnimalesList'))
const AnimalDetail = lazy(() => import('../pages/animales/AnimalDetail'))
const AnimalTree = lazy(() => import('../pages/animales/AnimalTree'))
const RazasList = lazy(() => import('../pages/razas/RazasList'))
const AnimalesForm = lazy(() => import('../pages/animales/AnimalesForm'))
const RazasForm = lazy(() => import('../pages/razas/RazasForm'))
const Perfil = lazy(() => import('../pages/Perfil'))
const UsuariosList = lazy(() => import('../pages/usuarios/UsuariosList'))
const UsuariosForm = lazy(() => import('../pages/usuarios/UsuariosForm'))
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
                  path="/animales/:id/arbol"
                  element={
                    <ProtectedRoute>
                      <AnimalTree />
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
