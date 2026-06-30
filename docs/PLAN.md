# Plan de Desarrollo — LinajeAnimal Frontend

## 1. Resumen ejecutivo

Aplicación React para gestionar un **árbol genealógico de animales**. Consume la API REST de `linajeanimal-api`. Permite autenticación, CRUD de animales/especies/razas/usuarios, y visualización del árbol genealógico.

**Tema del parcial:** Gestión de animales con trazabilidad genealógica.

---

## 2. Mapa de navegación (Sitemap)

```
Públicas:
  /                  → Landing / Home (pública)
  /login             → Inicio de sesión
  /register          → Registro de usuario

Privadas:
  /dashboard         → Dashboard con resumen de datos
  /animales          → Lista de animales (CRUD)
  /animales/nuevo    → Crear animal
  /animales/:id      → Detalle de animal + árbol genealógico
  /animales/:id/editar → Editar animal
  /especies          → Lista de especies (CRUD, solo admin)
  /especies/nuevo    → Crear especie (admin)
  /especies/:id/editar → Editar especie (admin)
  /razas             → Lista de razas (CRUD, solo admin)
  /razas/nuevo       → Crear raza (admin)
  /razas/:id/editar  → Editar raza (admin)
  /usuarios          → Lista de usuarios (solo admin)
  /usuarios/nuevo    → Crear usuario (admin)
  /usuarios/:id/editar → Editar usuario (admin)
  /perfil            → Perfil del usuario autenticado

404:
  *                  → Página no encontrada
```

---

## 3. Pantallas — especificación detallada

### 3.1 Landing (`/`) — Pública

**Propósito:** Página principal informativa.

**Contenido:**
- Hero section: título + descripción del sistema
- Carrusel o sección de características (3-4 cards)
- Footer con links

**Estados:** Solo presentación (sin API)

**Responsive:**
- **Móvil (< 768px):** Hero apilado, cards en 1 columna
- **Tablet (768-1024px):** Cards en 2 columnas
- **PC (> 1024px):** Hero lado a lado, cards en 3-4 columnas

---

### 3.2 Login (`/login`) — Pública ✅ (ya existe)

**Propósito:** Autenticar usuario.

**Estados:**
- **Form:** email + password con validación por campo
- **Error:** alerta rojo con mensaje del API
- **Loading:** spinner en botón de submit (ya implementado)
- **Success:** redirección a `/dashboard`

**Responsive:** Centrado, max-w-sm en todas las pantallas (ya funciona)

---

### 3.3 Register (`/register`) — Pública

**Propósito:** Registrar nuevo usuario (público).

**Estados:**
- **Form:** nombre, email, password, confirmar password
- **Validación:** email formato, password ≥ 8 min (mayúscula, número, especial), confirm match
- **Error:** alerta con mensaje del API (email duplicado, validación)
- **Loading:** spinner en botón
- **Success:** redirect a login con mensaje "Registro exitoso, inicia sesión"

**Responsive:** Igual que Login (centrado, max-w-sm)

---

### 3.4 Dashboard (`/dashboard`) — Privada

**Propósito:** Resumen general con métricas del sistema.

**Estados:**
- **Loading:** esqueleto/spinner mientras carga data
- **Success:** cards con:
  - Total animales activos
  - Total especies
  - Total razas
  - Total usuarios (si admin)
  - Últimos animales registrados (tabla pequeña)
- **Error:** alerta si falla la carga
- **Empty:** si no hay datos, mostrar mensaje "Aún no hay registros"

**Responsive:**
- **Móvil:** cards 1 columna, tabla horizontal con scroll
- **Tablet:** cards 2 columnas
- **PC:** cards 3-4 columnas

**Nota:** No existe un endpoint `/dashboard` ni `/stats`. Las métricas se obtienen agregando datos de múltiples endpoints: `GET /animales?limit=1` (total), `GET /especies` (total especies), `GET /razas` (total razas), `GET /usuarios?limit=1` (total usuarios, admin). Puede combinarse con `Promise.all` para carga paralela.

**Hooks:** `useDashboard` (combina hooks individuales)

---

### 3.5 Animales — Lista (`/animales`) — Privada

**Propósito:** Listar, buscar y paginar animales.

**Estados:**
- **Loading:** spinner
- **Success:** tabla responsiva con columnas: nombre, especie, raza, sexo, identificador, acciones
- **Empty:** ilustración + "No hay animales registrados" + botón "Crear primero"
- **Error:** alerta con reintento
- **Search:** barra de búsqueda por nombre (el API solo soporta filtro por `nombre`, no por `identificador`)
- **Filtros:** especie, raza, sexo (selects)
- **Paginación:** controles inferior

**Acciones por fila:**
- Ver detalle → `/animales/:id`
- Editar → `/animales/:id/editar`
- Eliminar → modal de confirmación (soft delete)

**Responsive:**
- **Móvil:** tabla convertida a cards (cada animal es una card apilable)
- **Tablet/PC:** tabla normal con scroll horizontal

**Filtro por propietario:**
- **Admin:** ve todos los animales (sin filtro)
- **User:** solo ve sus animales (`propietario: user._id` en los params)
- Pendiente de implementar en `AnimalesList.jsx`

**Hooks:** `useAnimales`

---

### 3.6 Animal — Formulario (`/animales/nuevo`, `/animales/:id/editar`) — Privada

**Propósito:** Crear o editar un animal.

**Campos:**
- Nombre (text, obligatorio)
- Especie (select, obligatorio, carga especies activas)
- Raza (select, obligatorio, filtrado por especie, carga razas activas)
- Sexo (select: macho/hembra, obligatorio)
- Fecha de nacimiento (datepicker, obligatorio, no futura)
- Peso (number, opcional)
- Color (text, opcional)
- Identificador (text, opcional, único)
- Foto URL (text/url, opcional)
- Notas (textarea, opcional)
- Padre (select con animales de la misma especie y sexo macho, opcional)
- Madre (select con animales de la misma especie y sexo hembra, opcional)

**Estados:**
- **Loading (edición):** spinner mientras carga datos del animal
- **Loading (especies/razas):** selects deshabilitados con "Cargando..."
- **Error carga:** alerta + botón reintentar
- **Error submit:** alerta con error del API (validación, duplicado)
- **Success:** redirect a lista con alerta de éxito
- **Validation:** errores por campo (obligatorios, formato, fecha futura)

**Responsive:**
- **Móvil:** 1 columna
- **Tablet/PC:** 2 columnas para campos, selects lado a lado

**Propietario:**
- Se asigna automáticamente el ID del usuario autenticado al crear
- No se muestra en el formulario (es transparente para el user)
- El admin puede ver/quién es el propietario en el detalle
- Pendiente de implementar en `AnimalesForm.jsx`

**Hooks:** `useAnimalForm`, `useEspecies`, `useRazas`

---

### 3.7 Animal — Detalle (`/animales/:id`) — Privada

**Propósito:** Ver información completa del animal y su árbol genealógico.

**Contenido:**
- Información del animal (card con todos los campos)
- Sección de padres (nombre, enlace a detalle)
- Sección de hijos (lista, enlace a detalle)
- Sección de hermanos (lista, enlace a detalle)
- **Árbol genealógico** (visualización jerárquica con nodos conectados)
- **Query param:** `?generaciones=3` (default 3, max 5) para profundidad del árbol

**Estados:**
- **Loading:** skeleton mientras carga
- **Error:** alerta + botón reintentar
- **Empty (hijos/hermanos):** "No tiene hijos registrados" / "No tiene hermanos"
- **Success:** toda la info desplegada
- **Not found:** alerta 404 si el ID no existe

**Responsive:**
- **Móvil:** lista jerárquica indentada con toggle expand/collapse por nodo (sin grafo visual por falta de espacio)
- **Tablet/PC:** grafo SVG/Canvas con nodos conectados, zoom y pan

**Hooks:** `useAnimal`, `useGenealogy`

---

### 3.8 Especies — Lista (`/especies`) — Privada (admin)

**Propósito:** Listar especies.

**Estados:**
- **Loading / Empty / Error / Success**
- Tabla o cards con: nombre, descripción, acciones

**Acciones:** Crear, Editar, Desactivar (con confirmación)

**Responsive:** Igual que Animales lista

**Hooks:** `useEspecies`

---

### 3.9 Especies — Formulario (`/especies/nuevo`, `/especies/:id/editar`) — Privada (admin)

**Campos:** nombre (obligatorio), descripción (opcional)

**Estados:**
- **Loading (edición):** spinner mientras carga datos de la especie
- **Error carga:** alerta + botón reintentar
- **Error submit:** alerta con error del API (duplicado, validación)
- **Success:** redirect a lista con alerta de éxito
- **Validation:** nombre obligatorio, mínimo 2 caracteres

**Validación:** nombre obligatorio (min 2 caracteres), descripción opcional

**Responsive:**
- **Móvil:** 1 columna
- **Tablet/PC:** 2 columnas

---

### 3.10 Razas — Lista (`/razas`) — Privada (admin)

**Estados:** Igual que Especies

**Filtro:** por especie (select)

**Hooks:** `useRazas`

**Responsive:** Igual que Animales lista

---

### 3.11 Razas — Formulario (`/razas/nuevo`, `/razas/:id/editar`) — Privada (admin)

**Campos:** nombre (obligatorio), especie (select, obligatorio), descripción (opcional)

**Estados:**
- **Loading (edición):** spinner mientras carga datos de la raza
- **Loading (especies):** select deshabilitado con "Cargando..."
- **Error carga:** alerta + botón reintentar
- **Error submit:** alerta con error del API (duplicado, validación)
- **Success:** redirect a lista con alerta de éxito
- **Validation:** nombre obligatorio, especie obligatoria

**Validación:** nombre obligatorio (min 2), especie obligatoria (selección requerida)

**Responsive:**
- **Móvil:** 1 columna
- **Tablet/PC:** 2 columnas

---

### 3.12 Usuarios — Lista (`/usuarios`) — Privada (admin)

**Estados:** Loading / Empty / Error / Success

**Tabla:** nombre, email, rol, activo, acciones (editar, desactivar)

**Hooks:** `useUsuarios`

**Responsive:** Igual que Animales lista

---

### 3.13 Usuarios — Formulario (`/usuarios/nuevo`, `/usuarios/:id/editar`) — Privada (admin)

**Campos crear:** nombre, email, password, rol (select admin/user)
**Campos editar:** nombre, email, rol
**No permite:** auto-desactivación

**Estados:**
- **Loading (edición):** spinner mientras carga datos del usuario
- **Error carga:** alerta + botón reintentar
- **Error submit:** alerta con error del API (email duplicado, validación)
- **Success:** redirect a lista con alerta de éxito
- **Validation:** nombre obligatorio, email formato válido, password ≥ 8 (solo en crear)

**Validación:**
- Crear: nombre obligatorio, email formato válido, password ≥ 8 caracteres con mayúscula/número/especial
- Editar: nombre obligatorio, email formato válido

**Responsive:**
- **Móvil:** 1 columna
- **Tablet/PC:** 2 columnas

---

### 3.14 Perfil (`/perfil`) — Privada

**Propósito:** Ver y editar perfil propio, cambiar contraseña.

**Secciones:**
- Datos personales (nombre, email) — solo lectura (no hay PUT /auth/profile)
- Cambiar contraseña: oldPassword + newPassword → `PUT /auth/password`
- Cerrar sesión (botón)

**Validación cambio contraseña:** oldPassword obligatorio, newPassword ≥ 8 caracteres con mayúscula/número/especial, confirm new password debe coincidir

**Responsive:**
- **Móvil:** 1 columna, datos apilados
- **Tablet/PC:** 2 columnas, formulario de cambio de contraseña al lado de datos personales

**Estados:** Loading / Error / Success

---

## 4. Componentes reutilizables

| Componente | Propósito | Estado |
|---|---|---|
| `Navbar` | Barra de navegación superior | ✅ Existe (mejorar menú responsive) |
| `ProtectedRoute` | Protege rutas privadas | ✅ Existe |
| `Loading` | Spinner de carga | ✅ Existe |
| `Alert` | Mensajes informativos/error | ✅ Existe |
| `Sidebar` | Navegación lateral (admin) | ❌ Crear |
| `DataTable` | Tabla responsiva con paginación | ❌ Crear |
| `Pagination` | Controles de paginación | ❌ Crear |
| `FormField` | Input + label + error | ❌ Crear |
| `SelectField` | Select + label + error | ❌ Crear |
| `ConfirmModal` | Modal de confirmación (eliminar) | ❌ Crear |
| `PageHeader` | Título + botón de acción | ❌ Crear |
| `EmptyState` | Mensaje cuando no hay datos | ❌ Crear |
| `StatCard` | Card de métrica (dashboard) | ❌ Crear |
| `SearchBar` | Campo de búsqueda con icono | ❌ Crear |
| `GenealogyTree` | Visualización del árbol genealógico | ❌ Crear |

---

## 5. Hooks

| Hook | Funciones | Servicios que consume |
|---|---|---|
| `useAuth` | login, logout, register, user, token | `api.js` (ya existe en context) |
| `useAnimales` | list, create, update, remove, getById | `animales.js` |
| `useAnimal` | getById (detalle individual) | `animales.js` |
| `useGenealogy` | getChildren, getSiblings, getFamilyTree | `animales.js` |
| `useEspecies` | list, create, update, remove, getById | `especies.js` |
| `useRazas` | list (con filtro especie), create, update, remove, getById | `razas.js` |
| `useUsuarios` | list, create, update, remove, getById, toggleActive | `usuarios.js` |

Cada hook expone: `{ data, loading, error, pagination, refetch }` + operaciones CRUD.

---

## 6. Servicios (Axios)

| Archivo | Endpoints |
|---|---|
| `auth.js` | `POST /auth/login`, `POST /auth/register`, `GET /auth/profile`, `PUT /auth/password`, `POST /auth/logout` |
| `animales.js` | `GET /animales`, `POST /animales`, `GET /animales/:id`, `PUT /animales/:id`, `DELETE /animales/:id`, `GET /animales/:id/children`, `GET /animales/:id/siblings`, `GET /animales/:id/family-tree`, `POST /animales/:id/parents` |
| `especies.js` | `GET /especies`, `POST /especies`, `GET /especies/:id`, `PUT /especies/:id`, `DELETE /especies/:id` |
| `razas.js` | `GET /razas`, `POST /razas`, `GET /razas/:id`, `PUT /razas/:id`, `DELETE /razas/:id` |
| `usuarios.js` | `GET /usuarios`, `POST /usuarios`, `GET /usuarios/:id`, `PUT /usuarios/:id`, `DELETE /usuarios/:id`, `PATCH /usuarios/:id` |

Todos usan la instancia base de `api.js` y siguen el mismo patrón:
```js
import api from './api'
export const getAnimales = (params) => api.get('/animales', { params })
```

---

## 7. Estrategia responsive

Basada en Tailwind CSS v4 (mobile-first):

| Breakpoint | Tailwind | Target |
|---|---|---|
| Default | `(min-width: 0)` | Móvil (< 640px) |
| `sm` | 640px | Móvil grande |
| `md` | 768px | Tablet |
| `lg` | 1024px | PC / Laptop |
| `xl` | 1280px | PC grande |

**Decisiones de layout:**
- **Tablas:** en móvil se convierten a cards (cada fila es una card con datos apilados). En tablet/PC se muestra tabla normal.
- **Formularios:** 1 columna en móvil, 2 columnas selectivas en PC.
- **Navbar:** menú hamburguesa en móvil, enlaces visibles en PC.
- **Sidebar:** oculta en móvil (menú hamburguesa), visible en PC.
- **Grids:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` para cards.

**Patrón de implementación:**
```jsx
// Móvil: tabla como cards
<div className="block lg:hidden">
  {data.map(item => <MobileCard key={item._id} item={item} />)}
</div>
// Tablet/PC: tabla
<table className="hidden lg:table w-full">...</table>
```

---

## 8. Paleta de colores — "Pradera Tecnológica"

Paleta eco-profesional que combina verdes naturaleza con azul cian técnico.

### Código para `src/index.css`

```css
@import "tailwindcss";

@theme {
  --color-brand-50: #f2f7f4;
  --color-brand-100: #e2ede7;
  --color-brand-200: #c5dbcf;
  --color-brand-300: #9bbfae;
  --color-brand-400: #6c9e88;
  --color-brand-500: #1e5631;
  --color-brand-600: #153f24;
  --color-brand-700: #11321d;
  --color-brand-800: #0e2918;
  --color-brand-900: #0a1f12;

  --color-secondary-500: #0ea5e9;
  --color-secondary-600: #0284c7;

  --color-neutral-bg: #fafafa;
  --color-neutral-card: #ffffff;
  --color-neutral-text: #1e293b;
  --color-neutral-muted: #64748b;
}
```

### Guía de uso

| Variable | Uso |
|---|---|
| `brand-500` (#1e5631) | Navbar, botones primarios, enlaces, títulos |
| `brand-600` / `700` | Hover de botones primarios |
| `secondary-500` (#0ea5e9) | Botones secundarios, badges, bordes activos |
| `secondary-600` (#0284c7) | Hover de secondary |
| `brand-50` / `100` | Fondos de tarjetas, alertas de éxito |
| `neutral-bg` | Fondo general de páginas |
| `neutral-card` | Fondo de cards y contenedores |
| `neutral-text` | Texto principal |
| `neutral-muted` | Texto secundario (labels, hints) |

---

## 9. Cobertura de requerimientos del parcial

| # | Requerimiento | Cómo se cubre |
|---|---|---|
| 1 | Proyecto React con Vite | ✅ Ya creado |
| 2 | Consumo API REST | Servicios con Axios, todos los endpoints |
| 3 | Autenticación | Login, register, token en localStorage, interceptor 401 |
| 4 | Rutas públicas/privadas | ProtectedRoute, redirect a /login |
| 5 | Manejo de estado | useState, useContext (AuthContext), custom hooks con loading/error/data |
| 6 | Componentes reutilizables | 15 componentes (Navbar, DataTable, FormField, etc.) |
| 7 | Formularios y validación | Validación por campo, mensajes de error, formato email, password min |
| 8 | CRUD desde interfaz | Animales (entidad principal): listar, crear, editar, eliminar |
| 9 | Seguridad básica | Rutas protegidas, token en peticiones, 401 → logout, soft delete |
| 10 | Despliegue | Vercel + conexión con API desplegada en Render |

---

## 10. Entregables y despliegue

### Entregables del parcial

1. **Repositorio GitHub:** `https://github.com/Lucas-Santamria390/linajeanimal-frontend`
2. **Frontend desplegado:** Vercel (`linajeanimal-frontend.vercel.app` o dominio personalizado)
3. **API desplegada:** `https://linajeanimal-api.onrender.com/api/v1`
4. **README.md:** con nombre del proyecto, descripción, tecnologías, instrucciones, variables de entorno, credenciales de prueba, capturas

### Estrategia de despliegue (Vercel)

- Build command: `npm run build`
- Output directory: `dist/`
- Variable de entorno: `VITE_API_URL=https://linajeanimal-api.onrender.com/api/v1`
- Conectar repositorio de GitHub a Vercel para deploy automático por push a main

---

## 11. Restricciones del proyecto

### No mock data
Toda la información debe provenir de la API real. Prohibido simular datos, hardcodear respuestas falsas o usar datos de ejemplo en componentes y páginas. La única excepción es la Landing page que es puramente presentacional.

### Base URL correcta
`api.js` debe tener `VITE_API_URL` como variable de entorno con fallback `http://localhost:3000/api/v1` (incluyendo `/v1`). El fallback actual en el código es `http://localhost:3000/api` sin `/v1` — debe corregirse.

### Prohibiciones
- No console.log sin propósito en producción
- No código comentado
- No importaciones no usadas
- No frontend desconectado del backend

---

## 12. Flujo de datos (página → hook → servicio → API)

```
Página (Animales.jsx)
  → useAnimales(listParams)
    → animalesService.getAnimales(params)
      → api.get('/animales', { params })
        → GET https://linajeanimal-api.onrender.com/api/v1/animales
      ← { success, data, pagination }
    ← { animales, loading, error, pagination }
  ← JSX con Loading/Empty/Error/Table/Pagination
```

---

## 13. Estrategia de rendimiento

### Lazy loading de rutas
Usar `React.lazy()` + `<Suspense>` para división de código por ruta. Cada página se carga solo cuando se navega a ella:
```jsx
const Animales = React.lazy(() => import('../pages/Animales'))
const Especies = React.lazy(() => import('../pages/Especies'))
```

### Memorización
- `React.memo` en filas de `DataTable` para evitar rerenderizados al cambiar página
- `useMemo` para datos derivados (filtros, ordenamientos)
- `useCallback` para handlers que se pasan como props a componentes hijos

### Consideraciones específicas
- **GenealogyTree:** si el árbol supera 100 nodos, considerar virtualización o limitar generaciones visibles
- **Selects dependientes:** especie→raza debe cachear la lista de razas al cambiar especie para evitar fetch innecesario

---

## 14. Orden de implementación sugerido

1. **Corregir `api.js`:** fallback URL debe incluir `/v1` (`http://localhost:3000/api/v1`)
2. **Servicios** (auth.js, animales.js, especies.js, razas.js, usuarios.js)
3. **Hooks** (useAnimales, useAnimal, useGenealogy, useEspecies, useRazas, useUsuarios)
   - `useAnimal` se crea en este paso con getById básico
   - `useGenealogy` se extiende en paso 10 con children/siblings/familyTree
4. **Componentes** (DataTable, FormField, SelectField, Pagination, PageHeader, EmptyState, ConfirmModal, StatCard, SearchBar)
5. **Páginas CRUD Animales** (lista, formulario, detalle)
6. **Páginas Especies + Razas** (lista, formulario)
7. **Páginas Usuarios** (lista, formulario) — admin
8. **Dashboard** (métricas con `Promise.all` desde múltiples endpoints)
9. **Register + Perfil** (auth adicional)
10. **Árbol genealógico** (extender useGenealogy con children/siblings/familyTree + componente GenealogyTree)
11. **Navbar responsive + Sidebar** (menú hamburguesa + drawer)
12. **Landing page**

---

## 15. Pendientes detectados

| # | Pendiente | Dónde aplica | Prioridad |
|---|-----------|-------------|-----------|
| 1 | **Filtro por propietario** — user solo ve sus animales, admin ve todos | `AnimalesList.jsx` + `AnimalesForm.jsx` | Alta (definido en CONTRIBUTING.md) |
| 2 | **Mensaje "Sesión expirada"** en Login cuando viene de redirect post-401 | `api.js` (interceptor) + `Login.jsx` | Media (issue #8) |
| 3 | Cambiar a `StatCard` en Dashboard (hoy usa divs inline) | `Dashboard.jsx` | Baja |
| 4 | Unificar paginación server-side en EspeciesList (hoy usa client-side con slice) | `EspeciesList.jsx` | Baja |
