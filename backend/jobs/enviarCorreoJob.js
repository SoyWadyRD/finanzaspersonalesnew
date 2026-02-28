const agenda = require("../utils/agenda");
const enviarCorreoActualizacion = require("../utils/enviarCorreoActualizacion");
const Actualizacion = require("../models/actualizacion");

agenda.define("enviar correo", async (job) => {
  const { asunto, contenidoHtml, destinatarios, actualizacionId } = job.attrs.data;

  // Plantilla HTML compatible con bandeja principal
  const plantillaHtml = (contenido) => `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${asunto}</title>
  </head>

  <body style="margin:0; padding:0; background:#ffffff; font-family:Arial, Helvetica, sans-serif; color:#222;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; padding:20px;">
      <tr>
        <td align="center">

          <!-- Contenedor principal -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background:#ffffff; border-radius:8px;">

            <!-- LOGO -->
            <tr>
              <td align="center" style="padding-bottom:15px;">
                <img 
                  src="https://finanzaspersonales.icu/img/logo.jpeg"
                  width="70"
                  alt="Finanzas Personales"
                  style="border-radius:50%; display:block;">
              </td>
            </tr>

            <!-- TITULO -->
            <tr>
              <td align="center" style="font-size:20px; font-weight:bold; color:#00a35c; padding-bottom:20px;">
                ${asunto}
              </td>
            </tr>

            <!-- CONTENIDO -->
            <tr>
              <td style="font-size:15px; line-height:1.6; color:#222; padding:10px 10px 20px 10px;">
                ${contenido}
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td align="center" style="font-size:13px; color:#555; padding-top:20px;">
                Finanzas Personales · Este correo es informativo.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;

  try {
    // Enviar correos uno por uno
    const resultados = await Promise.allSettled(
      destinatarios.map(async (email) => {
        await enviarCorreoActualizacion(email, asunto, plantillaHtml(contenidoHtml));
        return email;
      })
    );

    const exitos = resultados.filter(r => r.status === "fulfilled").map(r => r.value);
    const fallidos = resultados
      .filter(r => r.status === "rejected")
      .map(r => ({
        email: r.reason?.email || "desconocido",
        error: r.reason?.message || String(r.reason)
      }));

    // Actualizar la base de datos con resultados
    const fallidosLimpios = fallidos.filter(f => typeof f === 'object');
await Actualizacion.findByIdAndUpdate(actualizacionId, {
  enviadosExitosos: exitos.length,
  enviadosFallidos: fallidosLimpios.length,
  detallesFallos: fallidosLimpios,
});


    console.log(`📧 Job completado: ${exitos.length} enviados, ${fallidos.length} fallidos.`);
  } catch (err) {
    console.error("❌ Error en el job de envío de correos:", err);
  }
});

module.exports = agenda;
