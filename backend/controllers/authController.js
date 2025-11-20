const Usuario = require("../models/usuario");
const generarToken = require("../utils/generarToken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const enviarCorreo = require("../utils/enviarCorreo");
const path = require("path");


  // Registro de usuario con envío de correo

// Registro de usuario con envío de correo
exports.registro = async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) return res.status(400).json({ mensaje: "El usuario ya existe" });

    // Crear el nuevo usuario
    const usuario = await Usuario.create({ nombre, correo, contraseña });

    // Generar token de verificación
    const tokenVerificacion = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Enviar correo de verificación
    const link = `${process.env.FRONTEND_URL}/api/auth/verificar/${tokenVerificacion}`;
    const html = `<h2>Hola ${nombre}</h2>
                  <p>Para activar tu cuenta haz clic en el link:</p>
                  <a href="${link}">Verificar cuenta</a>`;

    // Enviar el correo de verificación
    try {
      await enviarCorreo(correo, "Verifica tu cuenta", html);  // Llamamos a la función sin 'res' aquí
      console.log(`📧 Nuevo usuario registrado: ${nombre} 🎉. Correo de verificación enviado. ✉️`);
      res.status(201).json({
        mensaje: "Usuario registrado. Revisa tu correo para verificar la cuenta."
      });
    } catch (error) {
      console.error("❌ Error al enviar el correo:", error.message);
      res.status(500).json({ mensaje: "Error al enviar el correo de verificación", error: error.message });
    }

  } catch (error) {
    console.error("❌ Error en el registro:", error.message);
    res.status(500).json({ mensaje: "Error en el registro", error: error.message });
  }
};










// Verificación de correo
exports.verificarCorreo = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      return res.sendFile(path.join(__dirname, "../../frontend/confirmaciones/verificacion-error.html"));
    }
    if (usuario.verificado) {
      return res.sendFile(path.join(__dirname, "../../frontend/confirmaciones/ya-verificado.html"));
    }

    usuario.verificado = true;
    await usuario.save();

    res.sendFile(path.join(__dirname, "../../frontend/confirmaciones/verificacion-exitosa.html"));
  } catch (error) {
    res.sendFile(path.join(__dirname, "../../frontend/confirmaciones/verificacion-error.html"));
  }
};







// Login (solo usuarios verificados)
exports.login = async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(400).json({ mensaje: "Correo o contraseña inválidos" });
    if (!usuario.verificado) return res.status(400).json({ mensaje: "Cuenta no verificada" });

    const esCorrecta = await usuario.compararContraseña(contraseña);
    if (!esCorrecta) return res.status(400).json({ mensaje: "Correo o contraseña inválidos" });

    // Consola con mensaje y emoji
    console.log(`🔑 ${usuario.nombre} ha iniciado sesión correctamente. ✅`);

    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      token: generarToken(usuario._id)
    });
  } catch (error) {
    console.error("❌ Error en el login:", error.message);
    res.status(500).json({ mensaje: "Error en el login", error: error.message });
  }
};

// Perfil protegido
exports.perfil = async (req, res) => {
  const usuario = await Usuario.findById(req.usuarioId).select("-contraseña");
  if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
  res.json(usuario);
};




















// Recuperación de contraseña
exports.recuperarContraseña = async (req, res) => {
  const { correo } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(400).json({ mensaje: "Usuario no encontrado." });

    const token = crypto.randomBytes(20).toString("hex");
    usuario.resetPasswordToken = token;
    usuario.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await usuario.save();

    const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const html = `
      <h2>Hola ${usuario.nombre}</h2>
      <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
      <a href="${link}">Restablecer contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
    `;
    
    await enviarCorreo(correo, "Recuperación de Contraseña", html);
    res.status(200).json({ mensaje: "Te hemos enviado un enlace para restablecer tu contraseña." });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al recuperar la contraseña.", error: err.message });
  }
};





// Restablecimiento de contraseña
exports.restablecerContraseña = async (req, res) => {
  const { token } = req.params;
  const { contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Verificar que el token no haya expirado
    });

    if (!usuario) {
      console.log("⚠️ Token inválido o expirado para el usuario:", usuario.nombre);  // Si el token no es válido, imprimir en consola
      return res.status(400).json({ mensaje: "Token inválido o expirado." });
    }

    usuario.contraseña = contraseña;
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpires = undefined;

    await usuario.save();

    // Consola con mensaje y emoji
    console.log(`🔐 Contraseña cambiada con éxito para ${usuario.nombre}. 🔄`);

    res.status(200).json({ mensaje: "Tu contraseña ha sido restablecida con éxito." });
  } catch (err) {
    console.error("❌ Error al restablecer la contraseña:", err.message);  // Log del error
    res.status(500).json({ mensaje: "Error al restablecer la contraseña.", error: err.message });
  }
};






// authController.js
exports.actualizarNombre = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ mensaje: "El nombre es obligatorio" });

    const usuario = await Usuario.findByIdAndUpdate(req.usuarioId, { nombre }, { new: true });
    res.json({ mensaje: "Nombre actualizado", nombre: usuario.nombre });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar nombre", error: error.message });
  }
};





exports.reenviarCorreoVerificacion = async (req, res) => {
  const { correo } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(400).json({ mensaje: "Usuario no encontrado." });

    if (usuario.verificado) {
      return res.status(400).json({ mensaje: "La cuenta ya está verificada." });
    }

    // Crear nuevo token
    const tokenVerificacion = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const link = `${process.env.FRONTEND_URL}/api/auth/verificar/${tokenVerificacion}`;

    const html = `
      <h2>Hola ${usuario.nombre}</h2>
      <p>Haz clic para verificar tu cuenta:</p>
      <a href="${link}">Verificar cuenta</a>
    `;

    await enviarCorreo(correo, "Reenvío de verificación", html);

    console.log(`📧 Reenvío de verificación enviado a: ${correo}`);

    res.status(200).json({ mensaje: "Correo reenviado." });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al reenviar correo.",
      error: error.message
    });
  }
};
