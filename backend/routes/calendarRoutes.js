const express = require('express');
const router = express.Router();
const { obtenerCalendarios, obtenerGastosIngresosDelDia } = require('../controllers/calendarController');
const auth = require('../middlewares/authMiddleware'); // Asegúrate de que el usuario esté autenticado

// Ruta para obtener los calendarios
router.get('/calendarios', auth, obtenerCalendarios);
router.get('/gastos-ingresos/:fecha', auth, obtenerGastosIngresosDelDia);

module.exports = router;
