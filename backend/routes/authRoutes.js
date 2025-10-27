const express = require("express");
const router = express.Router();
const { registro, login, perfil, verificarCorreo, recuperarContraseña, restablecerContraseña, actualizarNombre } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");




// Ruta para servir la página de restablecimiento de contraseña
router.get('/reset-password/:token', (req, res) => {
  const token = req.params.token;
  console.log("Token recibido en la ruta /reset-password/:token:", token);  // Esto debería mostrar el token
  try {
    const filePath = path.join(__dirnameBase, 'frontend', 'reset-password.html');
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error al cargar la página de restablecimiento:", error);
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
 // Cambiar contraseña



 router.put('/actualizar-nombre', authMiddleware, actualizarNombre);





module.exports = router;
