// utils/enviarCorreosMasivos.js
const enviarCorreo = require('./enviarCorreoActualizacion');

const enviarCorreosMasivos = async (listaFinal, asunto, contenidoHtml) => {
  const exitosos = [];
  const fallidos = [];

  for (const correo of listaFinal) {
    try {
      const res = await enviarCorreo(correo, asunto, contenidoHtml);
      if (res.success) {
        exitosos.push(correo);
      } else {
        fallidos.push(correo);
      }
      await new Promise(r => setTimeout(r, 150)); // pausa 150ms para evitar límite
    } catch (err) {
      console.log("Error enviando a:", correo, err.message);
      fallidos.push(correo);
    }
  }

  return { exitosos, fallidos };
};

module.exports = { enviarCorreosMasivos };
