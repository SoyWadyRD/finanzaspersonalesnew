// controllers/adminAuthController.js
const Usuario = require("../models/usuario");
const jwt = require("jsonwebtoken");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "andreslopez261316@gmail.com";
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

if (!JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET no está definido en .env");
}

exports.loginAdmin = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    if (!correo || !contraseña) {
      return res.status(400).json({ mensaje: "Correo y contraseña son requeridos" });
    }

    // Solo permitimos el admin con el correo autorizado
    if (correo !== ADMIN_EMAIL) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    // Buscar usuario por correo (usa el mismo modelo Usuario)
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const isMatch = await usuario.compararContraseña(contraseña);
    if (!isMatch) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    // Generar JWT (payload mínimo: id y correo)
    const payload = { adminId: usuario._id.toString(), correo: usuario.correo };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      mensaje: "Autenticación exitosa",
      token,
      expiresIn: JWT_EXPIRES_IN
    });
  } catch (err) {
    console.error("Error en loginAdmin:", err);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};
