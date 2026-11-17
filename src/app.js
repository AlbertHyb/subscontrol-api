const express = require('express');
const suscripcionesRouter = require('./routes/suscripciones.routes');
const logDuracion = require('./middleware/logDuracion');
const { rutaNoEncontrada, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json()); // sin esto req.body es undefined y el DELETE no recibe el id
app.use(logDuracion);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/suscripciones', suscripcionesRouter);

app.use(rutaNoEncontrada);
app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`SubsControl escuchando en http://localhost:${PORT}`);
  });
  server.timeout = 10_000;

  const cerrar = () => server.close(() => process.exit(0));
  process.on('SIGINT', cerrar);
  process.on('SIGTERM', cerrar);
}

module.exports = app;
