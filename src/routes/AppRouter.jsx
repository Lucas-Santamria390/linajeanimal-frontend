import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import EspeciesList from '../pages/EspeciesList';
import EspeciesForm from '../pages/EspeciesForm';
import AnimalesList from '../pages/AnimalesList';
import AnimalesForm from '../pages/AnimalesForm';
import AnimalDetail from '../pages/AnimalDetail';
import RazasList from '../pages/RazasList';
import RazasForm from '../pages/RazasForm';
import Perfil from '../pages/Perfil';
import Landing from '../pages/Landing';
import UsuariosList from '../pages/UsuariosList';
import UsuariosForm from '../pages/UsuariosForm';

/**
 * Configuración de rutas de la aplicación.
 * BrowserRouter + AuthProvider + Navbar (sesión/hamburguesa) + Sidebar (navegación en PC) + rutas protegidas.
 * @returns {JSX.Element} Árbol de enrutamiento completo de la aplicación.
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* El Navbar siempre va arriba en la jerarquía */}
        <Navbar />
        
        {/* Contenedor flexible para alinear el Sidebar y el contenido de las páginas */}
        <div className="md:flex">
          {/* El Sidebar se renderiza a la izquierda */}
          <Sidebar />
          
          {/* El área principal renderiza ÚNICAMENTE un bloque de rutas */}
          <main className="min-h-screen flex-1 bg-neutral-bg">
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
              {/* Carácter corregido de manera limpia y nativa */}
              <Route path="*" element={<h1 className="p-6 text-xl">404 - Página no encontrada</h1>} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}