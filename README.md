# LinajeAnimal — Frontend

Aplicación web para la **gestión de árboles genealógicos de animales**. Permite registrar animales, especies y razas, asignar relaciones familiares (padres, hijos, hermanos) y visualizar el linaje completo mediante un árbol genealógico interactivo. Desarrollado como parte de la materia **Desarrollo de Software**.

---

## Tabla de contenidos

- [Tecnologías y justificación](#tecnolog%C3%ADas-y-justificaci%C3%B3n)
- [Funcionalidades](#funcionalidades)
- [Arquitectura](#arquitectura)
- [Flujo de datos](#flujo-de-datos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Tema: "Pradera Tecnológica"](#tema-pradera-tecnol%C3%B3gica)
- [Mapa de rutas](#mapa-de-rutas)
- [Flujo de autenticación](#flujo-de-autenticaci%C3%B3n)
- [Manejo de estados de UI](#manejo-de-estados-de-ui)
- [Instalación y ejecución](#instalaci%C3%B3n-y-ejecuci%C3%B3n)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [API REST](#api-rest)
- [Despliegue](#despliegue)
- [Enlaces](#enlaces)
- [Credenciales de prueba](#credenciales-de-prueba)
- [Equipo](#equipo)

---

## Tecnologías y justificación

| Tecnología | Versión | ¿Por qué se eligió? |
|---|---|---|
| **React** | ^19.2.7 | Framework principal para construir la interfaz de usuario basada en componentes reutilizables. Se eligió React por su amplio ecosistema, su modelo declarativo que facilita el mantenimiento, y su virtual DOM que optimiza el renderizado. La versión 19 incorpora mejoras en concurrent rendering y soporte para Server Components. |
| **Vite** | ^8.1.0 | Bundler y dev server ultrarrápido. A diferencia de Create React App (obsoleto) o Webpack (más lento), Vite utiliza esbuild para el pre-bundling y sirve módulos ES nativos en desarrollo, lo que resulta en un HMR (Hot Module Replacement) instantáneo. El build de producción utiliza Rollup, ofreciendo bundles optimizados. |
| **React Router DOM** | ^7.18.0 | Enrutador SPA oficial de React. Permite navegación del lado del cliente sin recargar la página, lazy loading de rutas con `React.lazy()` y protección de rutas mediante componentes wrapper (`ProtectedRoute`, `AdminRoute`). La v7 introduce loaders y acciones basadas en el estándar de Web Fetch API. |
| **Axios** | ^1.18.1 | Cliente HTTP con soporte de interceptores, algo que fetch nativo no ofrece de forma nativa. Se usa para: (1) configurar una instancia única con base URL, (2) adjuntar automáticamente el token JWT via interceptor de request, (3) manejar errores 401 globalmente via interceptor de response, limpiando sesión y redirigiendo al login. |
| **Tailwind CSS** | ^4.3.1 | Framework de estilos utility-first. Se eligió sobre CSS tradicional o styled-components porque: (1) acelera el desarrollo con clases utilitarias atómicas, (2) evita nombres de clases conflictivos, (3) el purge automático elimina CSS no usado en producción, resultando en bundles mínimos. La v4 integra el motor CSS nativo de Lightning CSS y permite configuración vía `@theme` en CSS, eliminando la necesidad de `tailwind.config.js`. |
| **ESLint** | ^10.5.0 | Linter que asegura calidad y consistencia del código. Configuración flat (nuevo formato en v9+) con plugins para React Hooks (reglas de dependencias), React Refresh (evita reinicios completos en HMR) y JSDoc (documentación obligatoria en funciones exportadas). |
| **@vitejs/plugin-react** | ^6.0.2 | Plugin oficial de Vite para React: provee soporte para JSX, Fast Refresh y optimizaciones de compilación. |
| **@tailwindcss/vite** | ^4.3.1 | Plugin de Vite para Tailwind v4 que integra el motor Lightning CSS directamente en el pipeline de build, eliminando la necesidad de PostCSS. |

---

## Funcionalidades

| Funcionalidad | Descripción |
|---|---|
| **Autenticación** | Registro e inicio de sesión con JWT, sesión persistente en `localStorage`, cierre de sesión. |
| **Dashboard** | Resumen con métricas: total animales, especies, razas y últimos animales registrados. |
| **CRUD Animales** | Crear, listar (con paginación, búsqueda y filtros), ver detalle, editar y eliminar animales. |
| **Árbol genealógico** | Visualización interactiva tipo grafo SVG con padres, hijos y hermanos por generaciones. |
| **CRUD Especies** | Catálogo de especies con búsqueda, paginación y activación/desactivación (solo admin). |
| **CRUD Razas** | Catálogo de razas filtrable por especie, paginación y activación/desactivación (solo admin). |
| **Gestión de usuarios** | CRUD completo de usuarios y activación/desactivación (solo admin). |
| **Perfil** | Datos personales en solo lectura + cambio de contraseña con validación en vivo. |
| **Paleta "Pradera Tecnológica"** | Diseño eco-profesional con tonos naturaleza verde + acento cian técnico. |

---

## Arquitectura

El frontend sigue una **arquitectura por capas** con separación clara de responsabilidades:

```
Página (presentación)
    ↓
Custom Hook (lógica de estado y efectos)
    ↓
Servicio (llamadas HTTP con Axios)
    ↓
API Backend (REST)
    ↕
AuthContext (estado global de autenticación)
```

### Capas en detalle

1. **Páginas** (`src/pages/`): Componentes de presentación. Cada página corresponde a una ruta. Importan hooks personalizados para obtener datos y manejar eventos. No realizan llamadas HTTP directamente.

2. **Custom Hooks** (`src/hooks/`): Encapsulan la lógica de estado (carga, error, datos, acciones CRUD). Cada hook se encarga de llamar a los servicios y exponer un objeto con `{ data, loading, error, acciones }`. Esto mantiene las páginas limpias y permite reutilizar lógica entre componentes.

3. **Servicios** (`src/services/`): Capa de comunicación con la API. Cada entidad (animales, especies, razas, usuarios, auth) tiene su propio archivo que exporta funciones que usan la instancia Axios preconfigurada.

4. **AuthContext** (`src/context/AuthContext.jsx`): Estado global de autenticación usando Context API de React. Provee `user`, `token`, `login()`, `logout()` y `isAuthenticated` a toda la aplicación.

5. **Instancia Axios** (`src/services/api.js`): Configuración única con interceptores de request (adjunta Bearer token) y response (maneja 401 global).

### Principios aplicados

- **Responsabilidad única**: cada archivo tiene un propósito claro
- **Composición**: componentes pequeños y reutilizables se combinan para formar UI complejas
- **Inversión de dependencias**: las páginas dependen de hooks, los hooks dependen de servicios, los servicios dependen de una instancia Axios
- **Lazy loading**: las rutas se cargan bajo demanda con `React.lazy()` y `<Suspense>`, mejorando el tiempo de carga inicial

---

## Flujo de datos

### Ejemplo: Listar animales

```
AnimalesList.jsx
  ↓ usa
useAnimales.js (fetchAnimales)
  ↓ llama
animales.js (getAll)
  ↓ usa
api.js (instancia Axios + interceptor token)
  ↓ GET /animales?page=1&limit=10&search=&especie=
API Backend
  ↓ responde
{ success: true, data: [...], pagination: {...} }
  ↓
useAnimales actualiza estado { animales, loading, error }
  ↓
AnimalesList renderiza DataTable, Pagination, o Alert/EmptyState según el estado
```

### Flujo de autenticación

```
Login.jsx
  ↓
AuthContext.login(email, password)
  ↓
auth.js (login) → POST /auth/login
  ↓
API responde { success, data: { usuario, token } }
  ↓
AuthContext:
  1. Guarda token en localStorage('token')
  2. Guarda usuario en localStorage('user')
  3. Actualiza estado: user, token, isAuthenticated = true
  ↓
ProtectedRoute ya no redirige → renderiza contenido privado
```

### Interceptor de seguridad

```
Cada request Saliente:
  api.interceptors.request.use()
    → Lee token de localStorage
    → Adjunta header: Authorization: Bearer <token>

Cada response Entrante:
  api.interceptors.response.use()
    → Si status 401 (y no es /auth/login):
      1. Limpia localStorage (token, user)
      2. Marca sesión expirada en sessionStorage
      3. Redirige a /login
```

---

## Estructura del proyecto

```
src/
├── main.jsx                       # Punto de entrada, renderiza <App />
├── App.jsx                        # Componente raíz, envuelve <AppRouter />
├── index.css                      # Configuración Tailwind v4 + tema "Pradera Tecnológica"
│
├── routes/
│   └── AppRouter.jsx              # BrowserRouter, AuthProvider, Navbar, Routes con lazy()
│
├── context/
│   └── AuthContext.jsx            # AuthProvider con login/logout/register, expone useAuth
│
├── services/                      # Comunicación con la API REST
│   ├── api.js                     # Instancia Axios (baseURL, interceptores request/response)
│   ├── auth.js                    # login, register, getProfile, changePassword
│   ├── animales.js                # CRUD + children, siblings, familyTree, parents
│   ├── especies.js                # CRUD especies + toggleActive (PATCH)
│   ├── razas.js                   # CRUD razas + toggleActive (PATCH)
│   └── usuarios.js                # CRUD usuarios + toggleActive
│
├── hooks/                         # Lógica de estado y efectos
│   ├── useAnimales.js             # Estados loading/error/data + CRUD + fetchChildren/Siblings
│   ├── useEspecies.js             # CRUD especies
│   ├── useRazas.js                # CRUD razas
│   ├── useUsuarios.js             # CRUD usuarios
│   ├── useDashboard.js            # Métricas del dashboard
│   └── useGenealogy.js            # Árbol genealógico (fetchFamilyTree)
│
├── components/                    # Componentes reutilizables
│   ├── routes/
│   │   ├── ProtectedRoute.jsx     # Redirige a /login si no autenticado
│   │   └── AdminRoute.jsx         # Redirige a /dashboard si no admin
│   │
│   ├── layout/
│   │   ├── Navbar.jsx             # Barra superior responsive con drawer móvil
│   │   └── Sidebar.jsx            # Navegación lateral (escritorio)
│   │
│   ├── ui/                        # Componentes atómicos
│   │   ├── Loading.jsx            # Spinner de carga
│   │   ├── Alert.jsx              # Alertas success / error / warning / info
│   │   ├── PageHeader.jsx         # Título + breadcrumbs + botón de acción
│   │   ├── EmptyState.jsx         # Estado vacío para listas y tablas
│   │   ├── ConfirmModal.jsx       # Modal de confirmación accesible
│   │   ├── StatCard.jsx           # Tarjeta de métrica para dashboard
│   │   └── Badge.jsx              # Indicador de estado (activo/inactivo)
│   │
│   ├── data/
│   │   ├── DataTable.jsx          # Tabla responsive: cards en móvil, filas en desktop
│   │   └── Pagination.jsx         # Controles de paginación
│   │
│   ├── form/
│   │   ├── FormField.jsx          # Input con label, error, atributos aria
│   │   ├── SelectField.jsx        # Select reutilizable (con estado loading)
│   │   └── SearchBar.jsx          # Búsqueda con debounce
│   │
│   └── genealogy/
│       └── GenealogyTree.jsx      # Grafo SVG del árbol genealógico interactivo
│
├── pages/                         # Una página por ruta
│   ├── auth/
│   │   ├── Login.jsx              # Inicio de sesión
│   │   └── Register.jsx           # Registro de usuario
│   │
│   ├── animales/
│   │   ├── AnimalesList.jsx       # Lista paginada con búsqueda y filtros
│   │   ├── AnimalesForm.jsx       # Crear / Editar animal
│   │   ├── AnimalDetail.jsx       # Detalle con padres, hijos, hermanos
│   │   └── AnimalTree.jsx         # Árbol genealógico (grafo SVG interactivo)
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
│   ├── Landing.jsx                # Página de inicio pública
│   ├── Perfil.jsx                 # Perfil + cambio de contraseña
│   └── NotFound.jsx               # Página 404
│
└── utils/
    └── constants.js               # Constantes compartidas (reglas de contraseña, etc.)
```

### Criterios de organización

- **Componentes atómicos** (`ui/`): elementos pequeños y reutilizables (Loading, Alert, Badge)
- **Componentes de datos** (`data/`): DataTable y Pagination, genéricos para cualquier entidad
- **Componentes de formulario** (`form/`): inputs reutilizables con validación y accesibilidad
- **Componentes de layout** (`layout/`): estructura general de la aplicación (Navbar, Sidebar)
- **Páginas** (`pages/`): organizadas por dominio (auth, animales, especies, etc.)

---

## Tema: "Pradera Tecnológica"

Paleta eco-profesional que combina verdes naturaleza con acentos técnicos cian, definida completamente en `index.css` mediante la directiva `@theme` de Tailwind v4.

| Variable CSS | Color | Uso |
|---|---|---|
| `brand-500` | `#1e5631` | Verde primario — botones principales, enlaces |
| `brand-50` | `#f2f7f4` | Fondo para estados success |
| `secondary-500` | `#0ea5e9` | Cian técnico — acciones secundarias, botón editar |
| `neutral-bg` | `#fafafa` | Fondo general de páginas |
| `neutral-card` | `#ffffff` | Fondo de tarjetas y paneles |
| `neutral-text` | `#1e293b` | Texto principal |
| `state-error-bg` | `#fef2f2` | Fondo para alertas de error |
| `state-warning-bg` | `#fffbeb` | Fondo para alertas de advertencia |
| `state-info-bg` | `#f0f9ff` | Fondo para alertas informativas |
| `gender-male-bg` | `#f0f9ff` | Fondo de nodo masculino en genealogía |
| `gender-female-bg` | `#fff1f2` | Fondo de nodo femenino en genealogía |

---

## Mapa de rutas

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

## Flujo de autenticación

1. El usuario ingresa credenciales en `/login`
2. `AuthContext.login()` envía `POST /auth/login` al backend
3. El backend valida y responde con `{ success, data: { usuario, token } }`
4. El token JWT se almacena en `localStorage('token')` y el usuario en `localStorage('user')`
5. El interceptor de Axios adjunta `Authorization: Bearer <token>` automáticamente a cada petición saliente
6. Si el backend responde `401` (token expirado o inválido), el interceptor limpia el storage y redirige a `/login`
7. `ProtectedRoute` verifica `isAuthenticated` desde `AuthContext` — sin token, redirige a `/login`
8. `AdminRoute` verifica `user.rol === 'admin'` — sin rol admin, redirige a `/dashboard`

---

## Manejo de estados de UI

Cada página implementa los siguientes estados visuales para cubrir todos los escenarios de interacción:

| Estado | Componente | Comportamiento |
|---|---|---|
| **Loading** | `<Loading />` | Spinner mientras se cargan datos desde la API |
| **Error** | `<Alert type="error">` | Mensaje de error con botón reintentar |
| **Vacío** | `<EmptyState />` | Mensaje informativo + acción opcional (ej. "Crear primer animal") |
| **Success** | `<Alert type="success">` | Confirmación después de operaciones exitosas |
| **Form error** | Estado local `errors` | Validación por campo con mensajes específicos |
| **No encontrado** | `<EmptyState />` | 404 de recurso específico (animal, especie, etc.) |
| **No autorizado** | `AdminRoute` / `ProtectedRoute` | Redirección automática |

---

## Instalación y ejecución

### Requisitos previos

- **Node.js** 18+ (versión LTS recomendada)
- **npm** 9+ (incluido con Node.js)
- **Backend** `linajeanimal-api` corriendo (local con Docker o desplegado en Render)

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

El servidor se iniciará en `http://localhost:5173` por defecto con HMR (Hot Module Replacement) activo.

---

## Variables de entorno

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

Las variables con prefijo `VITE_` son expuestas automáticamente por Vite al código del cliente mediante `import.meta.env`.

---

## Scripts disponibles

| Script | Comando | Descripción |
|---|---|---|
| `dev` | `npm run dev` | Servidor de desarrollo con HMR en `localhost:5173` |
| `build` | `npm run build` | Build de producción con Rollup → directorio `dist/` |
| `preview` | `npm run preview` | Vista previa local del build de producción |
| `lint` | `npm run lint` | ESLint — verifica reglas de calidad en todo el proyecto |

---

## API REST

El frontend consume la API REST de `linajeanimal-api`. Todas las respuestas siguen un formato uniforme.

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
| `/especies/:id` | PATCH | ✅ Bearer | ✅ (toggle active) |
| `/razas` | GET, POST, PUT, DELETE | GET público, resto admin | ✅ |
| `/razas/:id` | PATCH | ✅ Bearer | ✅ (toggle active) |
| `/usuarios` | GET, POST, PUT, DELETE, PATCH | ✅ Bearer | ✅ |

### Filtros disponibles

| Recurso | Parámetro GET | Valores | Descripción |
|---|---|---|---|
| `GET /especies` | `active` | `true`, `false` | Filtra por estado. Por defecto solo activas. |
| `GET /razas` | `active` | `true`, `false` | Filtra por estado. Por defecto solo activas. |
| `GET /razas` | `especie` | ID | Filtra por especie. |

### Activación/Desactivación (Admin)

| Recurso | Método | Body | Descripción |
|---|---|---|---|
| `PATCH /especies/:id` | PATCH | `{ "active": true/false }` | Activa o desactiva una especie. Error `409` si tiene animales activos. |
| `PATCH /razas/:id` | PATCH | `{ "active": true/false }` | Activa o desactiva una raza. Error `409` si tiene animales activos. |

### Formato de respuestas

```json
// Éxito (lista con paginación)
{ "success": true, "data": [ ... ], "pagination": { "page": 1, "limit": 10, "total": 100, "pages": 5 } }

// Éxito (objeto individual)
{ "success": true, "data": { ... } }

// Éxito (autenticación)
{ "success": true, "data": { "usuario": { ... }, "token": "jwt..." } }

// Error
{ "success": false, "message": "descripción del error" }
```

---

## Despliegue

### Build de producción

```bash
npm run build
```

Genera archivos estáticos optimizados en el directorio `dist/`, listos para cualquier servidor estático.

### Plataformas compatibles

- **Vercel** (recomendado) — configuración SPA con rewrites en `vercel.json`
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

## Enlaces

| Recurso | URL |
|---|---|
| Frontend desplegado | [https://linajeanimal-frontend.vercel.app](https://linajeanimal-frontend.vercel.app) |
| API REST (repositorio) | [https://github.com/Lucas-Santamaria390/linajeanimal-api](https://github.com/Lucas-Santamaria390/linajeanimal-api) |
| API desplegada | [https://linajeanimal-api.onrender.com/api/v1](https://linajeanimal-api.onrender.com/api/v1) |
| Documentación Swagger | [https://linajeanimal-api.onrender.com/api/v1/docs](https://linajeanimal-api.onrender.com/api/v1/docs) |

---

## Credenciales de prueba

Pobladas mediante `npm run seed` en la API:

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@linajeanimal.test` | `Admin123!` |
| Usuario | `juan@linajeanimal.test` | `User123!` |
| Usuario | `maria@linajeanimal.test` | `User123!` |

---

## Equipo

| Rol | Integrante |
|---|---|
| Desarrollo Frontend | [Lucas-Santamaria390](https://github.com/Lucas-Santamaria390) |
| Desarrollo Frontend | [SamuraiPonchedefruta](https://github.com/SamuraiPonchedefruta) |
| Desarrollo Frontend | [XavierGonzalezG](https://github.com/XavierGonzalezG) |
| API REST | [linajeanimal-api](https://github.com/Lucas-Santamaria390/linajeanimal-api) |

---

## Licencia

Este proyecto fue desarrollado con fines académicos para la materia **Desarrollo de Software**.
