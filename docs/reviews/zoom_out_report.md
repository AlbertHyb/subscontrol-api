# EGM · Etapa 5 — Zoom Out inicial

- **Documento revisado:** [`docs/designs/subscontrol.md`](../designs/subscontrol.md) (líneas 1–461, versión del commit en que se agregó este reporte)
- **Revisores goldfish (contexto limpio, sin la conversación previa):** Arquitecto Escéptico (`egm-zoom-out`) y Catalizador Inventivo (`egm-inventive-catalyst`)
- **Estándar:** `zoom-out-standard.md`
- **Contexto goldfish:** `README.md` y todo `src/`
- **Restricción fija (del curso):** el DELETE recibe el `id` en el body y responde `204` o `404`. Ningún hallazgo la cuestiona.
- **Nota de ejecución:** los revisores se lanzaron como subagentes de propósito general que leyeron primero su persona. Los adaptadores `egm:*` no estaban registrados en la sesión y no se aplicó `omitClaudeMd`.

## Coincidencias entre los dos revisores

Estos hallazgos aparecieron en ambos reportes de forma independiente.

| # | Tema | Arquitecto | Catalizador | Severidad máx. |
|---|------|-----------|-------------|----------------|
| A | La pregunta 3 ("¿qué eliminé cuando la cancelé?") no se puede responder: el DELETE no deja rastro | H1 | H1 | 🟡 Major |
| B | El Issue 6.4 lleva la lógica de negocio a SQL y rompe "solo se reescribe el repositorio" | H2 | H7 | 🟡 Major |
| C | Escribir en cada cambio y volcar al apagar son redundantes, y las escrituras async concurrentes pueden corromper el JSON | H4 | H4 | 🟡 Major |
| D | `gasto-mensual` suma monedas distintas | H10 | H3 | 🟡 Major |
| E | Rate limiting: sobredimensionado (Arquitecto) / nunca probado y sin `trust proxy` (Catalizador) | H5 | H6 | 🟡 Major |

## Hallazgos que solo vio un revisor

| Revisor | Hallazgo | Severidad |
|---------|----------|-----------|
| Arquitecto | H3 — El Hito 6 (SQLite) completo es especulativo (YAGNI) | 🟡 Major |
| Catalizador | H2 — `fechaRenovacion` fija queda obsoleta tras la primera renovación | 🟡 Major |
| Catalizador | H4b — `siguienteId` no se persiste: tras reiniciar se reutilizarían ids | 🟡 Major |
| Catalizador | H5 — El hosting gratuito suele tener disco efímero: los datos se pierden en el redeploy | 🟡 Major |
| Arquitecto | H6 — RNF-06 (p95) no es verificable con `logDuracion` | 🟢 Nit |
| Arquitecto | H7 — Detalles de implementación dentro de los criterios de aceptación | 🟢 Nit |
| Arquitecto | H8 — Casos límite imposibles según el modelo (`"A3 "`, `"pausada"`) y PATCH con dos reglas | 🟢 Nit |
| Arquitecto | H9 — Formato de la lista sin fijar (arreglo directo vs `{ suscripciones }`) | 🟢 Nit |
| Arquitecto | H11 — El documento no refleja el avance (casillas, `node app.js`, paginación) | 🟢 Nit |
| Catalizador | H8 — `obtenerTodas()` expone el arreglo vivo; el shutdown no tiene tope de tiempo | 🟢 Nit |

---

## Reporte 1 — Arquitecto Escéptico (zoom-out)

**Contexto suficiente:** sí. **Resumen:** la arquitectura base es simple y adecuada al tamaño del proyecto, y el código de los Hitos 1–3 la sigue con fidelidad. Los problemas están en una incoherencia del problema raíz (pregunta 3), en la especulación de los Hitos 5–6 y en un conflicto arquitectónico del Hito 6.

### H1 · Major — La pregunta 3 no se puede responder con el diseño
**Alcance:** l. 9, 11, 24, 367, 461.
- La pregunta central 3 es "¿Qué suscripción eliminé cuando la cancelé?".
- El DELETE borra el registro (l. 367), así que no queda rastro que consultar.
- La nota de diseño (l. 461) dice que el historial lo conserva el PATCH, no el DELETE. La pregunta mezcla los dos conceptos que el documento separa (l. 27, 170, 461).

**Solución simple:** reescribir la pregunta 3 como "¿Cuáles cancelé?". `estado = 'cancelada'` ya la responde. Presentar el DELETE como requisito de la lección para borrar registros erróneos. No hacen falta tablas de historial ni borrado lógico.

### H2 · Major — El Hito 6 rompe la regla de "solo se reescribe un archivo"
**Alcance:** l. 85, 90, 147–157, 288, 290.
- El Issue 6.4 mueve `gasto-mensual` y `proximas-renovaciones` a SQL.
- Esa lógica está asignada al service (l. 85). Moverla obliga a ampliar el contrato del repositorio y a duplicar la regla en JS y en SQL.

**Solución simple:** quitar el Issue 6.4. Con "una tabla de una persona" (l. 219), calcular en JS sobre `obtenerTodas()` es igual de correcto.

### H3 · Major — El Hito 6 (SQLite) es especulativo
**Alcance:** l. 13, 143–145, 188–219, 283–292.
- La necesidad real, que los datos sobrevivan reinicios, ya la cubre el Hito 5.
- La justificación "filtros e historial real" (l. 143) no está respaldada por ningún RF ni RNF.
- Añade una dependencia nativa, un script de migración y una segunda fuente de verdad para la validación (l. 204).

**Solución simple:** marcar el Hito 6 como "opcional / v2". Mover el esquema SQL y la tabla de consultas a un anexo.

### H4 · Major — Dos mecanismos de persistencia que se pisan
**Alcance:** l. 99, 109, 274, 279.
- "Escribir en cada cambio" (5.1) y "volcar al apagar" (5.6) son redundantes.
- Solo volcar al apagar pierde datos con `kill -9` o un crash.
- Varias escrituras `fs/promises` concurrentes pueden intercalarse y corromper el archivo.

**Solución simple:** un solo mecanismo, escribir en cada cambio. El shutdown solo cierra el servidor, que ya lo hace `src/app.js`.

### H5 · Major — Rate limiting sobredimensionado para una API de un usuario
**Alcance:** l. 40, 53, 112–118, 278.
- Límites asimétricos por método y una futura migración "por usuario" sin que haya usuarios ni amenaza descrita.
- El diagrama (l. 53) muestra el rate limit desde el inicio, aunque llega en el Hito 5, y `rateLimit.js` (l. 78) no existe.

**Solución simple:** un único límite global en producción, o posponerlo. Quitar "migra a por usuario".

### H6 · Nit — RNF-06 (p95 < 50 ms) no aporta ninguna decisión
**Alcance:** l. 39, 105–110. `logDuracion` registra peticiones sueltas y no calcula p95, así que el RNF no es verificable. **Solución:** quitarlo o reescribirlo como "cada petición registra su duración".

### H7 · Nit — Detalle de implementación en los criterios de aceptación
**Alcance:** l. 216, 377, 380, 425. "Normalizar con `Number(id)`" dicta código; el criterio debería describir el comportamiento: `"3"` y `3` eliminan el mismo registro. La l. 380 repite la 377. **Solución:** dejar solo el comportamiento observable.

### H8 · Nit — Casos límite incoherentes con el modelo
**Alcance:** l. 304, 361, 393, 409–410.
- `"A3 "` no tiene sentido con un id INTEGER.
- `"pausada"` no puede existir (CHECK `activa|cancelada`).
- "Arreglo corrupto" no aplica a un arreglo en memoria.
- En el PATCH, los campos extra "se ignoran" pero `{ "estado": "activa" }` da `400`.

**Solución:** en el PATCH ignorar el body completo y quitar los casos imposibles.

### H9 · Nit — Contrato abierto en `GET /suscripciones`
**Alcance:** l. 339, 345, 392, 440. El documento deja abierto "`{ suscripciones: [...] }` o arreglo directo", aunque el resto del texto y el código ya usan arreglo directo. **Solución:** fijar "arreglo directo".

### H10 · Nit — `moneda` hace engañosa la pregunta 1
**Alcance:** l. 21, 166, 427. **Solución:** solo MXN en v1, o un total agrupado por moneda. No hace falta tipo de cambio.

### H11 · Nit — El documento no refleja el avance del código
**Alcance:** l. 131, 227–257, 234.
- Las casillas de los Hitos 1–3 siguen sin marcar.
- El criterio del Hito 1 dice `node app.js`, pero se arranca con `npm start`.
- La paginación "preparada" no tiene requisito detrás.

**Sin acción:** las capas con contrato de repositorio, la reutilización de `express.json`, `Router` y `--env-file-if-exists`, la ausencia de retry y circuit breaker, y la semántica del DELETE ya implementada.

---

## Reporte 2 — Catalizador Inventivo

**Contexto suficiente:** sí. **Resultado:** el documento acepta varias concesiones falsas. Las más serias afectan a dos de las tres preguntas centrales (l. 8 y 9) y a la decisión de persistencia.

### H1 · Major — La pregunta 3 no se puede responder
**Alcance:** l. 9, 11, 24, 153, 461.
**Concesión falsa:** el documento trata el borrado físico y el historial como excluyentes.
**Propuesta (Inversión):** convertir el borrado en un evento guardado: una lápida `eliminadaEn` que todas las lecturas filtran, o una bitácora aparte de solo anexar. Hacia afuera el contrato del curso no cambia: `GET /:id` y el segundo DELETE siguen dando `404`. La bitácora también garantiza que los ids no se reutilicen.
**Pasivos:**
- Todas las consultas deben filtrar las lápidas; un filtro olvidado expone datos borrados.
- El almacenamiento crece sin límite.
- El contrato del repositorio gana un método.
- Hay que decidir qué significa "eliminar" en términos de privacidad.

### H2 · Major — "¿Cuándo renueva?" queda obsoleto tras la primera renovación
**Alcance:** l. 8, 28, 167, 429–444, 290.
**Concesión falsa:** `fechaRenovacion` se captura una sola vez y nunca avanza. Una mensual desaparece de las "próximas renovaciones" desde el segundo mes (l. 443).
**Propuesta (valor derivado):** guardar una fecha ancla y calcular `proximaRenovacion` al leer (ancla + n × periodo ≥ hoy) en el service.
**Pasivos:**
- Hay que resolver la aritmética de fin de mes (ancla en día 31 frente a febrero).
- El cálculo deja de ser un `BETWEEN` simple en SQL.
- El campo del POST cambia de significado y hay que documentarlo.

### H3 · Major — El gasto mensual mezcla monedas
**Alcance:** l. 7, 26, 166, 415, 427.
**Propuesta (Segmentación):** `{ "totalMensual": { "MXN": 348, "USD": 12.5 } }`, sin tipo de cambio ni servicios externos. Alternativa más barata: solo `MXN` en v1 y `400` para el resto.
**Pasivos:**
- Cambia la forma de la respuesta (l. 265, 415, 424).
- El cliente recibe un mapa en lugar de un número.
- El SQL necesita `GROUP BY`.

### H4 · Major — La etapa JSON es desechable
**Alcance:** l. 99, 109, 139–145, 274, 279, 289.
**Concesión falsa:** la etapa JSON construye maquinaria que se tira en el Hito 6: escritura en cada cambio, volcado al apagar y script de migración. Además:
- Las estrategias redundantes no definen cuál es la fuente de verdad.
- Varios `writeFile` en vuelo sobre el mismo archivo pueden truncarlo.
- `siguienteId` no está en el plan de persistencia: si al reiniciar se calcula como máximo + 1, se reutilizan ids de eliminados.

**Propuesta:**
- **(a) Ir directo a SQLite con `node:sqlite`**, integrado en Node 22 (sin flag desde 22.13; antes requiere `--experimental-sqlite`): sin dependencias y con AUTOINCREMENT desde el inicio.
- **(b) Si se mantiene JSON:** un solo escritor serializado con escritura atómica (archivo temporal + `rename`) que persista también `siguienteId`, y sin volcado al apagar.

**Pasivos:**
- (a) `node:sqlite` es experimental, su API síncrona bloquea el event loop (insignificante a esta escala) y se aleja del estilo de la lección.
- (b) Hay más código propio que mantener.

### H5 · Major — Hosting gratuito sin disco persistente
**Alcance:** l. 277, 281, 287.
**Concesión no declarada:** en los planes gratuitos el disco suele ser efímero, así que "recuerda tras reiniciar" puede pasar una prueba y fallar en el siguiente redeploy.
**Propuesta:** elegir una plataforma con volumen persistente, configurar la ruta con una variable de entorno y cambiar el criterio a "sobrevive a un redeploy".
**Pasivos:** el volumen ata la app a una instancia o región y puede tener costo o límites.

### H6 · Major — El rate limiting nunca se prueba y puede limitar por la IP del proxy
**Alcance:** l. 40, 114–118, 278.
- Apagarlo en local hace que el `429` nunca se verifique.
- Detrás de un proxy, sin `trust proxy`, todos los clientes comparten la IP del balanceador.

**Propuesta:** dejarlo siempre activo con límites leídos de variables de entorno y configurar `trust proxy`.
**Pasivos:**
- Hay más configuración por entorno.
- Un `trust proxy` mal configurado permite falsificar `X-Forwarded-For`.

### H7 · Nit — Lógica de negocio movida a SQL (Issue 6.4)
Es una optimización prematura que contradice la l. 157. **Propuesta:** mantener la regla como función pura en el service y quitar el Issue 6.4.

### H8 · Nit — El aislamiento del repositorio y el shutdown no se cumplen del todo
- `obtenerTodas()` devuelve el arreglo vivo, así que cualquier capa puede mutarlo.
- `server.close` puede esperar sin fin por las conexiones keep-alive.

**Propuesta:** devolver copias y poner un temporizador de salida forzada (por ejemplo, 5 s).

**Sin concesión falsa en:** capas + Router frente a DDD o microservicios, sin retry ni circuit breaker, sin caché, y la doble defensa controller + CHECK.
