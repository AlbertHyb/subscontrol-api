## Qué propone el documento

El documento propone SubsControl: una API REST personal en Node.js con Express para registrar suscripciones de pago y responder tres preguntas: cuánto se gasta al mes, cuándo renueva cada suscripción y qué se eliminó (L5-L11). El código se organiza en capas (routes, controllers, services y repositorio). El almacenamiento empieza como un arreglo en memoria, pasa a un archivo JSON en el Hito 5 y a SQLite en el Hito 6. Para cambiar de almacenamiento solo se reescribe el repositorio (L137-L157). Hay 9 endpoints: salud, CRUD básico, un DELETE que recibe el `id` en el body y responde 204 o 404, un PATCH para cancelar sin eliminar, el gasto mensual normalizado y las renovaciones de los próximos 7 días (L208-L217, L296-L444). El trabajo se reparte en 6 hitos secuenciales (L223-L292, L450-L457).

## Cómo funciona el sistema existente, según este documento

No existe un sistema previo: el proyecto empieza desde cero (Hito 1: `npm init`, L227). El único contexto externo que se menciona es "la lección" (L13, L141, L249, L363). Parece ser un curso que dicta el estilo del proyecto y la semántica del DELETE, pero el documento nunca lo describe. Por eso no se puede resumir qué hereda el proyecto de esa lección.

---

# EGM · Etapa 6 — Prueba de comprensión

- **Documento revisado:** [`docs/designs/subscontrol.md`](../designs/subscontrol.md). FeatureRange L1–222, DetailedRange L223–461.
- **Revisor goldfish:** `egm-comprehension`, en modo REVIEW. Leyó **solo el documento**: ni código, ni README, ni estándar.
- **Qué mide:** si un lector nuevo entiende el diseño sin ayuda externa (autosuficiencia, no nivel de detalle).

## Hallazgos

| # | Severidad | Alcance | Hallazgo |
|---|-----------|---------|----------|
| 1 | 🟡 Major | L13, L141, L249, L363 | **"La lección" nunca se explica.** La decisión más llamativa (el `id` del DELETE va en el body y no en la URL) solo se justifica por ella. Un lector nuevo no sabe si es una restricción fija o algo negociable, ni qué otras reglas de "estilo" impone. |
| 2 | 🟡 Major | L9, L11, L461 | **La pregunta 3 mezcla cancelar con eliminar.** El DELETE no deja historial y ningún endpoint responde "qué eliminé". |
| 3 | 🟡 Major | L124, L128, L210–217, L245, L300–429 | **El prefijo no queda explícito.** Se fija `/api/v1/suscripciones`, pero tablas y criterios usan `/suscripciones` sin decir que son rutas relativas. No se aclara que `GET /` va en la raíz. L128 dice que el prefijo "se define en el Hito 1", pero ningún issue de ese hito lo define. |
| 4 | 🟡 Major | L339 vs L345, L392, L440 | **Formato de las listas sin decidir:** `{ "suscripciones": [...] }` o arreglo directo. El criterio "formato consistente" no se puede verificar. |
| 5 | 🟡 Major | L163, L359, L361, L377, L380 | **Tipo y normalización del `id`.** El id es INTEGER, pero L361 usa ejemplos alfanuméricos. No se dice si GET y PATCH `/:id` normalizan igual que el DELETE (los parámetros de URL siempre llegan como string). L380 no describe un comportamiento esperado. |
| 6 | 🟡 Major | L149–157, L288, L290 | **El contrato del repositorio no cubre el Hito 6.4.** Mover los cálculos a SQL exige métodos nuevos, y eso contradice "la interfaz no cambia". |
| 7 | 🟡 Major | L125, L215, L264, L396–410 | **Semántica y body del PATCH.** El nombre de la ruta no indica que solo cancela. No se dice qué body espera, y "los campos extra se ignoran" (L409) choca con "`{estado:"activa"}` → 400" (L410). |
| 8 | 🟡 Major | L167, L217, L432–443 | **"Hoy" y el ciclo de vida de `fechaRenovacion`.** "Hoy" depende de la zona horaria del servidor y no se especifica. Nada actualiza la fecha después de cada renovación, así que una suscripción vencida desaparece para siempre de "próximas" y no hay endpoint para editarla. |
| 9 | 🟡 Major | L118, L277, L278 | **API pública sin autenticación.** Una vez desplegada, cualquiera puede crear, cancelar o eliminar datos. No se dice si el riesgo se acepta ni cómo se protege la instancia; el rate limit por IP no basta. |
| 10 | 🟢 Nit | L40, L115, L278 | No se dice cómo distingue la app "producción" de "local" (solo se menciona `PORT`). |
| 11 | 🟢 Nit | L115, L247, L276, L298 | Bruno aparece sin definición ni enlace. |
| 12 | 🟢 Nit | L74, L99, L142, L274, L279 | El volcado al apagar sobra si ya se escribe en cada cambio. No se relaciona `data/suscripciones.json` con `src/data/`. |
| 13 | 🟢 Nit | L161–171 vs L191–201 | No se dice dónde se convierte camelCase a snake_case. |
| 14 | 🟢 Nit | L21, L171, L240 | `fechaCreacion` está en la entidad, pero no en RF-01 ni en el Issue 2.1. |
| 15 | 🟢 Nit | L305, L393 | Casos imposibles: estado `"pausada"` y arreglo "corrupto". |
| 16 | 🟢 Nit | L216, L265, L416, L425 | El factor 4.33 no se explica (¿52/12?). `0.30` se serializa como `0.3` en JSON: ¿número o string? |
| 17 | 🟢 Nit | L51–60, L96 | En el diagrama, el error handler solo está conectado al controller; el texto dice que captura cualquier error. |
| 18 | 🟢 Nit | L253–257 vs L375–376 | Los issues y las pruebas del Hito 3 no incluyen el `400` por falta de `id`, que sí exigen los criterios. |

## Conclusión del revisor

Las líneas 1–222 se entienden y se pueden resumir. La parte detallada (L223–461) también, salvo los Major 4 a 8, que obligan al implementador a tomar decisiones que el documento no toma. El hueco de contexto más grande es "la lección" (hallazgo 1).

## Cruce con la Etapa 5 (nota del orquestador)

Los hallazgos 2, 6, 8 y 12 confirman por tercera vez temas de [`zoom_out_report.md`](zoom_out_report.md): la pregunta 3, el Issue 6.4, `fechaRenovacion` y la persistencia redundante. Son nuevos los hallazgos 1 (la lección), 3 (prefijo), 7 (PATCH), 9 (sin autenticación) y 18 (el `400` en el Hito 3).
