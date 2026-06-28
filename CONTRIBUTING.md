# Guía de contribución — LinajeAnimal Frontend

## Flujo de trabajo

```
main (producción)
  ▲ PR merge (solo desde develop)
  │
develop (integración)
  ▲ PR merge (desde feature branches)
  ├── feature/nombre-corto
  ├── fix/nombre-corto
  └── ...
```

**Reglas:**
- No hacer push directo a `main` ni a `develop`
- Todo cambio entra vía Pull Request a `develop`
- `develop` se mergea a `main` cuando está estable

## Ramas (branch naming)

```
feature/lo-que-sea    →  Nueva funcionalidad
fix/lo-que-sea        →  Corrección de bug
```

Siempre crear desde `develop`.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/mi-funcionalidad
```

## Commits (Conventional Commits)

```
feat:     Nueva funcionalidad
fix:      Corrección de bug
chore:    Mantenimiento, config, dependencias
docs:     Documentación
refactor: Mejora de código sin cambiar comportamiento
test:     Agregar o modificar tests
style:    Formato, linting (sin cambio funcional)
```

**Ejemplos:**
```
feat: agregar página de detalle de animal con árbol genealógico
fix: mostrar error de validación al enviar formulario vacío
docs: actualizar README con credenciales de prueba
```

## Pull Requests

1. **Título** descriptivo siguiendo conventional commits:
   ```
   feat: CRUD de animales con formularios y validación
   ```

2. **Descripción** debe incluir:
   - Qué hace el cambio
   - Componentes/páginas afectadas
   - Cómo probarlo

3. **Checklist antes de abrir el PR:**
   - [ ] El código compila sin errores (`npm run build`)
   - [ ] No hay `console.log` olvidados
   - [ ] Linting pasa (`npm run lint`)
   - [ ] Los componentes cubren estados loading, empty, error, success
   - [ ] Los formularios validan campos antes de enviar
   - [ ] Toda función exportada tiene JSDoc (`@param`, `@returns`, descripción)
   - [ ] Se siguen los estándares del proyecto

4. **Review:** mínimo 1 aprobación antes de mergear a `develop`

## Estándares de código

### Arquitectura

```
src/
├── components/   → Componentes reutilizables (atómicos)
├── pages/        → Páginas por ruta
├── hooks/        → Custom hooks (useAnimales, useAuth, etc.)
├── services/     → Llamadas API con Axios
├── context/      → Estado global (AuthContext)
├── routes/       → Configuración de React Router
└── utils/        → Funciones helper
```

### Flujo de datos

```
Página → Custom Hook → Servicio (Axios) → API Backend
                          ↕
                    AuthContext (token)
```

### Convenciones de nomenclatura

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes | PascalCase | `AnimalList`, `DataTable`, `ConfirmModal` |
| Hooks | prefijo `use` | `useAnimales`, `useAuth`, `useDashboard` |
| Servicios | verbo + entidad | `getAnimales`, `createEspecie`, `deleteRaza` |
| Archivos | kebab-case | `animales.js`, `form-field.jsx` |
| Carpetas | plural | `pages/`, `services/`, `hooks/` |

### Reglas obligatorias

- **JSDoc:** toda función exportada debe tener bloque JSDoc con descripción, `@param` (por parámetro) y `@returns`. El linter lo valida con `eslint-plugin-jsdoc`.
- **Estados cubiertos:** cada página y componente debe manejar loading, empty, error, success.
- **Responsive:** toda página debe ser funcional en móvil (< 640px), tablet (768-1024px) y PC (> 1024px). Usar clases Tailwind `sm:`, `md:`, `lg:`.
- **Autenticación:** todo request autenticado usa el interceptor de Axios (token del localStorage).
- **Manejo de errores:** mostrar mensajes al usuario con el componente `Alert`, nunca en `console.log`.
- **Protección de rutas:** usar `ProtectedRoute` para rutas privadas, redirigir a `/login` en 401.
- **Formularios:** validar campos obligatorios, email, longitud de password (≥ 8), valores numéricos antes de enviar. Mostrar errores por campo.
- **Props:** desestructurar con valores por defecto: `function Card({ titulo = 'Sin título', items = [] })`.
- **Sin datos simulados:** toda la data debe venir del API real. Excepción única: Landing page.
- **Código limpio:** sin `console.log` (excepto desarrollo temporal), sin código comentado, sin imports no usados.
- **Paleta:** usar colores `brand-*` (verde), `secondary-*` (cian) y `neutral-*` definidos en `src/index.css`. No usar colores fijos como `indigo-*` o `gray-*`.

### Roles y visibilidad

| Rol | Acceso en frontend |
|-----|--------------------|
| `admin` | CRUD animales, CRUD especies, CRUD razas, CRUD usuarios |
| `user` | CRUD solo sobre sus animales, lectura de especies/razas |

### Issues y tareas

Ver `docs/ISSUES.md` para la lista completa de issues organizados por milestone y developer. Cada issue especifica dependencias, prioridad y entregables esperados.

### Testing (cuando aplique)

- Usar Vitest + @testing-library/react para tests unitarios y de integración.
- Priorizar tests de hooks (lógica) y páginas (flujo completo).
- Ver agente `test-frontend` en `.opencode/agents/` para guía detallada.

## Antes de contribuir por primera vez

1. Asegúrate de ser colaborador del repositorio
2. Lee el README.md para setup y configuración
3. Crea tu rama desde `develop`
4. Cuando termines, abre un Pull Request a `develop`
