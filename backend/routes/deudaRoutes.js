// deudaRoutes.js
const express = require("express");
const router = express.Router();
const { crearDeuda, editarDeuda, eliminarDeuda, obtenerDeuda, obtenerDeudas } = require("../controllers/deudaController");

// Ruta para obtener todas las deudas
router.get("/deudas", obtenerDeudas);

// Ruta para obtener una deuda específica
router.get("/deudas/:deudaId", obtenerDeuda);  // Obtener una deuda por ID

// Otras rutas para editar, crear, eliminar deudas
router.post("/deudas", crearDeuda);
router.put("/deudas/:deudaId", editarDeuda);
router.delete("/deudas/:deudaId", eliminarDeuda);

module.exports = router;
