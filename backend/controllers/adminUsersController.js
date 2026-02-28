// controllers/adminUsersController.js
const Usuario = require("../models/usuario");

exports.buscarUsuarios = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); // escape + case-insensitive
    const usuarios = await Usuario.find(
      { correo: regex },
      "correo nombre"
    ).limit(20).lean();

    // devolver solo emails y nombre
    const resultados = usuarios.map(u => ({ correo: u.correo, nombre: u.nombre }));
    res.json(resultados);
  } catch (err) {
    console.error("buscarUsuarios error:", err);
    res.status(500).json({ mensaje: "Error al buscar usuarios" });
  }
};
