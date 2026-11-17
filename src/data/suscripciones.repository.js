// Única capa que toca los datos. Hoy: arreglo en memoria.
// Hito 5 (JSON) e Hito 6 (SQLite) solo reescriben este archivo; el contrato no cambia.

const suscripciones = [
  {
    id: 1,
    servicio: 'Netflix',
    monto: 219,
    moneda: 'MXN',
    fechaRenovacion: '2026-12-01',
    periodo: 'mensual',
    categoria: 'streaming',
    estado: 'activa',
    fechaCreacion: '2026-11-17T00:00:00.000Z',
  },
  {
    id: 2,
    servicio: 'Spotify',
    monto: 129,
    moneda: 'MXN',
    fechaRenovacion: '2026-11-20',
    periodo: 'mensual',
    categoria: 'streaming',
    estado: 'activa',
    fechaCreacion: '2026-11-17T00:00:00.000Z',
  },
  {
    id: 3,
    servicio: 'GoDaddy',
    monto: 450,
    moneda: 'MXN',
    fechaRenovacion: '2027-03-15',
    periodo: 'anual',
    categoria: 'dominio',
    estado: 'cancelada',
    fechaCreacion: '2026-11-17T00:00:00.000Z',
  },
];

// Contador independiente del tamaño del arreglo: un id eliminado nunca se reutiliza.
let siguienteId = 4;

function obtenerTodas() {
  return suscripciones;
}

function obtenerPorId(id) {
  return suscripciones.find((s) => s.id === id) ?? null;
}

function crear(datos) {
  const nueva = { ...datos, id: siguienteId++, fechaCreacion: new Date().toISOString() };
  suscripciones.push(nueva);
  return nueva;
}

// true = existía y se eliminó; false = no existía (el controller lo traduce a 404).
function eliminar(id) {
  const indice = suscripciones.findIndex((s) => s.id === id);
  if (indice === -1) return false;
  suscripciones.splice(indice, 1);
  return true;
}

module.exports = { obtenerTodas, obtenerPorId, crear, eliminar };
