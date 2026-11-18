// Valida la entrada (fail fast) y decide el código HTTP.
const service = require('../services/suscripciones.service');

const PERIODOS = ['semanal', 'mensual', 'anual'];

// Acepta un número JSON entero positivo, o un string de solo dígitos sin ceros a la izquierda.
// Rechaza "0x2", "1e0", "1.0", "01", " 1 ", true, etc. (Number() aceptaría varios de ellos).
function normalizarId(valor) {
  if (typeof valor === 'number') return Number.isInteger(valor) && valor > 0 ? valor : null;
  if (typeof valor === 'string' && /^[1-9]\d*$/.test(valor)) return Number(valor);
  return null;
}

function esFechaValida(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
}

function listar(req, res) {
  res.status(200).json(service.listar());
}

function obtener(req, res) {
  const id = normalizarId(req.params.id);
  const suscripcion = id === null ? null : service.obtener(id);
  if (!suscripcion) return res.status(404).json({ error: 'Suscripción no encontrada' });
  return res.status(200).json(suscripcion);
}

function crear(req, res) {
  const body = req.body ?? {};

  for (const campo of ['servicio', 'monto', 'fechaRenovacion', 'periodo']) {
    if (body[campo] === undefined || body[campo] === null) {
      return res.status(400).json({ error: `Falta el campo: ${campo}` });
    }
  }
  if (typeof body.servicio !== 'string' || body.servicio.trim() === '') {
    return res.status(400).json({ error: 'El servicio no puede estar vacío' });
  }
  if (typeof body.monto !== 'number' || !Number.isFinite(body.monto) || body.monto < 0) {
    return res.status(400).json({ error: 'El monto debe ser un número mayor o igual a 0' });
  }
  if (!esFechaValida(body.fechaRenovacion)) {
    return res.status(400).json({ error: 'La fechaRenovacion debe tener formato YYYY-MM-DD válido' });
  }
  if (!PERIODOS.includes(body.periodo)) {
    return res.status(400).json({ error: `El periodo debe ser uno de: ${PERIODOS.join(', ')}` });
  }

  return res.status(201).json(service.crear(body));
}

// DELETE /api/v1/suscripciones  — body: { "id": 3 }
// 204 sin cuerpo si existía y se eliminó, 404 si no existe, 400 si el id falta o es inválido.
function eliminar(req, res) {
  const { id } = req.body ?? {};

  if (id === undefined || id === null || id === '') {
    return res.status(400).json({ error: 'El id es obligatorio' });
  }

  const idNumerico = normalizarId(id);
  if (idNumerico === null) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo' });
  }

  const eliminada = service.eliminar(idNumerico);
  if (!eliminada) {
    return res.status(404).json({ error: 'Suscripción no encontrada' });
  }

  return res.sendStatus(204);
}

module.exports = { listar, obtener, crear, eliminar };
