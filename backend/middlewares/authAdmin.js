// middlewares/authAdmin.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ mensaje: "No autorizado (token faltante)" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    // Puedes adjuntar info del admin a req para uso posterior
    req.admin = { id: decoded.adminId, correo: decoded.correo };
    next();
  } catch (err) {
    console.error("authAdmin error:", err);
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
};
