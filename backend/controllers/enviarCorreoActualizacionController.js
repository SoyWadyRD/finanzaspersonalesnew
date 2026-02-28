const { enviarCorreosMasivos } = require('../utils/enviarCorreosMasivos');
const Usuario = require("../models/usuario");
const Actualizacion = require("../models/actualizacion");
const agenda = require("../jobs/enviarCorreoJob");

exports.enviarActualizacion = async (req, res) => {
  try {
    const { asunto, contenidoHtml, destinatarios = [], all = false, fechaEnvio } = req.body;

    if (!asunto || !contenidoHtml) {
      return res.status(400).json({ mensaje: "Asunto y contenido son obligatorios" });
    }

    // Crear lista de destinatarios
    let listaFinal = [];
    if (all) {
      const usuarios = await Usuario.find({}, "correo").lean();
      listaFinal = usuarios.map(u => u.correo).filter(Boolean);
    } else {
      listaFinal = Array.from(new Set(destinatarios.filter(Boolean)));
    }

    if (!listaFinal.length) {
      return res.status(400).json({ mensaje: "No hay destinatarios válidos" });
    }

    // Fecha del envío
    const fecha = fechaEnvio ? new Date(fechaEnvio) : new Date();
    if (isNaN(fecha.getTime())) {
      return res.status(400).json({ mensaje: "Fecha inválida" });
    }

    // Guardar la actualización
    const nuevaActualizacion = new Actualizacion({
      asunto,
      contenidoHtml,
      fechaEnvio: fecha,
      destinatarios: listaFinal,
      cantidadDestinatarios: listaFinal.length,
      enviadosExitosos: 0,
      enviadosFallidos: 0,
      detallesFallos: []
    });
    await nuevaActualizacion.save();

    // Si la fecha es futura, programar envío
    if (fecha > new Date()) {
  await agenda.schedule(fecha, "enviar correo", {
    asunto,
    contenidoHtml,
    destinatarios: listaFinal,
    actualizacionId: nuevaActualizacion._id,
  });

  return res.json({
    mensaje: `Correo programado para ${fecha.toLocaleString()}`,
  });
}

    // Si es envío inmediato
    const { exitosos, fallidos } = await enviarCorreosMasivos(listaFinal, asunto, contenidoHtml);

    nuevaActualizacion.enviadosExitosos = exitosos.length;
    nuevaActualizacion.enviadosFallidos = fallidos.length;
    nuevaActualizacion.detallesFallos = fallidos;
    await nuevaActualizacion.save();

    res.json({
      mensaje: `Envío completado: ${exitosos.length} exitosos, ${fallidos.length} fallidos`,
      exitosos,
      fallidos
    });

  } catch (err) {
    console.error("Error al enviar actualización:", err);
    res.status(500).json({
      mensaje: "Error al enviar la actualización",
      error: err.message,
    });
  }
};
