#  LinajeAnimal — Frontend

**Gestión de árbol genealógico de animales** — Aplicación web para registrar animales, especies y razas, asignar relaciones familiares y visualizar el linaje completo mediante un árbol genealógico interactivo.

Frontend desarrollado en **React 19** que consume la **API REST** de `linajeanimal-api`.

---

##  Funcionalidades

| Funcionalidad | Descripción |
|---|---|
|  **Autenticación** | Registro e inicio de sesión con JWT, sesión persistente en `localStorage`, cierre de sesión |
|  **Dashboard** | Resumen con métricas: total animales, especies, razas y últimos animales registrados |
|  **CRUD Animales** | Crear, listar (con paginación/búsqueda/filtros), ver detalle, editar y eliminar animales |
|  **Árbol genealógico** | Visualización interactiva tipo grafo SVG con padres, hijos y hermanos por generaciones |
|  **CRUD Especies** | Catálogo de especies con búsqueda, paginación y desactivación (solo admin) |
|  **CRUD Razas** | Catálogo de razas filtrable por especie, paginación y desactivación (solo admin) |
|  **Gestión de usuarios** | CRUD completo de usuarios y activación/desactivación (solo admin) |
|  **Perfil** | Datos personales en solo lectura + cambio de contraseña con validación en vivo |
|  **Paleta "Pradera Tecnológica"** | Diseño eco-profesional con tonos naturaleza verde + acento cian técnico |

---

## 🛠️ Tecnologías

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | [React](https://react.dev/) | ^19.2.7 |
| Bundler | [Vite](https://vite.dev/) | ^8.1.0 |
| Routing | [React Router DOM](https://reactrouter.com/) | ^7.18.0 |
| HTTP Client | [Axios](https://axios-http.com/) | ^1.18.1 |
| Estilos | [Tailwind CSS](https://tailwindcss.com/) | v4 |
| Linter | [ESLint](https://eslint.org/) (flat config) | ^10.5.0 |
| Plugins ESLint | `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-jsdoc` | — |
| Plugin Vite | `@vitejs/plugin-react`, `@tailwindcss/vite` | — |

---

##  Arquitectura

### Flujo de datos

```
Página → Custom Hook → Servicio (Axios) → API Backend
                        ↕
                  AuthContext (token en localStorage)
```

Cada página importa un **custom hook** → el hook llama al **servicio** correspondiente → el servicio usa la **instancia Axios** preconfigurada con el token JWT.

### Estructura del proyecto

```
src/
├── main.jsx                       # Entry point
├── App.jsx                        # Componente raíz
├── index.css                      # Tailwind v4 + tema "Pradera Tecnológica"
│
├── routes/
│   └── AppRouter.jsx              # BrowserRouter + lazy loading + rutas protegidas
│
├── context/
│   └── AuthContext.jsx            # AuthProvider + useAuth (token en localStorage)
│
├── services/                      # Capa de comunicación con la API
│   ├── api.js                     # Instancia Axios (base URL, interceptores)
│   ├── auth.js                    # /auth/login, /auth/register, /auth/profile, etc.
│   ├── animales.js                # CRUD animales + children/siblings/family-tree
│   ├── especies.js                # CRUD especies
│   ├── razas.js                   # CRUD razas
│   └── usuarios.js                # CRUD usuarios + toggleActive
│
├── hooks/                         # Lógica de estado y llamadas a servicios
│   ├── useAnimales.js             # CRUD animales + fetchChildren/fetchSiblings
│   ├── useEspecies.js             # CRUD especies
│   ├── useRazas.js                # CRUD razas
│   ├── useUsuarios.js             # CRUD usuarios
│   ├── useDashboard.js            # Métricas del dashboard
│   └── useGenealogy.js            # Árbol genealógico (fetchFamilyTree)
│
├── components/
│   ├── routes/
│   │   ├── ProtectedRoute.jsx     # Redirige a /login si no autenticado
│   │   └── AdminRoute.jsx         # Redirige a /dashboard si no admin
│   │
│   ├── layout/
│   │   ├── Navbar.jsx             # Barra superior responsive con drawer móvil
│   │   └── Sidebar.jsx            # Navegación lateral (visible en escritorio)
│   │
│   ├── ui/                        # Componentes atómicos reutilizables
│   │   ├── Loading.jsx            # Spinner de carga
│   │   ├── Alert.jsx              # Alertas success / error / warning / info
│   │   ├── PageHeader.jsx         # Título + breadcrumbs + botón de acción
│   │   ├── EmptyState.jsx         # Estado vacío para listas y tablas
│   │   ├── ConfirmModal.jsx       # Modal de confirmación (accesible)
│   │   ├── StatCard.jsx           # Tarjeta de métrica para dashboard
│   │   └── Badge.jsx              # Indicador de estado (activo/inactivo)
│   │
│   ├── data/
│   │   ├── DataTable.jsx          # Tabla responsive: cards en móvil, tabla en desktop
│   │   └── Pagination.jsx         # Controles de paginación
│   │
│   ├── form/
│   │   ├── FormField.jsx          # Input reutilizable con label, error, aria
│   │   ├── SelectField.jsx        # Select reutilizable (con estado loading)
│   │   └── SearchBar.jsx          # Búsqueda con debounce
│   │
│   └── genealogy/
│       └── GenealogyTree.jsx      # Grafo SVG del árbol genealógico
│
├── pages/
│   ├── auth/
│   │   ├── Login.jsx              # Inicio de sesión
│   │   └── Register.jsx           # Registro de usuario
│   │
│   ├── animales/
│   │   ├── AnimalesList.jsx       # Lista paginada con búsqueda y filtros
│   │   ├── AnimalesForm.jsx       # Crear / Editar animal
│   │   ├── AnimalDetail.jsx       # Detalle con padres, hijos, hermanos
│   │   └── AnimalTree.jsx         # Árbol genealógico (grafo SVG)
│   │
│   ├── especies/
│   │   ├── EspeciesList.jsx       # Lista paginada (admin)
│   │   └── EspeciesForm.jsx       # Crear / Editar especie
│   │
│   ├── razas/
│   │   ├── RazasList.jsx          # Lista paginada filtrable por especie (admin)
│   │   └── RazasForm.jsx          # Crear / Editar raza
│   │
│   ├── usuarios/
│   │   ├── UsuariosList.jsx       # Lista de usuarios (admin)
│   │   └── UsuariosForm.jsx       # Crear / Editar usuario (admin)
│   │
│   ├── Dashboard.jsx              # Panel de métricas
│   ├── Landing.jsx                # Página de inicio (pública)
│   ├── Perfil.jsx                 # Perfil + cambio de contraseña
│   └── NotFound.jsx               # Página 404
│
└── utils/
    └── constants.js               # Constantes compartidas (PASSWORD_REQUIREMENTS)
```

---

##  Tema: "Pradera Tecnológica"

Paleta eco-profesional que combina verdes naturaleza con acentos técnicos cian.

| Variable | Color | Uso |
|---|---|---|
| `brand-500` | `#1e5631` | Verde primario — botones principales, enlaces |
| `brand-50` | `#f2f7f4` | Fondo estados success |
| `secondary-500` | `#0ea5e9` | Cian — acciones secundarias, editar |
| `neutral-bg` | `#fafafa` | Fondo general de páginas |
| `neutral-card` | `#ffffff` | Fondo de tarjetas y paneles |
| `neutral-text` | `#1e293b` | Texto principal |
| `neutral-muted` | `#64748b` | Texto secundario / descripciones |
| `state-error-bg` | `#fef2f2` | Fondo alerta error |
| `state-warning-bg` | `#fffbeb` | Fondo alerta advertencia |
| `state-info-bg` | `#f0f9ff` | Fondo alerta informativa |
| `gender-male-bg` | `#f0f9ff` | Fondo nodo masculino en genealogía |
| `gender-female-bg` | `#fff1f2` | Fondo nodo femenino en genealogía |

---

##  Mapa de rutas

### Públicas
| Ruta | Página | Descripción |
|---|---|---|
| `/` | `Landing` | Página principal informativa |
| `/login` | `Login` | Inicio de sesión |
| `/register` | `Register` | Registro de usuario |

### Privadas (requieren autenticación)
| Ruta | Página | Descripción |
|---|---|---|
| `/dashboard` | `Dashboard` | Panel de métricas |
| `/animales` | `AnimalesList` | Lista de animales |
| `/animales/nuevo` | `AnimalesForm` | Crear animal |
| `/animales/:id` | `AnimalDetail` | Detalle + padres/hijos/hermanos |
| `/animales/:id/editar` | `AnimalesForm` | Editar animal |
| `/animales/:id/arbol` | `AnimalTree` | Árbol genealógico |
| `/especies` | `EspeciesList` | Catálogo de especies |
| `/especies/nuevo` | `EspeciesForm` | Crear especie (admin) |
| `/especies/:id/editar` | `EspeciesForm` | Editar especie (admin) |
| `/razas` | `RazasList` | Catálogo de razas |
| `/razas/nuevo` | `RazasForm` | Crear raza (admin) |
| `/razas/:id/editar` | `RazasForm` | Editar raza (admin) |
| `/perfil` | `Perfil` | Perfil + cambio de contraseña |

### Privadas + Admin
| Ruta | Página | Descripción |
|---|---|---|
| `/usuarios` | `UsuariosList` | Gestión de usuarios (solo admin) |
| `/usuarios/nuevo` | `UsuariosForm` | Crear usuario (solo admin) |
| `/usuarios/:id/editar` | `UsuariosForm` | Editar usuario (solo admin) |

### 404
| Ruta | Página |
|---|---|
| `*` | `NotFound` |

---

## 🔐 Flujo de autenticación

1. El usuario ingresa credenciales en `/login`
2. `AuthContext.login()` envía `POST /auth/login` al backend
3. El backend valida y responde con `{ success, data: { usuario, token } }`
4. El token JWT se almacena en `localStorage('token')`
5. El interceptor de Axios adjunta `Authorization: Bearer <token>` automáticamente a cada petición
6. Si el backend responde `401` (token expirado/inválido), el interceptor limpia el storage y redirige a `/login`
7. `ProtectedRoute` verifica `isAuthenticated` desde `AuthContext` — sin token, redirige a `/login`
8. `AdminRoute` verifica `user.rol === 'admin'` — sin rol admin, redirige a `/dashboard`

---

##  Instalación y ejecución

### Requisitos previos

- **Node.js** 18+
- **Backend** `linajeanimal-api` corriendo (local con Docker o desplegado)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Lucas-Santamaria390/linajeanimal-frontend.git
cd linajeanimal-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario (ver sección variables de entorno)

# 4. Iniciar servidor de desarrollo
npm run dev
```

El servidor se iniciará en `http://localhost:5173` por defecto.

---

##  Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API REST | `http://localhost:3000/api/v1` |

**Valores recomendados:**

```bash
# Local (Docker)
VITE_API_URL=http://localhost:3000/api/v1

# Producción (Render)
VITE_API_URL=https://linajeanimal-api.onrender.com/api/v1
```

---

##  Scripts disponibles

| Script | Comando | Descripción |
|---|---|---|
| `dev` | `npm run dev` | Servidor de desarrollo con HMR en `localhost:5173` |
| `build` | `npm run build` | Build de producción → directorio `dist/` |
| `preview` | `npm run preview` | Vista previa del build de producción |
| `lint` | `npm run lint` | ESLint — verifica todo el proyecto |

---

##  API REST

El frontend consume la API de `linajeanimal-api`. Documentación completa de endpoints en [`docs/API.md`](./docs/API.md).

### Resumen de endpoints

| Recurso | Métodos | Auth | Admin |
|---|---|---|---|
| `/auth/*` | POST | ❌ (público) | — |
| `/animales` | GET, POST, PUT, DELETE | ✅ Bearer | ✅ todos / ❌ solo propios |
| `/animales/:id/children` | GET | ✅ Bearer | — |
| `/animales/:id/siblings` | GET | ✅ Bearer | — |
| `/animales/:id/family-tree` | GET | ✅ Bearer | — |
| `/animales/:id/parents` | POST | ✅ Bearer | — |
| `/especies` | GET, POST, PUT, DELETE | GET público, resto admin | ✅ |
| `/razas` | GET, POST, PUT, DELETE | GET público, resto admin | ✅ |
| `/usuarios` | GET, POST, PUT, DELETE, PATCH | ✅ Bearer | ✅ |

### Formato de respuestas

```json
// Éxito
{ "success": true, "data": { ... } }
{ "success": true, "data": [ ... ], "pagination": { "page": 1, "limit": 10, "total": 100, "pages": 5 } }

// Auth
{ "success": true, "data": { "usuario": { ... }, "token": "jwt..." } }

// Error
{ "success": false, "message": "descripción del error" }
```

---

##  Estados cubiertos por página

Cada página implementa los siguientes estados visuales:

| Estado | Componente | Comportamiento |
|---|---|---|
| **Loading** | `<Loading />` | Spinner mientras se cargan datos |
| **Error** | `<Alert type="error">` | Mensaje de error del API con botón reintentar |
| **Vacío** | `<EmptyState />` | Mensaje informativo + acción opcional |
| **Success** | `<Alert type="success">` | Confirmación después de operaciones (crear, editar, eliminar) |
| **Form error** | Estado local `errors` | Errores por campo en formularios |
| **No encontrado** | `<EmptyState />` | 404 de recurso específico (animal, especie, etc.) |
| **No autorizado** | `AdminRoute` / `ProtectedRoute` | Redirección automática |

---

##  Despliegue

### Build de producción

```bash
npm run build
```

El build genera los archivos estáticos en el directorio `dist/`, listos para desplegar en cualquier servidor estático.

### Plataformas compatibles

- **Vercel** (recomendado) — [desplegado actualmente](https://linajeanimal-frontend.vercel.app), configuración SPA con rewrites
- **Netlify** — compatible con `_redirects` para SPA
- **Render Static Sites** — compatible
- Cualquier servidor web (nginx, Apache, etc.)

### Configuración SPA

Para servidores que no soporten SPA nativamente, redirigir todas las rutas a `index.html`:

**Vercel** (`vercel.json`):
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Netlify** (`public/_redirects`):
```
/* /index.html 200
```

---

##  Convenciones del proyecto

### Estilo de código
- **JavaScript** (JSX) — sin TypeScript
- **JSDoc** obligatorio en todas las funciones exportadas (verificado por ESLint)
- **ESLint** flat config con reglas de React Hooks, React Refresh y JSDoc
- **Tailwind CSS v4** — sin `tailwind.config.js`, configuración vía `@theme` en `index.css`

### Estructura
- Página → Hook → Servicio (Axios) → API Backend
- Componentes reutilizables en `src/components/`
- Lazy loading en todas las rutas con `React.lazy()` + `<Suspense>`
- Mobile-first responsive con breakpoints Tailwind (`sm:`, `md:`, `lg:`)

### Autenticación
- Token JWT en `localStorage('token')`
- Axios interceptor adjunta `Bearer` automáticamente
- 401 en endpoints no-login → limpia sesión y redirige a `/login`

---

##  Enlaces

| Recurso | URL |
|---|---|
| Frontend desplegado | [https://linajeanimal-frontend.vercel.app](https://linajeanimal-frontend.vercel.app) |
| API REST (repositorio) | [https://github.com/Lucas-Santamaria390/linajeanimal-api](https://github.com/Lucas-Santamaria390/linajeanimal-api) |
| API desplegada | [https://linajeanimal-api.onrender.com/api/v1](https://linajeanimal-api.onrender.com/api/v1) |
| Documentación Swagger | [https://linajeanimal-api.onrender.com/api/v1/docs](https://linajeanimal-api.onrender.com/api/v1/docs) |

##  Credenciales de prueba

Pobladas mediante `npm run seed` en la API:

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@linajeanimal.test` | `Admin123!` |
| Usuario | `juan@linajeanimal.test` | `User123!` |
| Usuario | `maria@linajeanimal.test` | `User123!` |

---

##  Equipo

| Rol | Integrante |
|---|---|
| Desarrollo Frontend | [Lucas-Santamaria390](https://github.com/Lucas-Santamaria390) |
| Desarrollo Frontend | [SamuraiPonchedefruta](https://github.com/SamuraiPonchedefruta) |
| Desarrollo Frontend | [XavierGonzalezG](https://github.com/XavierGonzalezG) |
| API REST | [linajeanimal-api](https://github.com/Lucas-Santamaria390/linajeanimal-api) |

---

##  Licencia

Este proyecto fue desarrollado con fines académicos para la materia **Desarrollo de Software**.
