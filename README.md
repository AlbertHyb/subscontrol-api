# SubsControl — API de Control de Suscripciones

API REST personal para registrar suscripciones de pago (Netflix, Spotify, dominios, hosting…)
y saber cuánto gastas al mes, cuándo renueva cada una y qué eliminaste.

**Stack:** Node.js + Express. Datos en memoria (v1).

## Cómo ejecutarlo

```bash
npm install
npm start          # http://localhost:3000  (puerto configurable con PORT)
```

## Endpoints (v1)

| Método | Ruta | Respuesta |
|--------|------|-----------|
| GET | `/` | `200 {"status":"ok"}` |
| GET | `/api/v1/suscripciones` | `200` arreglo (vacío = `[]`) |
| GET | `/api/v1/suscripciones/:id` | `200` o `404` |
| POST | `/api/v1/suscripciones` | `201` creada, `400` si falta/es inválido un campo |
| DELETE | `/api/v1/suscripciones` | body `{"id": 1}` → `204` sin cuerpo, `404` si no existe, `400` si el id falta o es inválido |

Errores siempre con formato `{ "error": "mensaje" }`.

### Ejemplo DELETE

```bash
curl -i -X DELETE http://localhost:3000/api/v1/suscripciones \
  -H 'Content-Type: application/json' -d '{"id": 1}'
```

## Arquitectura

```text
src/
├── app.js                               # Express + middleware global
├── routes/suscripciones.routes.js       # URL + método → controller
├── controllers/suscripciones.controller.js  # validación y códigos HTTP
├── services/suscripciones.service.js    # lógica de negocio (sin req/res)
├── data/suscripciones.repository.js     # único acceso a datos
└── middleware/{errorHandler,logDuracion}.js
```
