// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const authAdmin = require("../middlewares/authAdmin");

// controllers
const { loginAdmin } = require("../controllers/adminAuthController");
const { enviarActualizacion } = require("../controllers/enviarCorreoActualizacionController");
const { buscarUsuarios } = require("../controllers/adminUsersController");
const { listarHistorial } = require("../controllers/actualizacionController");

// login (sin auth)
router.post("/login", loginAdmin);

// enviar actualizacion (protegida)
router.post("/enviar-actualizacion", authAdmin, enviarActualizacion);

// autocomplete usuarios (protegida)
router.get("/usuarios", authAdmin, buscarUsuarios);

// historial de envíos (protegida)
router.get("/historial", authAdmin, listarHistorial);

module.exports = router;
