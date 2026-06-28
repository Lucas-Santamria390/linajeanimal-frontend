# Tecnologías y Arquitectura — LinajeAnimal Frontend

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | React | ^19.2.7 |
| Bundler | Vite | ^8.1.0 |
| Routing | React Router DOM | ^7.18.0 |
| HTTP Client | Axios | ^1.18.1 |
| Estilos | Tailwind CSS | v4 |
| Linter | ESLint | ^10.5.0 |

## Estructura del proyecto

```
linajeanimal-frontend/
├── docs/                    # Documentación del proyecto
│   ├── REQUERIMIENTOS.md    # Enunciado original del parcial
│   ├── TECNOLOGIAS.md       # Este archivo
│   ├── API.md               # Documentación de endpoints
│   └── ESTRUCTURA.md        # Guía de estructura y flujo
├── src/
│   ├── assets/              # Recursos estáticos
│   ├── components/          # Componentes reutilizables
│   │   ├── Alert.jsx        # Mensajes de éxito/error/warning/info
│   │   ├── Loading.jsx      # Spinner de carga
│   │   ├── Navbar.jsx       # Barra de navegación superior
│   │   └── ProtectedRoute.jsx # Guardia de rutas privadas
│   ├── context/
│   │   └── AuthContext.jsx  # Estado global de autenticación
│   ├── pages/
│   │   ├── Login.jsx        # Pantalla de inicio de sesión
│   │   └── Dashboard.jsx    # Panel principal (requiere auth)
│   ├── routes/
│   │   └── AppRouter.jsx    # Configuración de React Router
│   ├── services/
│   │   └── api.js           # Instancia de Axios configurada
│   ├── App.jsx              # Componente raíz
│   ├── App.css
│   ├── index.css            # Entry point de Tailwind CSS
│   └── main.jsx             # Punto de entrada de React
├── .env                     # Variables de entorno (no versionado)
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Flujo de autenticación

1. Usuario ingresa credenciales en `/login`
2. `AuthContext.login()` envía POST a `/api/v1/auth/login`
3. Backend valida y devuelve `{ success, data: { usuario, token } }`
4. Token se guarda en `localStorage`
5. Axios interceptor agrega `Authorization: Bearer <token>` a cada request
6. Si el backend responde 401, el interceptor limpia el storage y redirige a `/login`
7. `ProtectedRoute` verifica `isAuthenticated` antes de renderizar rutas privadas

## Variables de entorno

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api/v1` | URL base del backend |

## Comandos

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Build de producción
npm run lint     # Ejecutar ESLint
npm run preview  # Previsualizar build
```
