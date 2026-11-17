# SubsControl API

API REST personal para controlar suscripciones de pago (streaming, dominios, hosting, membresías).
Responde tres preguntas: **¿cuánto gasto al mes?**, **¿cuándo renueva cada una?** y **¿qué eliminé?**

> Proyecto académico (curso de backend). Node.js + Express, datos en memoria en v1.

## Inicio rápido

Requiere Node.js 22.9 o superior.

```bash
git clone https://github.com/AlbertHyb/subscontrol-api.git
cd subscontrol-api
npm install
cp .env.example .env   # opcional: cambia el puerto
npm start              # http://localhost:3000
```

## Endpoints

Base: `/api/v1/suscripciones`. Los errores siempre responden `{ "error": "mensaje" }`.

| Método | Ruta | Éxito | Errores | Estado |
|--------|------|-------|---------|--------|
| GET | `/` (salud) | `200` | — | ✅ |
| GET | `/api/v1/suscripciones` | `200` | — | ✅ |
| GET | `/api/v1/suscripciones/:id` | `200` | `404` | ✅ |
| POST | `/api/v1/suscripciones` | `201` | `400` | ✅ |
| DELETE | `/api/v1/suscripciones` — body `{ "id": 1 }` | `204` sin cuerpo | `400`, `404` | ✅ |
| GET | `/api/v1/suscripciones/activas` | `200` | — | Hito 4 |
| PATCH | `/api/v1/suscripciones/:id` (cancelar) | `200` | `400`, `404` | Hito 4 |
| GET | `/api/v1/suscripciones/gasto-mensual` | `200` | — | Hito 4 |
| GET | `/api/v1/suscripciones/proximas-renovaciones` | `200` | — | Hito 4 |

Ejemplo:

```bash
curl -i -X DELETE http://localhost:3000/api/v1/suscripciones \
  -H 'Content-Type: application/json' -d '{"id": 1}'
# HTTP/1.1 204 No Content
```

## Estructura

Arquitectura en capas: cada capa tiene una sola responsabilidad.

```text
src/
├── app.js            # Express + middleware global
├── routes/           # URL + método → controller
├── controllers/      # valida entrada y elige código HTTP
├── services/         # lógica de negocio (no conoce req/res)
├── data/             # repositorio: único acceso a datos
└── middleware/       # errores centralizados y log de duración
```

## Documentación

- Diseño completo, requerimientos y casos límite: [`docs/designs/subscontrol.md`](docs/designs/subscontrol.md)
- Avance por hito: [Milestones](https://github.com/AlbertHyb/subscontrol-api/milestones) · Tareas y bugs: [Issues](https://github.com/AlbertHyb/subscontrol-api/issues)
- Seguridad y manejo de secretos: [`SECURITY.md`](SECURITY.md)

## Licencia

[MIT](LICENSE)
