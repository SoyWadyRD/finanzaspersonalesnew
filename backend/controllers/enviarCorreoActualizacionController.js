const Usuario = require("../models/usuario");
const Actualizacion = require("../models/actualizacion");
const agenda = require("../jobs/enviarCorreoJob"); // nuestro job con agenda

exports.enviarActualizacion = async (req, res) => {
  try {
    const { asunto, contenidoHtml, destinatarios = [], all = false, fechaEnvio } = req.body;

    if (!asunto || !contenidoHtml) {
      return res.status(400).json({ mensaje: "Asunto y contenido son obligatorios" });
    }

    let listaFinal = [];
    if (all) {
      const usuarios = await Usuario.find({}, "correo").lean();
      listaFinal = usuarios.map(u => u.correo).filter(Boolean);
    } else {
      listaFinal = Array.from(new Set(destinatarios.filter(Boolean)));
    }

    if (!listaFinal.length) return res.status(400).json({ mensaje: "No hay destinatarios" });

    const fecha = fechaEnvio ? new Date(fechaEnvio) : new Date();
    if (isNaN(fecha.getTime())) return res.status(400).json({ mensaje: "Fecha inválida" });

    // Guardar historial
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

    // Programar envío
    await agenda.schedule(fecha, "enviar correo", {
      asunto,
      contenidoHtml,
      destinatarios: listaFinal,
      actualizacionId: nuevaActualizacion._id
    });

    res.json({ mensaje: `Correo programado para ${fecha.toLocaleString()}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al programar correo", error: err.message });
  }
};
