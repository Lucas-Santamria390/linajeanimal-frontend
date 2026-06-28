# LinajeAnimal Frontend

Aplicación web para la gestión de un **árbol genealógico de animales**, desarrollada como frontend en React que consume la API REST de `linajeanimal-api`.

## Tecnologías

- **React 19** + **Vite 8**
- **React Router v7** (navegación)
- **Axios** (consumo de API)
- **Tailwind CSS v4** (estilos)
- **ESLint** (código limpio)

## Requisitos

- Node.js 18+
- Backend `linajeanimal-api` corriendo localmente (Docker) o desplegado

## Instalación y ejecución

```bash
# Clonar el repositorio
git clone https://github.com/Lucas-Santamria390/linajeanimal-frontend.git
cd linajeanimal-frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar en desarrollo
npm run dev
```

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API REST | `http://localhost:3000/api/v1` |

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con HMR
npm run build    # Build de producción → dist/
npm run preview  # Vista previa del build
npm run lint     # ESLint
```

## Arquitectura

```
Página → Custom Hook → Servicio (Axios) → API Backend
                       ↕
                 AuthContext (token en localStorage)
```

Las rutas privadas están protegidas por `ProtectedRoute` que redirige a `/login` si no hay token.

## Enlaces

- **Frontend desplegado:** (pendiente)
- **API REST:** https://github.com/Lucas-Santamria390/linajeanimal-api
- **API desplegada:** https://linajeanimal-api.onrender.com/api/v1

## Credenciales de prueba

(proximamente)
