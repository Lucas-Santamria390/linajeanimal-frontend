# API — LinajeAnimal

**Base URL:** `https://linajeanimal-api.onrender.com/api/v1`
**Auth:** Bearer token en header `Authorization`

---

## Formato de respuestas

### Éxito (con datos)
```json
{ "success": true, "data": { ... } }
{ "success": true, "data": [ ... ], "pagination": { "page": 1, "limit": 10, "total": 100, "pages": 5 } }
```
En `/usuarios` la paginación usa formato mongoose-paginate:
```json
"pagination": { "totalDocs": 25, "limit": 10, "page": 1, "totalPages": 3, "hasNextPage": true, "hasPrevPage": false }
```

### Éxito (auth)
```json
{ "success": true, "data": { "usuario": { ... }, "token": "jwt..." } }
```

### Error
```json
{ "success": false, "message": "descripción del error" }
```

---

## Auth (público + autenticado)

### POST /auth/register
Registro público. El rol siempre se asigna `user` (se ignora el campo).
- Body: `{ nombre, email, password, rol? }`
- Password: min 8 chars, mayúscula, número, especial
- Status: 201 / 400 / 409 / 429

### POST /auth/login
Inicio de sesión público.
- Body: `{ email, password }`
- Status: 200 / 400 / 401 / 429

### GET /auth/profile
Perfil del usuario autenticado.
- Auth: Bearer
- Status: 200 / 401

### PUT /auth/password
Cambiar contraseña.
- Auth: Bearer
- Body: `{ oldPassword, newPassword }` (newPassword: min 8, mayúscula, número, especial)
- Status: 200 / 400 / 401

### POST /auth/logout
Cerrar sesión.
- Auth: Bearer
- Status: 200 / 401

---

## Usuarios (admin)

### GET /usuarios
Listar usuarios (paginado). Paginación mongoose-paginate.
- Auth: Bearer (admin)
- Query: `page` (1), `limit` (10)
- Status: 200 / 401 / 403

### POST /usuarios
Crear usuario (admin puede asignar rol).
- Auth: Bearer (admin)
- Body: `{ nombre, email, password, rol? }`
- Status: 201 / 400 / 401 / 403 / 409

### GET /usuarios/{id}
Detalle de usuario.
- Auth: Bearer (admin)
- Status: 200 / 401 / 403 / 404

### PUT /usuarios/{id}
Actualizar usuario (no password).
- Auth: Bearer (admin)
- Body: `{ nombre?, email?, rol? }`
- Status: 200 / 400 / 401 / 403 / 404

### DELETE /usuarios/{id}
Desactivar (soft delete). No permite auto-desactivación.
- Auth: Bearer (admin)
- Status: 200 / 400 / 401 / 403 / 404

### PATCH /usuarios/{id}
Activar/desactivar estado.
- Auth: Bearer (admin)
- Body: `{ active: boolean }`
- Status: 200 / 400 / 401 / 403 / 404

---

## Especies

### GET /especies
Listar especies activas.
- Público
- Status: 200

### POST /especies
Crear especie.
- Auth: Bearer (admin)
- Body: `{ nombre, descripcion? }`
- Status: 201 / 400 / 401 / 403 / 409

### GET /especies/{id}
Detalle de especie.
- Público
- Status: 200 / 400 / 404

### PUT /especies/{id}
Actualizar especie.
- Auth: Bearer (admin)
- Body: `{ nombre?, descripcion? }`
- Status: 200 / 400 / 401 / 403 / 404 / 409

### DELETE /especies/{id}
Desactivar especie.
- Auth: Bearer (admin)
- Status: 200 / 400 / 401 / 403 / 404

---

## Razas

### GET /razas
Listar razas activas.
- Público
- Query: `especie` (filtro por ID de especie)
- Status: 200 / 400

### POST /razas
Crear raza.
- Auth: Bearer (admin)
- Body: `{ nombre, descripcion?, especie }`
- Status: 201 / 400 / 401 / 403 / 404 / 409

### GET /razas/{id}
Detalle de raza.
- Público
- Status: 200 / 400 / 404

### PUT /razas/{id}
Actualizar raza.
- Auth: Bearer (admin)
- Body: `{ nombre?, descripcion?, especie? }`
- Status: 200 / 400 / 401 / 403 / 404 / 409

### DELETE /razas/{id}
Desactivar raza.
- Auth: Bearer (admin)
- Status: 200 / 400 / 401 / 403 / 404

---

## Animales

### GET /animales
Listar animales activos (paginado).
- Auth: Bearer
- Query: `page`, `limit`, `nombre`, `especie`, `raza`, `sexo`, `propietario`
- Status: 200 / 401

### POST /animales
Crear animal.
- Auth: Bearer
- Body:
  ```json
  {
    "nombre": "...",
    "especie": "ID",
    "raza": "ID",
    "sexo": "macho|hembra",
    "fechaNacimiento": "date",
    "peso?": number,
    "color?": "...",
    "identificador?": "...",
    "fotoUrl?": "...",
    "notas?": "...",
    "padre?": "ID|null",
    "madre?": "ID|null"
  }
  ```
- Status: 201 / 400 / 401 / 409 / 500

### GET /animales/{id}
Detalle de animal.
- Auth: Bearer
- Status: 200 / 400 / 401 / 404

### PUT /animales/{id}
Actualizar animal (campos opcionales).
- Auth: Bearer
- Status: 200 / 400 / 401 / 403 / 404 / 500

### DELETE /animales/{id}
Desactivar (soft delete, solo admin).
- Auth: Bearer (admin)
- Status: 200 / 400 / 401 / 403 / 404 / 500

### GET /animales/{id}/children
Listar hijos directos.
- Auth: Bearer
- Status: 200 / 400 / 401 / 404

### GET /animales/{id}/siblings
Listar hermanos.
- Auth: Bearer
- Status: 200 / 400 / 401 / 404

### GET /animales/{id}/family-tree
Árbol genealógico.
- Auth: Bearer
- Query: `generaciones` (default 3, max 5)
- Status: 200 / 400 / 401 / 404

### POST /animales/{id}/parents
Asignar o desasignar padres.
- Auth: Bearer (propietario o admin)
- Body: `{ padre?: "ID"|null, madre?: "ID"|null }`
- Status: 200 / 400 / 401 / 403 / 404

---

## Esquemas clave

### Animal (respuesta)
```json
{
  "_id": "string",
  "nombre": "string",
  "sexo": "macho|hembra",
  "fechaNacimiento": "date",
  "peso": "number",
  "color": "string",
  "identificador": "string",
  "fotoUrl": "string",
  "notas": "string",
  "active": "boolean",
  "cantidadHijos": "integer",
  "especie": { "_id": "string", "nombre": "string" },
  "raza": { "_id": "string", "nombre": "string" },
  "propietario": { "_id": "string", "nombre": "string", "email": "string" },
  "padre": "string|null",
  "madre": "string|null",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Observaciones
- **Especies y Razas GET** son públicos (no requieren token)
- **Animales** requiere autenticación (Bearer) en todos los endpoints
- **Usuarios** solo accesible para admin
- **Rate limit** (429) presente en auth (register/login)
- Soft delete en usuarios, especies, razas y animales (campo `active: false`)
