// Registra método, ruta, milisegundos y código de estado de cada petición.
function logDuracion(req, res, next) {
  const inicio = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - inicio) / 1e6;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(2)} ms`);
  });
  next();
}

module.exports = logDuracion;
