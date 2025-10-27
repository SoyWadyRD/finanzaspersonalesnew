const express = require("express");
const path = require("path");
const router = express.Router();
const { registro, login, perfil, verificarCorreo, recuperarContraseña, restablecerContraseña, actualizarNombre } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// backend/routes/authRoutes.js
// backend/routes/authRoutes.js

router.get('/reset-password/:token', (req, res) => {
  // Log para verificar que el token llega correctamente
  const token = req.params.token;


  // Ruta del archivo que se va a servir
  const filePath = path.join(__dirname, '..', 'frontend', 'reset-password.html');


  // Verifica si la ruta del archivo está correcta
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error al enviar el archivo:", err);  // Ver error
      res.status(500).send("Error al cargar la página de restablecimiento.");
    } else {
      console.log("Archivo enviado correctamente.");  // Confirmación
    }
  });
});










router.post("/registro", registro);
router.get("/verificar/:token", verificarCorreo);
router.post("/login", login);
router.get("/perfil", authMiddleware, perfil);

// Rutas para recuperación de contraseña
router.post("/recuperar-password", recuperarContraseña); // Endpoint para solicitar el enlace de restablecimiento
// Ruta para restablecer contraseña
router.post("/restablecer-password/:token", restablecerContraseña); // Cambiar contraseña

router.put('/actualizar-nombre', authMiddleware, actualizarNombre);

module.exports = router;
