# Issues — LinajeAnimal Frontend (3 desarrolladores)

## Convenciones

- **Prioridad:** P0 (bloqueante), P1 (alta), P2 (media), P3 (baja)
- **Dependencias:** `↳ depende de #N`
- **Dev:** asignación sugerida (A / B / C)

---

## 📦 Milestone 1 — Fundación (Sprint 1)

### #1 Crear hooks CRUD base
- Crear hooks en `src/hooks/`:
  - `useAnimales` — list (paginado + filtros), getById, create, update, remove
  - `useEspecies` — list, getById, create, update, remove
  - `useRazas` — list (con filtro especie), getById, create, update, remove
  - `useUsuarios` — list (paginado), getById, create, update, remove, toggleActive
- Cada hook expone: `{ data, loading, error, pagination, refetch }` + operaciones
- Servicios ya existen en `src/services/`
- **Prioridad:** P0 | **Dev:** A

---

### #2 Componentes reutilizables — parte 1
- `DataTable` — tabla responsiva: en móvil se convierte a cards, en PC tabla normal. Props: `columns`, `data`, `onSort`, `emptyMessage`
- `Pagination` — controles inferior. Props: `page`, `totalPages`, `total`, `onPageChange`. Soportar dos formatos (simple y mongoose-paginate)
- `PageHeader` — título + breadcrumb + botón de acción derecha
- `EmptyState` — icono + mensaje + botón opcional
- **Prioridad:** P0 | **Dev:** B

---

### #3 Componentes reutilizables — parte 2
- `FormField` — input + label + error (text, email, password, number, date, url)
- `SelectField` — select + label + error + loading state
- `ConfirmModal` — modal de confirmación con title, message, onConfirm, onCancel, loading
- `SearchBar` — input de búsqueda con icono lupa + debounce 300ms
- `StatCard` — card de métrica con label, valor, color de borde, ícono opcional
- **Prioridad:** P0 | **Dev:** C

---

### #4 Register page (`/register`)
- Formulario: nombre, email, password, confirmar password
- Validación: email formato, password ≥ 8 (mayúscula, número, especial), confirm match
- Llamar `POST /auth/register` desde `auth.js`
- Estados loading/error/success → redirect a `/login` con mensaje
- Responsive: centrado max-w-sm (igual que Login)
- **Prioridad:** P1 | **Dev:** A | ↳ #1

---

### #5 Refactor Login — validación password según API
- Password ≥ 8 chars + mayúscula + número + especial (el API rechaza si no cumple)
- Mostrar requisitos en la UI (tooltip o texto helper)
- **Prioridad:** P1 | **Dev:** A

---

## 📦 Milestone 2 — CRUD Especies + Razas (Sprint 1-2)

### #6 Especies — Lista (`/especies`)
- Tabla/cards con: nombre, descripción, acciones (editar, desactivar)
- Loading / Empty / Error / Success
- Botón "Nueva especie" → `/especies/nuevo`
- Soft delete con ConfirmModal
- Alert de éxito después de operaciones
- **Prioridad:** P1 | **Dev:** B | ↳ #1, #2, #3

---

### #7 Especies — Formulario (`/especies/nuevo`, `/especies/:id/editar`)
- Campos: nombre (obligatorio, min 2), descripción (opcional)
- Loading en edición (cargar datos existentes)
- Error/validation por campo
- Redirect a lista con alerta de éxito
- **Prioridad:** P1 | **Dev:** B | ↳ #6

---

### #8 Razas — Lista (`/razas`)
- Filtro por especie (SelectField cargado con `useEspecies`)
- Tabla/cards con: nombre, especie, descripción, acciones
- Loading / Empty / Error / Success
- Soft delete con ConfirmModal
- **Prioridad:** P1 | **Dev:** C | ↳ #1, #2, #3, #6

---

### #9 Razas — Formulario (`/razas/nuevo`, `/razas/:id/editar`)
- Campos: nombre (obligatorio, min 2), especie (SelectField, obligatorio), descripción (opcional)
- Select de especie deshabilitado con "Cargando..." mientras carga
- Redirect a lista con alerta de éxito
- **Prioridad:** P1 | **Dev:** C | ↳ #8

---

## 📦 Milestone 3 — CRUD Animales + Usuarios (Sprint 2-3)

### #10 Animales — Lista (`/animales`)
- Tabla responsiva (DataTable) con columnas: nombre, especie, raza, sexo, identificador, acciones
- SearchBar por nombre
- Filtros: especie (select), raza (select, dependiente de especie), sexo (select)
- Paginación con Pagination (formato simple)
- Botón "Nuevo animal" → `/animales/nuevo`
- Soft delete con ConfirmModal
- **Prioridad:** P0 | **Dev:** A | ↳ #1, #2, #3

---

### #11 Animales — Formulario crear/editar (`/animales/nuevo`, `/animales/:id/editar`)
- Campos según PLAN.md §3.6:
  - nombre, especie (select), raza (select filtrado por especie), sexo, fechaNacimiento, peso, color, identificador, fotoUrl, notas, padre, madre
- Selects dependientes: especie → raza (cargar razas al cambiar especie)
- Selects de padre/madre: cargar animales de misma especie, filtrados por sexo
- Validación completa: obligatorios, fecha no futura, campos únicos
- Loading/error/validation/success states
- Responsive: 1 columna móvil, 2 columnas PC
- **Prioridad:** P0 | **Dev:** A | ↳ #10

---

### #12 Animales — Detalle (`/animales/:id`)
- Card con toda la información del animal
- Secciones: padres (enlaces), hijos (lista), hermanos (lista)
- Botones: editar, eliminar, ver árbol
- Estados: loading/error/not-found/empty (hijos/hermanos)
- **Prioridad:** P1 | **Dev:** B | ↳ #1, #2, #3

---

### #13 Usuarios — Lista (`/usuarios`)
- Tabla (DataTable) con: nombre, email, rol, activo (badge), acciones (editar, activar/desactivar)
- Paginación con Pagination (formato mongoose-paginate)
- Botón "Nuevo usuario" → `/usuarios/nuevo`
- Toggle activo/inactivo con confirmación
- **Prioridad:** P1 | **Dev:** C | ↳ #1, #2, #3

---

### #14 Usuarios — Formulario (`/usuarios/nuevo`, `/usuarios/:id/editar`)
- Crear: nombre, email, password (≥ 8, mayúscula, número, especial), rol (select admin/user)
- Editar: nombre, email, rol (sin password)
- Validación: email formato, password solo en creación
- No permite auto-desactivación (validación frontend + API lo rechaza)
- **Prioridad:** P1 | **Dev:** C | ↳ #13

---

## 📦 Milestone 4 — Perfil + Navbar + Sidebar (Sprint 3)

### #15 Navbar responsive con menú hamburguesa
- Menú hamburguesa en móvil (< 768px): toggle drawer lateral
- Enlaces visibles en PC
- Mostrar nombre de usuario + rol + botón cerrar sesión
- Links condicionales según rol (admin ve usuarios)
- Usar colores brand-500 de la paleta
- **Prioridad:** P1 | **Dev:** B | ↳ #4

---

### #16 Sidebar para navegación administrativa
- Drawer lateral (oculto en móvil, visible en PC)
- Links a: Dashboard, Animales, Especies, Razas, Usuarios, Perfil
- Highlight ruta activa
- Cerrar al hacer click en móvil (si es overlay)
- **Prioridad:** P2 | **Dev:** B | ↳ #15

---

### #17 Perfil (`/perfil`)
- Sección 1: datos personales (nombre, email) — solo lectura
- Sección 2: cambiar contraseña (oldPassword, newPassword, confirmNew)
- Validación: old obligatorio, new ≥ 8 (mayúscula, número, especial), confirm match
- Llamar `PUT /auth/password`
- Botón cerrar sesión
- Estados: loading/error/success
- **Prioridad:** P1 | **Dev:** A | ↳ #1, #5

---

## 📦 Milestone 5 — Dashboard + Genealogía + Landing (Sprint 3-4)

### #18 Dashboard — extender con tabla de últimos animales
- Además de las StatCards existentes, agregar tabla con últimos 5 animales registrados
- Llamar `GET /animales?limit=5&page=1&sort=-createdAt`
- Si no hay animales, mostrar EmptyState
- **Prioridad:** P2 | **Dev:** C | ↳ #1

---

### #19 Árbol genealógico — hook useGenealogy
- Crear `useGenealogy` con:
  - `getChildren(id)` → `GET /animales/:id/children`
  - `getSiblings(id)` → `GET /animales/:id/siblings`
  - `getFamilyTree(id, generaciones)` → `GET /animales/:id/family-tree?generaciones=N`
- Estados: loading/error/empty/data
- **Prioridad:** P1 | **Dev:** A | ↳ #1

---

### #20 Árbol genealógico — componente GenealogyTree
- **Móvil:** lista jerárquica indentada con toggle expand/collapse por nodo
- **Tablet/PC:** grafo con nodos conectados (SVG puro, sin librerías externas)
- Nodos: nombre + sexo (icono), click → enlace a detalle
- Control de profundidad: query param `?generaciones=N` (default 3, max 5)
- Estados: loading/error/empty
- **Prioridad:** P1 | **Dev:** B | ↳ #19, #12

---

### #21 Landing page (`/`)
- Hero section: título + descripción del sistema + CTA (Login / Register)
- Sección de características: 3-4 cards con iconos
- Footer con links
- Sin datos de API (puramente presentacional, excepción validada)
- Responsive: hero apilado móvil, lado a lado PC
- **Prioridad:** P2 | **Dev:** C

---

### #22 Aplicar lazy loading en AppRouter
- Envolver todas las páginas con `React.lazy()` + `<Suspense>`
- Usar Loading como fallback
- **Prioridad:** P2 | **Dev:** C | ↳ todas las páginas

---

## 📦 Milestone 6 — Polishing + Deploy (Sprint 4)

### #23 Ajustar paleta de colores en toda la app
- Navbar: bg brand-500, texto blanco
- Botones primarios: bg brand-500, hover brand-600
- Botones secundarios: bg secondary-500, hover secondary-600
- Fondos: neutral-bg (#fafafa)
- Cards: neutral-card (blanco)
- Texto: neutral-text, neutral-muted
- Alertas de éxito: bg brand-50 border brand-500
- **Prioridad:** P2 | **Dev:** C

---

### #24 Manejo de errores global — 401 y sesión expirada
- Mejorar interceptor 401: usar `navigate('/login')` en vez de `window.location.href`
- Mensaje "Sesión expirada" en login cuando viene de redirect post-401
- **Prioridad:** P2 | **Dev:** A

---

### #25 README completo
- Nombre del proyecto, descripción, tecnologías, instrucciones instalación
- Variables de entorno, credenciales de prueba
- Capturas de funcionamiento (móvil + PC)
- Enlaces: repo, frontend (Vercel), API (Render)
- **Prioridad:** P1 | **Dev:** B

---

### #26 Deploy a Vercel
- Conectar repo a Vercel
- Configurar `VITE_API_URL=https://linajeanimal-api.onrender.com/api/v1`
- Build command: `npm run build`, output: `dist/`
- Verificar funcionamiento end-to-end
- **Prioridad:** P1 | **Dev:** C

---

## 📊 Resumen de carga por desarrollador

| Dev | Issues | Foco principal |
|-----|--------|---------------|
| **A** | #1, #4, #5, #10, #11, #17, #19, #24 | Hooks, Animales CRUD, Perfil, Genealogía hook |
| **B** | #2, #6, #7, #12, #15, #16, #20, #25 | Componentes parte 1, Especies CRUD, Navbar/Sidebar, GenealogyTree, README |
| **C** | #3, #8, #9, #13, #14, #18, #21, #22, #23, #26 | Componentes parte 2, Razas CRUD, Usuarios CRUD, Dashboard ext, Landing, Lazy, Paleta, Deploy |

## 🧭 Orden sugerido

```
Sprint 1: #1 #2 #3 #4 #5 (fundación en paralelo)
Sprint 2: #6 #7 #8 #9 #10 #11 (CRUD especies/razas + animales)
Sprint 3: #12 #13 #14 #15 #16 #17 (detalle animal + usuarios + navbar + perfil)
Sprint 4: #18 #19 #20 #21 #22 #23 #24 #25 #26 (genealogía + landing + polish + deploy)
```

Cada developer completa su issue, hace PR a `develop`, otro revisa.
