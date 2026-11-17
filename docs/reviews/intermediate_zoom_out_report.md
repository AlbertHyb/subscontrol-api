# EGM · Etapa 8 — Zoom Out intermedio

- **Documento:** [`docs/designs/subscontrol.md`](../designs/subscontrol.md), L1–461, sin cambios desde la Etapa 5
- **Revisor goldfish:** Arquitecto Escéptico (`egm-zoom-out`), modo REVIEW, con `zoom-out-standard.md`
- **Insumos:** [`zoom_out_report.md`](zoom_out_report.md) (E5), [`comprehension_report.md`](comprehension_report.md) (E6), [`critic_report.md`](critic_report.md) (E7), `README.md`, `SECURITY.md`, `package.json` y todo `src/`
- **Foco:** separar, entre las mitigaciones propuestas en las Etapas 6–7, las proporcionadas de la sobreingeniería, y detectar conflictos con la Etapa 5.
- **Restricción fija del curso:** el DELETE recibe el `id` en el body y responde `204`/`404`. Ninguna recomendación la toca.

## Conclusión

Casi todas las mitigaciones de las Etapas 6–7 responden a problemas reales. Pero si se adoptan tal cual, convierten una API académica de un solo usuario en un mini-framework: contrato async, cola de escritura, lápidas, zona horaria configurable y rate limit por entorno.

**Tres ediciones al documento eliminan la mayor parte de esa complejidad:**

1. **L109: permitir la escritura síncrona atómica y persistir `siguienteId`** (Z1, Z2). Resuelve C7 y C8 sin código de infraestructura.
2. **El Hito 6 pasa a opcional, sin los Issues 6.4 y 5.6** (Z8). Resuelve o archiva C6, C9 y C18.
3. **Una sección "Alcance v1" y la pregunta 3 reescrita** (Z3, Z10). Cierra C1, C4 y C5, y deja documentadas las decisiones de C2, C3 y C10.

**Solo tres cosas merecen código nuevo:**
- una API key, o declarar el riesgo como aceptado (Z4);
- `trust proxy` con un limitador único (Z6);
- `TZ` como variable de entorno (Z7).

## Veredictos sobre las mitigaciones propuestas

| Propuesta (origen) | Veredicto | Opción mínima |
|---|---|---|
| Contrato async + `asyncHandler` o Express 5 (C7) | ❌ Sobreingeniería: el problema lo crea L109 | Contrato **síncrono**; escritura síncrona en el Hito 5 |
| Cola de escritura atómica (C8, E5 H4/H4b) | ❌ La cola sobra · ⚠️ la atomicidad y `siguienteId` sí van | Archivo temporal + `renameSync`; guardar `{ siguienteId, suscripciones }` |
| Bitácora o lápidas de eliminación (C1, E5 Cat. H1) | ❌ Sobreingeniería | Reescribir la pregunta 3: "¿cuáles cancelé?" |
| API key (C2, E6 #9) | ✅ Proporcionada si se despliega | Middleware que compara un header con una variable de entorno, **o** No-objetivo con riesgo aceptado |
| Volumen persistente (C3, E5 Cat. H5) | ⚠️ Es una decisión, no ingeniería | Verificar el proveedor; si no hay volumen, ajustar L281 y declarar el riesgo |
| Zona horaria configurable (C10, E6 #8) | ❌ La abstracción sobra | `TZ=America/Mexico_City` en el entorno del proceso |
| `fechaRenovacion` que avanza (C10, E5 Cat. H2) | ❌ Para v1 | Declararlo como limitación de v1 |
| `trust proxy` (C11, E5 Cat. H6) | ✅ Una línea | `app.set('trust proxy', 1)` con **un** límite global |
| Límites por variable de entorno + rate limit siempre activo (E5 Cat. H6) | ⚠️ Solo la mitad | Siempre activo, con límites fijos en el código |
| Copias desde el repositorio (C12, E5 Cat. H8) | 🟢 Opcional | Regla "no mutar lo devuelto" o `.slice()` |
| Objetivos/No-objetivos + Riesgos (C4, C2, structural-B1) | ✅ La mitigación más barata | **Una** sección corta con una tabla `riesgo → decisión` |
| Paridad v1 ↔ SQLite (C9) | ❌ Si el Hito 6 queda opcional | Una línea: "si se hace, la colección de Bruno debe pasar igual" |
| Timeout de cierre forzado (C18) | ❌ | Sin volcado al apagar no hay nada que proteger |

## Hallazgos

### Z1 · 🟡 Major — La prohibición de `writeFileSync` (L109) es una optimización prematura que origina C7 y C8
**Alcance:** L96, 109, 145, 147–157, 274.

**Razonamiento:**
- El archivo pesa unos KB y lo usa una sola persona: una escritura síncrona tarda menos de 1 ms.
- Prohibirla obliga a usar `fs/promises`, y eso arrastra tres mecanismos:
  - un contrato async, que reescribe el service y el controller;
  - `asyncHandler` o migrar a Express 5, porque Express 4.22 no captura promesas rechazadas;
  - una cola para serializar escrituras.
- `better-sqlite3` también es síncrono.

**Opción mínima:**
- Reescribir L109 como "escritura síncrona a un archivo temporal + `renameSync`".
- Lectura síncrona al arrancar; si el JSON está corrupto, el proceso termina con un mensaje claro (*fail fast*).
- Borrar de L145 "migrar a Postgres es solo cambiar el repositorio": Postgres no está en ningún hito.

### Z2 · 🟡 Major — `siguienteId` debe persistirse
**Alcance:** L163, 316, 274.
Es lo único de C8 que no es opcional: sin él se rompe RNF-04.
**Opción mínima:** guardar el archivo con la forma `{ "siguienteId": n, "suscripciones": [...] }`. No hace falta bitácora ni `max(id)+1`.

### Z3 · 🟡 Major — Bitácora o lápidas son sobreingeniería; hay que reescribir la pregunta 3
**Alcance:** L9, 11, 24, 213, 292, 367, 461; `README.md` L4.

**Razonamiento:**
- Las lápidas obligan a filtrar en todas las lecturas y contradicen L367 y L213/L292.
- DELETE y PATCH terminarían pareciéndose, lo que borra la distinción que defiende la nota de diseño (L461).

**Opción mínima (E5 H1, sigue pendiente):**
- Pregunta 3 → "¿Cuáles cancelé?".
- Presentar el DELETE como requisito del curso para borrar registros erróneos.
- Corregir también la línea 4 del README.

### Z4 · 🟡 Major — Autenticación: proporcionada, pero hay que elegir **una** salida
**Alcance:** L101, 118, 277–278.
- **(a)** API key en el header `X-Api-Key` para todo `/api/v1`, con `GET /` libre y la llave agregada a la colección de Bruno.
- **(b)** Declararlo como No-objetivo con riesgo aceptado.

En los dos casos hay que borrar "el límite migra a por usuario" (L118). Usuarios o JWT serían sobreingeniería.

### Z5 · 🟡 Major — El disco efímero es una decisión de plataforma
**Alcance:** L142–143, 277, 281.
- Ni el JSON ni SQLite sobreviven un redeploy sin un volumen persistente. Eso refuerza E5 H3: el Hito 6 tampoco lo resuelve.
- **Si el proveedor tiene volumen:** la ruta del archivo sale de una variable de entorno y el criterio pasa a "sobrevive a un redeploy".
- **Si no tiene:** el criterio queda en "sobrevive a reiniciar el proceso" y la pérdida en el redeploy va a Riesgos aceptados.
- El revisor no verificó qué proveedores ofrecen volumen.

### Z6 · 🟡 Major — Conflicto en rate limiting entre la Etapa 5 (simplificar) y la Etapa 7 (agregar)
**Alcance:** L40, 53, 78, 112–118, 278.
**Opción mínima:**
- Un solo limitador global, **siempre activo** y holgado (≈100/15 min).
- `trust proxy`, límites fijos y store en memoria.
- Quitar los límites asimétricos (L116).
- Al estar siempre activo ya no hay que detectar "producción" (E6 #10) y el `429` se puede probar.

### Z7 · 🟡 Major — Zona horaria: basta con la variable `TZ`
**Alcance:** L167, 217, 432–434.
- Node respeta `process.env.TZ`.
- Conflicto: en el SQL del Issue 6.4, `date('now')` es UTC aunque `TZ` diga otra cosa. Es una razón más para quitar el 6.4.
- **Opción mínima:** escribir "hoy = fecha local del proceso; producción fija `TZ`" y declarar como limitación de v1 que `fechaRenovacion` no avanza.

### Z8 · 🟡 Major — Conflictos de la Etapa 5 que siguen pendientes y que la Etapa 7 empeoraría
1. **Volcado al apagar (L99, L279, Issue 5.6) frente a "falta `flush()`" (C6):** agregarlo consolidaría el mecanismo redundante. → Quitar el Issue 5.6 y el volcado; así C18 deja de importar.
2. **Hito 6 especulativo (E5 H3) frente a C9:** pulir `COALESCE`, `ROUND` y el mapeo es invertir en un hito opcional. → El Hito 6 pasa a "opcional / v2" y el esquema SQL (L188–219) va a un anexo.
3. **`node:sqlite` directo (E5 Cat. H4a) frente a quitar SQLite (E5 H3):** son direcciones opuestas. → Ninguna de las dos: JSON síncrono (Z1).
4. **El Issue 6.4 sigue en L290:** si se quita, el contrato de L150–154 queda completo tal como está y C6 se resuelve sin agregar métodos.
5. **El documento no refleja el avance (E5 H11):** las casillas de los Hitos 1–3 siguen sin marcar y L234 dice `node app.js`.

### Z9 · 🟢 Nit — Copias desde el repositorio
Una regla en el contrato ("lo que devuelve el repositorio es de solo lectura") o un `.slice()`. `structuredClone` o congelar objetos serían excesivos.

### Z10 · 🟢 Nit — Objetivos/No-objetivos + Riesgos: una sola sección corta después de L11
"Alcance v1" con tres listas breves, sin columnas de probabilidad e impacto:
- **Objetivos:** las tres preguntas, con la 3 reescrita.
- **No-objetivos:**
  - multiusuario;
  - multimoneda (solo MXN);
  - paginación;
  - que `fechaRenovacion` avance;
  - el Hito 6.
- **Riesgos aceptados:**
  - autenticación (si no se elige Z4a);
  - disco efímero;
  - store del rate limit en memoria;
  - body en el DELETE (restricción del curso; RFC 9110);
  - "la lección" nombrada en una línea.

### Z11 · 🟢 Nit — C17 es un bug real
`express.json()` va antes de `logDuracion`. Registrado como [#38](https://github.com/AlbertHyb/subscontrol-api/issues/38). La solución es invertir el orden.

## Estado acumulado (nota del orquestador)

| Hallazgo | Se resuelve con | Requiere decisión del autor |
|---|---|---|
| C1 pregunta 3 | Edición 3 (Z3) | No: hay consenso en reformular |
| C2 autenticación | Z4 | **Sí: API key o riesgo aceptado** |
| C3 disco efímero | Z5 | **Sí: proveedor con o sin volumen** |
| C4, C5 alcance y DELETE por body | Edición 3 (Z10) | No |
| C6, C9, C18 contrato, paridad y shutdown | Edición 2 (Z8) | **Sí: aceptar que el Hito 6 pasa a opcional** |
| C7, C8 async y persistencia | Edición 1 (Z1, Z2) | No |
| C10 zona horaria | Z7 | No |
| C11 rate limit | Z6 | No |
| C12 copias | Z9 | No |
| C13–C16, C19–C21 | Ediciones de texto directas | No |
| C17 | Issue #38 | No |
