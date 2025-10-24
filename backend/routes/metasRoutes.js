const express = require("express");
const router = express.Router();
const { crearMeta, obtenerMetas, actualizarMeta, eliminarMeta, agregarMonto, quitarMonto } = require("../controllers/metasController");
const authMiddleware = require("../middlewares/authMiddleware");

// Rutas de metas
router.post("/meta", authMiddleware, crearMeta); // Crear meta
router.get("/metas", authMiddleware, obtenerMetas); // Obtener todas las metas del usuario
router.put("/meta/:id", authMiddleware, actualizarMeta); // Actualizar meta (estado)
router.delete("/meta/:id", authMiddleware, eliminarMeta); // Eliminar meta
// Ruta para agregar monto a una meta
router.put("/meta/agregar/:id", authMiddleware, agregarMonto); // Agregar monto a la meta
// Ruta para quitar monto de una meta
router.put("/meta/quitar/:id", authMiddleware, quitarMonto); // Quitar monto de la meta
// Ruta para eliminar una meta
router.delete("/meta/:id", authMiddleware, eliminarMeta);  // Usamos DELETE para eliminar



module.exports = router;
