const Actualizacion = require("../models/actualizacion");
const enviarCorreo = require("../utils/enviarCorreoActualizacion");

const REINTENTOS = 3; // se puede configurar
const ESPERA = 500;   // 500ms entre intentos

const reintentarFallidos = async () => {
  // Buscar actualizaciones con fallidos
  const actualizaciones = await Actualizacion.find({ enviadosFallidos: { $gt: 0 } });

  for (const act of actualizaciones) {
    const nuevosFallidos = [];

    for (const correo of act.detallesFallos) {
      let enviado = false;

      for (let i = 0; i < REINTENTOS; i++) {
        try {
          await enviarCorreo(correo, act.asunto, act.contenidoHtml);
          enviado = true;
          break; // salió bien, no reintenta más
        } catch (err) {
          await new Promise(r => setTimeout(r, ESPERA));
        }
      }

      if (!enviado) nuevosFallidos.push(correo); // aún falla, lo dejamos para el siguiente ciclo
    }

    act.enviadosExitosos += (act.detallesFallos.length - nuevosFallidos.length);
    act.enviadosFallidos = nuevosFallidos.length;
    act.detallesFallos = nuevosFallidos;
    await act.save();
  }
};

module.exports = reintentarFallidos;
