# EGM · Etapa 7 — Crítica de diseño (ronda 1)

- **Documento:** [`docs/designs/subscontrol.md`](../designs/subscontrol.md) · **FeatureRange:** L1–222 (desde el inicio hasta antes de "## 🚩 Hito 1")
- **Revisores goldfish (en paralelo, contexto limpio):**

| Revisor | Estándar | Estado | 🔴 | 🟡 | 🟢 |
|---------|----------|--------|----|----|----|
| `egm-design` (Design Critic) | feature-spec-standard | completado | 3 | 9 | 7 |
| `egm-structural` | feature-spec-standard | completado | 1 | 9 | 11 |
| `egm-style` | — (criterios de su persona) | completado | 0 | 8 | 15 |

- **Contexto goldfish:** `README.md` y todo `src/`
- **Restricción fija del curso:** el DELETE recibe el `id` en el body y responde `204`/`404`. Ningún revisor propone cambiarla; algunos piden **documentarla como restricción**.
- **Veredicto estructural:** el rango **no aprueba** el estándar de especificación.

---

## Hallazgos consolidados (por prioridad)

Los ids siguen el formato `<revisor>-<ronda>-<n>` y se refieren al reporte original de cada revisor (ver las secciones de abajo). La columna "Etapas previas" indica si el tema ya salió en las Etapas 5 o 6.

### 🔴 Blockers

| ID | Tema | Hallazgos de origen | Etapas previas | Líneas |
|----|------|---------------------|----------------|--------|
| **C1** | **La pregunta 3 no se puede responder.** "¿Qué eliminé cuando la cancelé?" mezcla cancelar con eliminar, y el DELETE no deja rastro. Salidas: reformularla ("¿cuáles cancelé?") o agregar una bitácora de eliminaciones. | design-1-B1, structural-1-M2, style-1-M1 | E5 (ambos revisores), E6 #2 | 9, 11, 24, 153, 170 |
| **C2** | **Seguridad: API pública sin autenticación y sin sección de Riesgos.** Una vez desplegada, cualquiera lista, crea o borra; el rate limit solo frena el ritmo. Mínimo: una API key en un header desde una variable de entorno, o declarar el riesgo como aceptado. | design-1-B3, design-1-M1, structural-1-B1 | E6 #9 | 101, 118 |
| **C3** | **Disco efímero en el hosting gratuito.** "Sobrevive reinicios" con JSON o SQLite falla en un redeploy si no hay volumen persistente. El revisor no lo verificó contra la documentación actual de cada proveedor. | design-1-B2 | E5 Catalizador H5 | 142–143 |

### 🟡 Major

| ID | Tema | Hallazgos de origen | Etapas previas | Líneas |
|----|------|---------------------|----------------|--------|
| C4 | Falta la sección **Objetivos / No-objetivos**; los límites de v1 están dispersos. | structural-1-M1, design-1-M1 | — | 3–13, 101, 118, 131, 141 |
| C5 | **DELETE por body:** no se dice que es restricción del curso; RF-04 omite el `400`; no se menciona que requiere `Content-Type: application/json` ni que hay proxies que descartan el body (RFC 9110); `id` inválido da `404` en GET y `400` en DELETE. | structural-1-M3, design-1-M7, style-1-M2, structural-1-N4 | E6 #1 | 11, 24, 125 |
| C6 | **Contrato del repositorio incompleto** y la promesa "un solo archivo, nada más se toca" no se sostiene: el Issue 6.4 y el volcado al apagar requieren métodos nuevos. | design-1-M2, structural-1-M4, style-1-M5 | E5 (ambos), E6 #6 | 145, 147–157 |
| C7 | **Síncrono vs asíncrono:** el contrato es síncrono, pero el Hito 5 usa `fs/promises` y Postgres es asíncrono. Express 4 no captura promesas rechazadas, así que "una petición nunca tumba el proceso" deja de ser cierto. | design-1-M3, structural-1-M4, style-1-M5 | — | 96, 109, 150–154 |
| C8 | **Persistencia JSON frágil:** escrituras concurrentes no atómicas, JSON corrupto al arrancar, y `siguienteId` sin persistir (se reutilizarían ids). | design-1-M4, structural-1-M7 | E5 (ambos) | 109, 142, 163 |
| C9 | **Paridad v1 ↔ SQLite rota:** mapeo camelCase/snake_case, orden de la lista (inserción vs `ORDER BY`), `SUM` sin `COALESCE` → `null`, formato de `fechaCreacion`, tipos DATE vs TEXT. | design-1-M5, structural-1-M5, structural-1-M6, style-1-M8 | E6 #13 | 161–219 |
| C10 | **"Hoy" sin zona horaria** y `fechaRenovacion` que nunca avanza. | design-1-M6 | E5 Catalizador H2, E6 #8 | 167, 217 |
| C11 | **Rate limit sin `trust proxy`:** detrás del balanceador todos comparten una IP; el store en memoria se reinicia en cada deploy. | design-1-M8 | E5 Catalizador H6 | 114–118 |
| C12 | **El repositorio expone el arreglo vivo:** `obtenerTodas()`/`obtenerPorId()` devuelven referencias mutables; con SQLite serían copias. | design-1-M9 | E5 Catalizador H8 | 90, 150 |
| C13 | **Resiliencia contradice al código:** dice "todo → 500", pero JSON malformado → `400`; "nunca" no es garantizable. | structural-1-M8, style-1-M4 | — | 96 |
| C14 | **RNF-02 incompleto:** faltan `429` y `500`; "correctos" no se puede verificar. | structural-1-M9, style-1-M6, design-1-N1 | — | 35 |
| C15 | **p95 no medible** con `logDuracion`; además hay un segundo objetivo de latencia fuera de RNF-06. | style-1-M7, structural-1-N6 | E5 Arquitecto H6 | 39, 107, 110 |
| C16 | **El diagrama no coincide con el código:** muestra el rate limit como global; omite `logDuracion` y el 404; solo el controller llega al error handler. | style-1-M3, structural-1-N1, design-1-N2 | E6 #17 | 51–60 |

### 🟢 Nits

| ID | Tema | Hallazgos de origen |
|----|------|---------------------|
| C17 | ⚠️ **Bug de código:** `logDuracion` está después de `express.json()`, así que los `400` por JSON malformado no se registran. | design-1-N3 |
| C18 | `server.close` sin timeout de cierre forzado. | design-1-N4 |
| C19 | Modelo: `moneda` "ISO 4217" sin validar; RF-01 incluye `estado` como entrada; `monto` en flotante (¿centavos?); 4.33 sin justificar (52/12); no todas las reglas tienen `CHECK`; falta `ROUND` en el SQL. | design-1-N5, design-1-N6, structural-1-N5, structural-1-N8, structural-1-N9 |
| C20 | Rutas y árbol: `rateLimit.js` sin marcar como Hito 5; `data/` ambiguo; prefijo "se define en Hito 1" pero ningún issue de ese hito lo hace; tablas sin `/api/v1`; PATCH genérico vs sub-recurso; aclarar la idempotencia del DELETE. | structural-1-N2, structural-1-N3, structural-1-N7, structural-1-N11, design-1-N7 |
| C21 | Redacción: afirmaciones no verificables o muletillas ("casi nadie", "estándar de facto", "submilisegundo", "frágil al crecer"), "la lección" sin nombrar, RF-04 duplicado en L11, ✓ ambiguo en Convenciones, `false = 404` en el contrato del repositorio, "PK, único", `standardHeaders`, ER vs SQL, SQL desalineado. | style-1-N1…N15, structural-1-N10 |

---

## Matriz de trazabilidad

| Hallazgo de origen | → | Hallazgo de origen | → | Hallazgo de origen | → |
|---|---|---|---|---|---|
| design-1-B1 | C1 | structural-1-B1 | C2 | style-1-M1 | C1 |
| design-1-B2 | C3 | structural-1-M1 | C4 | style-1-M2 | C5 |
| design-1-B3 | C2 | structural-1-M2 | C1 | style-1-M3 | C16 |
| design-1-M1 | C2, C4 | structural-1-M3 | C5 | style-1-M4 | C13 |
| design-1-M2 | C6 | structural-1-M4 | C6, C7 | style-1-M5 | C6, C7 |
| design-1-M3 | C7 | structural-1-M5 | C9 | style-1-M6 | C14 |
| design-1-M4 | C8 | structural-1-M6 | C9 | style-1-M7 | C15 |
| design-1-M5 | C9 | structural-1-M7 | C8 | style-1-M8 | C9 |
| design-1-M6 | C10 | structural-1-M8 | C13 | style-1-N1…N15 | C21 |
| design-1-M7 | C5 | structural-1-M9 | C14 | | |
| design-1-M8 | C11 | structural-1-N1 | C16 | | |
| design-1-M9 | C12 | structural-1-N2, N3, N7, N11 | C20 | | |
| design-1-N1 | C14 | structural-1-N4 | C5 | | |
| design-1-N2 | C16 | structural-1-N5, N8, N9 | C19 | | |
| design-1-N3 | C17 | structural-1-N6 | C15 | | |
| design-1-N4 | C18 | structural-1-N10 | C21 | | |
| design-1-N5, N6 | C19 | | | | |
| design-1-N7 | C20 | | | | |

## Lo que los revisores dan por bueno

- **Arquitectura:** capas + Router frente a "todo en `app.js`", MVC y DDD/microservicios (L83–88). Cumple la regla de alternativas.
- **Almacenamiento:** la justificación de por qué no Postgres ni Mongo en v1 (L145).
- **Resiliencia:** sin retry ni circuit breaker, porque no hay servicios externos.
- **Formato:** la jerarquía de encabezados y el Markdown no tienen errores.

---

<details>
<summary><strong>Reporte original — egm-design (Design Critic)</strong></summary>

**B1** 🔴 El objetivo 3 no se puede cumplir: el DELETE borra físicamente, no hay bitácora ni borrado lógico, y la pregunta mezcla cancelar con eliminar (L9, 11, 24, 153, 170). → Reformular el objetivo o agregar un registro de eliminaciones; el DELETE sigue en `204`/`404`.

**B2** 🔴 Supuesto falso: "los datos sobreviven reinicios" con un archivo en un hosting gratuito. El disco suele ser efímero sin volumen montado; no se verificó contra la documentación actual. El mismo problema afecta a SQLite (L142–143). → Exigir un volumen persistente o almacenamiento externo y nombrar el proveedor.

**B3** 🔴 API pública sin autenticación con datos financieros personales (L101, 118). → Una API key en un header desde una variable de entorno, o declararlo como No-objetivo con el riesgo aceptado.

**M1** 🟡 No hay Riesgos ni No-objetivos. Riesgos sin nombrar: auth, disco efímero, concurrencia del JSON, zona horaria, proxies que descartan el body del DELETE.

**M2** 🟡 "Un solo archivo" se contradice: el contrato no tiene `obtenerActivas`, `gastoMensual`, `proximasRenovaciones` ni `cerrar()`, y el volcado al apagar requiere `flush` (L147–157).

**M3** 🟡 Contrato síncrono vs `fs/promises`. "Dispara y olvida" pierde errores; un contrato async cambia service y controller; Express 4.22 no captura promesas rechazadas. → Contrato async desde v1 + `asyncHandler` o Express 5.

**M4** 🟡 Escrituras concurrentes no atómicas al JSON. → Cola + archivo temporal + `rename`; definir qué pasa con un JSON corrupto al arrancar.

**M5** 🟡 `SUM` sin `COALESCE` → `null`; `datetime('now')` cambia el formato de `fechaCreacion`; `ORDER BY` vs orden de inserción; mapeo de columnas sin documentar. El criterio "exactamente igual" fallaría.

**M6** 🟡 "Hoy" en UTC en el servidor (`date('now')` también es UTC); `fechaRenovacion` nunca avanza. → Zona horaria de negocio `America/Mexico_City` configurable; definir si la fecha avanza o declararlo como limitación.

**M7** 🟡 RF-04 omite el `400`; `id` inválido da `404` en GET y `400` en DELETE. Body en DELETE: RFC 9110 no le da semántica, algunos proxies lo descartan y sin `Content-Type` → `400`. → Documentarlo como restricción del curso, con su riesgo.

**M8** 🟡 Sin `trust proxy` el límite queda global; el revisor cree que `express-rate-limit` v7 avisa con `X-Forwarded-For` (no confirmado); el store en memoria se reinicia en cada deploy.

**M9** 🟡 El repositorio expone referencias mutables; con SQLite serían copias. → El contrato debe especificar que siempre devuelve copias.

**N1** RNF-02 sin `429`/`500`. **N2** Diagrama impreciso. **N3** `logDuracion` después de `express.json()`: los `400` de JSON malformado no se registran. **N4** `server.close` sin timeout. **N5** `moneda` sin validar, `estado` en RF-01, `monto` flotante. **N6** 4.33 ≈ 52/12. **N7** `data/` ambiguo, PATCH genérico, aclarar la idempotencia.
</details>

<details>
<summary><strong>Reporte original — egm-structural</strong></summary>

**B1** 🔴 Falta Riesgos y mitigaciones, y la seguridad no aparece en ningún lugar. Riesgos mínimos: API sin auth, DELETE accidental, reutilización de `id`, rutas fijas vs `/:id`, multimoneda.

**M1** 🟡 Falta Objetivos/No-objetivos (dispersos en L101, 118, 131, 141).
**M2** 🟡 La pregunta 3 no tiene solución (L9, 11, 153).
**M3** 🟡 El DELETE por body no se identifica como restricción del curso; va contra la convención de L125 y el patrón `/:id`.
**M4** 🟡 Contrato incompleto y sin definir si es síncrono o asíncrono; contradice "un solo archivo".
**M5** 🟡 camelCase vs snake_case y DATE/DATETIME vs TEXT sin mapeo documentado.
**M6** 🟡 El orden del listado cambia entre v1 y SQLite; RF-02 no define orden.
**M7** 🟡 `siguienteId` sin mecanismo en JSON: con `max(id)+1` se reutilizan ids.
**M8** 🟡 Resiliencia "todo → 500" vs `errorHandler` (`400` para JSON malformado); el diagrama no dibuja errores de B ni de service/repositorio.
**M9** 🟡 RNF-02 sin `429` ni `500`.

**N1** Diagrama sin `logDuracion` ni 404. **N2** `rateLimit.js` sin marca de hito. **N3** `data/` ambiguo. **N4** RF-04 sin `400`. **N5** RF-01 sugiere que el cliente envía `estado`. **N6** Objetivo de latencia extra; nada calcula p95. **N7** "Se define en Hito 1" sin issue; tablas sin `/api/v1`. **N8** "Dos capas de defensa" es parcial. **N9** Falta `ROUND`. **N10** Columnas SQL desalineadas. **N11** Idempotencia: la respuesta cambia de `204` a `404`.

Veredicto: **no aprueba**. Jerarquía y Markdown correctos; alternativas de arquitectura y almacenamiento cumplen.
</details>

<details>
<summary><strong>Reporte original — egm-style</strong></summary>

**M1** 🟡 L9/11 confunden cancelar con eliminar. **M2** 🟡 El contrato DELETE omite el `400`. **M3** 🟡 El diagrama muestra el rate limit como global y permanente; faltan `logDuracion` y el 404. **M4** 🟡 L96 es absoluta ("nunca crashea"; "crashea" es anglicismo). **M5** 🟡 El costo de migrar se presenta como trivial (L145, 157) y el propio documento lo contradice. **M6** 🟡 RNF-02 incompleto y "correctos". **M7** 🟡 p95 sin mecanismo que lo mida. **M8** 🟡 El orden por fecha se presenta como "correcto" sin ser requisito.

**N1** "casi nadie sabe" → DROP. **N2** "la lección" sin nombrar. **N3** RF-04 duplica L11. **N4** Cómo se detecta producción. **N5** `rateLimit.js` sin marca de hito. **N6** Juicios absolutos en las alternativas. **N7** L100 defensiva → DROP. **N8** "submilisegundo" no medido. **N9** "estándar de facto" → DROP. **N10** "quien consulta gasta poco" es ambiguo. **N11** Nombrar `standardHeaders`. **N12** ✓ ambiguo; "sin excepciones" redundante; `/gasto-mensual` en singular. **N13** `false = 404` mete HTTP en el repositorio; "PK, único" redundante. **N14** ISO 4217, CHECK y "Default ahora" en la columna de restricciones. **N15** ER vs SQL, rutas sin `/api/v1`, 4.33, "una tabla de una persona".
</details>
