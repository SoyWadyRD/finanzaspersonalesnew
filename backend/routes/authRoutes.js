const express = require("express");
const path = require("path");
const router = express.Router();
const { registro, login, perfil, verificarCorreo, recuperarContraseña, restablecerContraseña, actualizarNombre } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get('/reset-password/:token', (req, res) => {
  const token = req.params.token;
  console.log("Token recibido en la ruta /reset-password/:token:", token);  // Verificar que el token se recibe correctamente

  try {
    // Verificar la ruta del archivo
    const filePath = path.join(__dirname, '..', 'frontend', 'reset-password.html');
    console.log("Ruta del archivo de restablecimiento:", filePath);  // Log de la ruta del archivo
    
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error al enviar el archivo:", err);  // Mostrar cualquier error al enviar el archivo
        res.status(500).send("Error al cargar la página de restablecimiento.");
      } else {
        console.log("Archivo enviado correctamente.");  // Confirmar si el archivo se envía
      }
    });
  } catch (error) {
    console.error("Error al cargar la página de restablecimiento:", error);  // Ver si hay algún error en el flujo
    res.status(500).send("Error al cargar la página de restablecimiento.");
  }
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
