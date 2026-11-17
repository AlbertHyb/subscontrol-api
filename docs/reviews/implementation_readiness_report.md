# EGM · Etapa 9 — Preparación para implementar (ronda 1)

- **Documento:** [`docs/designs/subscontrol.md`](../designs/subscontrol.md) · **DetailedRange:** L223–461 (desde "## 🚩 Hito 1" hasta el final)
- **Revisores goldfish (en paralelo, contexto limpio):**

| Revisor | Estándar | Estado | 🔴 | 🟡 | 🟢 |
|---------|----------|--------|----|----|----|
| `egm-implementation-readiness` | implementation-readiness-standard | completado | 2 | 11 | 9 |
| `egm-codebase-details` | implementation-readiness-standard | completado | 5 | 15 | 4 |
| `egm-style` | — (criterios de su persona) | completado | 0 | 12 | 11 |

- **Contexto goldfish:** `README.md`, `package.json` y todo `src/`
- **Veredicto:** el plan **no pasa**. La regla de "cero decisiones para quien implementa" se rompe en los Hitos 4–6, y el código de los Hitos 1–3 tomó decisiones que el documento no recoge.
- **Restricción del curso:** el DELETE con `id` en el body y respuesta `204`/`404` está bien especificado e implementado. Ningún revisor la cuestiona.

## 🐞 Bugs de código confirmados en esta etapa

| Bug | Origen | Reproducción | Issue |
|-----|--------|--------------|-------|
| `normalizarId` acepta `"0x2"`, `"1e0"`, `"1.0"`, `"01"` y `" 1 "`. **`DELETE {"id":"0x2"}` borró la suscripción 2** | codebase-1-B1, readiness-1-N3, style-1-M8 | `GET /0x1` → 200; `DELETE {"id":"0x2"}` → 204 | [#39](https://github.com/AlbertHyb/subscontrol-api/issues/39) |
| `logDuracion` no registra el JSON malformado (confirmado de nuevo) | codebase-1-M8 | Ya reproducido en la Etapa 7 | [#38](https://github.com/AlbertHyb/subscontrol-api/issues/38) |

También se confirmó, sin ser bug: `DELETE` **sin** `Content-Type: application/json` responde `400 "El id es obligatorio"`, aunque el body traiga el id (codebase-1-M5). Hay que documentarlo.

---

## Hallazgos consolidados

### 🔴 Blockers

| ID | Tema | Hallazgos de origen | Líneas |
|----|------|---------------------|--------|
| **R1** | **Validación del id:** el plan prescribe `Number(id)` (L377), que acepta `true` → 1. El código es más estricto, pero aun así acepta hexadecimal, exponente, decimal y espacios. "Los id son exactos" (L361) es falso, y el ejemplo `"A3 "` no aplica a ids enteros. → bug #39 + regla escrita en el plan. | codebase-1-B1, codebase-1-B2, readiness-1-N3, style-1-M8, style-1-N8 | 359, 361, 377, 380 |
| **R2** | **La persistencia JSON (Hito 5) no está diseñada:** ruta del archivo, formato (`siguienteId`), archivo ausente o corrupto, escritura atómica, contrato síncrono o asíncrono, y riesgo de *unhandled rejection* que tumbe el proceso. | readiness-1-B1, codebase-1-M13, style-1-N2 | 142, 274, 279, 281, 316 |
| **R3** | **El criterio del Hito 6 es imposible:** "exactamente igual" choca con el orden, snake_case, `datetime('now')`, `NUMERIC` y la migración de ids (`sqlite_sequence`). | readiness-1-B2, codebase-1-B3, codebase-1-M15, style-1-M4 | 196, 200, 210, 288–292 |
| **R4** | **El formato de las listas está sin decidir** (L339 vs L345); afecta a `/activas` y `/proximas-renovaciones`. El código ya usa arreglo directo. | codebase-1-B5, readiness-1-M3, style-1-M7 | 339, 345, 392, 440 |
| **R5** | **El criterio del Hito 1 es falso:** `node app.js` no funciona; lo real es `npm start` (`src/app.js`, Node ≥ 22.9) con respuesta `200 {"status":"ok"}`. | codebase-1-B4, readiness-1-N1, style-1-M2 | 228, 231, 234 |

### 🟡 Major

| ID | Tema | Hallazgos de origen | Líneas |
|----|------|---------------------|--------|
| R6 | **Las casillas y el avance no reflejan el código:** los Hitos 1–3 están hechos; 5.2 está hecho y 5.6 a medias. | codebase-1-M1, readiness-1-N7, readiness-1-N8, style-1-M1, style-1-N1, style-1-N2 | 227–279 |
| R7 | **No hay lista de archivos por issue** (crear/modificar), y las rutas no llevan el prefijo `src/`. | readiness-1-M1, codebase-1-M2 | 223–292 |
| R8 | **Hito 4: falta la regla "rutas fijas antes de `/:id`".** | readiness-1-M2, codebase-1-M3 | 263–266 |
| R9 | **Casos del DELETE que el plan no cubre:** `400` por id no entero, JSON malformado, sin `Content-Type`, `DELETE /:id` → 404 "Ruta no encontrada", y la asimetría 404 (GET) vs 400 (DELETE). | readiness-1-M4, codebase-1-M4, codebase-1-M5, codebase-1-M6, style-1-M9, readiness-1-N6 | 253–257, 359, 375–380 |
| R10 | **POST: faltan mensajes exactos, orden de validación y campos ignorados** (`id`, `estado`, `fechaCreacion`). `"100"` se rechaza, `trim` en `servicio`, `moneda` sin validar. | readiness-1-M5, codebase-1-M9, style-1-N6, style-1-N7 | 240, 317, 324–333 |
| R11 | **PATCH ambiguo:** "campos extra se ignoran" vs `{estado:"activa"}` → 400; body vacío, `"pausada"`, id inválido (400 o 404) y mensaje del 404 sin definir. | readiness-1-M6, codebase-1-M10, style-1-M10, readiness-1-N9 | 264, 396–410 |
| R12 | **Gasto mensual:** "⚠️ Decisión pendiente" sobre monedas, método de redondeo, `0.30` imposible en JSON, criterio del Hito 4 sin valores esperados. | readiness-1-M7, codebase-1-M11, style-1-M3, style-1-M11, style-1-M12 | 265, 268, 415–427 |
| R13 | **"Hoy" sin zona horaria y sin orden del resultado** en próximas renovaciones. | readiness-1-M8, codebase-1-M12 | 266, 432–443 |
| R14 | **Rate limiting:** no dice cómo se detecta "local"; falta `trust proxy`, el punto de montaje y la configuración exacta. | readiness-1-M9, codebase-1-M14 | 278 |
| R15 | **Proveedor de hosting sin elegir y disco efímero.** | readiness-1-M10 | 277, 281 |
| R16 | **No hay plan de pruebas por fase:** Bruno llega hasta el Hito 5, pero se usa desde el Hito 3; no hay pruebas automatizadas ni script `test`. | readiness-1-M11, codebase-1-N1, style-1-M5 | 255, 276, 298 |
| R17 | **Errores del parser no contemplados:** `entity.too.large` → 500 (debería ser 413), charset → 415. | codebase-1-M7 | 232, 324 |

### 🟢 Nits

| ID | Tema | Hallazgos de origen |
|----|------|---------------------|
| R18 | Las rutas de las tablas y los títulos no llevan `/api/v1`. | readiness-1-N2, codebase-1-N4, style-1-N3 |
| R19 | Casos imposibles o que no se pueden probar: arreglo "corrupto", `"pausada"`, `id: undefined`, "tipo mixto", "eliminadas no aparecen", "sin duplicados". | readiness-1-N4, readiness-1-N5, codebase-1-N3, style-1-M6, style-1-N9 |
| R20 | Probar "sin datos" exige borrar primero las 3 semillas, y el plan no lo dice. | codebase-1-N2 |
| R21 | Redacción: "Inteligencia de gasto", "corriendo y verificable", "semántica exacta", "documentado como política", diagrama redundante, tono de opinión en la nota de diseño. | style-1-N4, style-1-N5, style-1-N10, style-1-N11 |

---

## Matriz de trazabilidad

| Revisor | Hallazgo → ID consolidado |
|---------|---------------------------|
| implementation-readiness | B1→R2 · B2→R3 · M1→R7 · M2→R8 · M3→R4 · M4→R9 · M5→R10 · M6→R11 · M7→R12 · M8→R13 · M9→R14 · M10→R15 · M11→R16 · N1→R5 · N2→R18 · N3→R1 · N4→R19 · N5→R19 · N6→R9 · N7→R6 · N8→R6 · N9→R11 |
| codebase-details | B1→R1 · B2→R1 · B3→R3 · B4→R5 · B5→R4 · M1→R6 · M2→R7 · M3→R8 · M4→R9 · M5→R9 · M6→R9 · M7→R17 · M8→#38 · M9→R10 · M10→R11 · M11→R12 · M12→R13 · M13→R2 · M14→R14 · M15→R3 · N1→R16 · N2→R20 · N3→R19 · N4→R18 |
| style | M1→R6 · M2→R5 · M3→R12 · M4→R3 · M5→R16 · M6→R19 · M7→R4 · M8→R1 · M9→R9 · M10→R11 · M11→R12 · M12→R12 · N1→R6 · N2→R6/R2 · N3→R18 · N4→R21 · N5→R21 · N6→R10 · N7→R10 · N8→R1 · N9→R19 · N10→R21 · N11→R21 |

## Relación con las etapas previas

- **R2 y R3** son los mismos problemas que C6–C9. La Etapa 8 (Z1, Z2, Z8) ya propuso la salida mínima: escritura síncrona atómica con `{ siguienteId, suscripciones }` y el Hito 6 como opcional. Con eso R3 se reduce a una línea.
- **R13, R14 y R15** coinciden con C10, C11 y C3; la Etapa 8 propone `TZ`, un limitador único siempre activo y decidir el proveedor.
- **Nuevo en esta etapa:** R1 (con el bug #39), R5, R9, R10, R11, R12, R16 y R17. Son, sobre todo, decisiones que el código ya tomó y el plan no recoge.
