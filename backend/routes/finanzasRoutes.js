const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); // 🔹 Faltaba
const Gasto = require("../models/gasto"); // 🔹 Faltaba
const Ingreso = require("../models/ingreso"); // 🔹 Faltaba
const { registrarGasto, registrarIngreso, obtenerBalance, listarMovimientos } = require("../controllers/finanzasController");
const authMiddleware = require("../middlewares/authMiddleware");

// GASTOS
router.post("/gastos", authMiddleware, registrarGasto);

// INGRESOS
router.post("/ingresos", authMiddleware, registrarIngreso);

// BALANCE
router.get("/balance", authMiddleware, obtenerBalance);

// LISTAR TODOS LOS MOVIMIENTOS
router.get("/movimientos", authMiddleware, listarMovimientos);

// Obtener un movimiento por id
router.get("/movimiento/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  // Validar ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ mensaje: "ID de movimiento inválido" });
  }

  try {
    let movimiento = await Gasto.findOne({ _id: id, usuarioId: req.usuarioId });
    if (!movimiento) {
      movimiento = await Ingreso.findOne({ _id: id, usuarioId: req.usuarioId });
    }
    if (!movimiento) return res.status(404).json({ mensaje: "Movimiento no encontrado" });

    res.json(movimiento);
  } catch (error) {
    console.error("Error al obtener el movimiento:", error);
    res.status(500).json({ mensaje: "Error al obtener el movimiento", error: error.message });
  }
});

// Eliminar un movimiento por id
router.delete("/movimiento/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  // Validar ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ mensaje: "ID de movimiento inválido" });
  }

  try {
    let eliminado = await Gasto.findOneAndDelete({ _id: id, usuarioId: req.usuarioId });
    if (!eliminado) {
      eliminado = await Ingreso.findOneAndDelete({ _id: id, usuarioId: req.usuarioId });
    }
    if (!eliminado) return res.status(404).json({ mensaje: "Movimiento no encontrado" });

    res.json({ mensaje: "Movimiento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el movimiento:", error);
    res.status(500).json({ mensaje: "Error al eliminar el movimiento", error: error.message });
  }
});


module.exports = router;
