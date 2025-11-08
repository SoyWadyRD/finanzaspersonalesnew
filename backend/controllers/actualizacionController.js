// controllers/actualizacionController.js
const Actualizacion = require("../models/actualizacion");

exports.listarHistorial = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "50", 10);
    const historial = await Actualizacion.find({})
      .sort({ fechaEnvio: -1 })
      .limit(limit)
      .lean();
    res.json(historial);
  } catch (err) {
    console.error("listarHistorial error:", err);
    res.status(500).json({ mensaje: "Error al obtener historial" });
  }
};
