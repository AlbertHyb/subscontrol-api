// Solo mapea URL + método → controller. Sin lógica de negocio.
// Regla: las rutas fijas (/activas, /gasto-mensual, ...) van ANTES de /:id,
// o Express las tomaría como un id.
const { Router } = require('express');
const controller = require('../controllers/suscripciones.controller');

const router = Router();

router.get('/', controller.listar);
router.post('/', controller.crear);
router.delete('/', controller.eliminar);

// (Hito 4) aquí van /activas, /gasto-mensual, /proximas-renovaciones

router.get('/:id', controller.obtener);

module.exports = router;
