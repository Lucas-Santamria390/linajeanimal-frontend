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

### Reglas obligatorias

- **Estados cubiertos:** cada componente debe manejar loading, empty, error, success.
- **Autenticación:** todo request autenticado usa el interceptor de Axios (token del localStorage).
- **Manejo de errores:** mostrar mensajes al usuario con el componente `Alert`, no en console.log.
- **Protección de rutas:** usar `ProtectedRoute` para rutas privadas, redirigir a `/login` en 401.
- **Formularios:** validar campos obligatorios, email, longitud de password, valores numéricos antes de enviar.
- **Sin datos simulados:** toda la data debe venir del API real, no de mocks locales.

### Roles y visibilidad

| Rol | Acceso en frontend |
|-----|--------------------|
| `admin` | CRUD animales, CRUD especies, CRUD razas, CRUD usuarios |
| `user` | CRUD solo sobre sus animales, lectura de especies/razas |

## Antes de contribuir por primera vez

1. Asegúrate de ser colaborador del repositorio
2. Lee el README.md para setup y configuración
3. Crea tu rama desde `develop`
4. Cuando termines, abre un Pull Request a `develop`
