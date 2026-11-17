// Lógica de negocio. No conoce Express (no usa req/res).
const repositorio = require('../data/suscripciones.repository');

function listar() {
  return repositorio.obtenerTodas();
}

function obtener(id) {
  return repositorio.obtenerPorId(id);
}

function crear({ servicio, monto, moneda, fechaRenovacion, periodo, categoria }) {
  // Se arma el objeto campo por campo: un id enviado por el cliente se ignora.
  return repositorio.crear({
    servicio: servicio.trim(),
    monto,
    moneda: moneda ?? 'MXN',
    fechaRenovacion,
    periodo,
    categoria: categoria ?? null,
    estado: 'activa',
  });
}

// La eliminación no depende del estado: una cancelada también se puede eliminar.
function eliminar(id) {
  return repositorio.eliminar(id);
}

module.exports = { listar, obtener, crear, eliminar };
