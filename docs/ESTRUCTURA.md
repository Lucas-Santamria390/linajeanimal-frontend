# Estructura del Proyecto

## Árbol de carpetas

```
src/
├── assets/                 # Recursos estáticos (imágenes, SVGs)
├── components/             # Componentes reutilizables
│   ├── Alert.jsx           # Mensajes de notificación
│   ├── ConfirmModal.jsx    # Modal de confirmación
│   ├── FormInput.jsx       # Input con label y error
│   ├── Loading.jsx         # Spinner de carga
│   ├── Navbar.jsx          # Barra de navegación
│   ├── Pagination.jsx      # Paginación para listados
│   ├── ProtectedRoute.jsx  # Guardia de autenticación
│   ├── SelectEspecie.jsx   # Select de especies (carga del API)
│   ├── SelectRaza.jsx      # Select de razas (filtrado por especie)
│   ├── Sidebar.jsx         # Barra lateral
│   └── Table.jsx           # Tabla reutilizable
├── context/
│   └── AuthContext.jsx     # Estado global de autenticación
├── hooks/                  # Custom hooks
│   ├── useAnimales.js      # Query/Mutation para animales
│   ├── useEspecies.js      # Query para especies
│   └── useRazas.js         # Query para razas
├── pages/                  # Páginas por ruta
│   ├── Dashboard.jsx       # Panel principal
│   ├── Login.jsx           # Inicio de sesión
│   ├── AnimalesList.jsx    # Listado de animales
│   ├── AnimalForm.jsx      # Crear/Editar animal
│   ├── AnimalDetail.jsx    # Detalle de animal + genealogía
│   ├── UsuariosList.jsx    # Listado de usuarios (admin)
│   ├── UsuarioForm.jsx     # Crear/Editar usuario (admin)
│   └── Perfil.jsx          # Perfil y cambio de password
├── routes/
│   └── AppRouter.jsx       # Configuración de React Router
├── services/               # Llamadas al API
│   ├── api.js              # Instancia de Axios
│   ├── animales.js         # Endpoints de animales
│   ├── auth.js             # Endpoints de auth
│   ├── especies.js         # Endpoints de especies
│   ├── razas.js            # Endpoints de razas
│   └── usuarios.js         # Endpoints de usuarios
├── utils/                  # Funciones helper
│   └── formatters.js       # Formateo de fechas, etc.
├── App.jsx                 # Componente raíz
├── index.css               # Entry point de Tailwind
└── main.jsx                # Punto de entrada
```

## Patrones de componentes

Cada componente debe cubrir los estados: **loading**, **empty**, **error**, **success**.

## Flujo de datos

```
Página → Custom Hook → Servicio (Axios) → API Backend
                          ↕
                    AuthContext (token)
```

- Las páginas importan hooks
- Los hooks llaman a servicios
- Los servicios usan la instancia de Axios (que agrega el token automáticamente)
- AuthContext provee el token y funciones de login/logout
