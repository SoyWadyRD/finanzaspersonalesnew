const agenda = require("../utils/agenda");
const MovimientoPendiente = require("../models/movimientoPendiente");
const enviarCorreoActualizacion = require("../utils/enviarCorreoActualizacion");

agenda.define("recordatorio pago", async (job) => {
  const { movimientoId } = job.attrs.data;
  const movimiento = await MovimientoPendiente.findById(movimientoId).populate("usuarioId");

  if (!movimiento) return;

  const emailUsuario = movimiento.usuarioId.correo;

  const asunto = `Recordatorio de pago: ${movimiento.nombre}`;
  const contenidoHtml = `
    <p>Hola, recuerde que tiene un pago pendiente de <strong>${movimiento.nombre}</strong> por <strong>$${movimiento.monto}</strong> programado para el <strong>${movimiento.fechaPago.toLocaleDateString()}</strong>.</p>
  `;

  try {
    await enviarCorreoActualizacion(emailUsuario, asunto, contenidoHtml);
  } catch (err) {
    console.error("Error enviando recordatorio de pago:", err);
  }
});
