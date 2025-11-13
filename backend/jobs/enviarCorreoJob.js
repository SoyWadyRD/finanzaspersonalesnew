const agenda = require("../utils/agenda");
const enviarCorreoActualizacion = require("../utils/enviarCorreoActualizacion");
const Actualizacion = require("../models/actualizacion");

agenda.define("enviar correo", async (job) => {
  const { asunto, contenidoHtml, destinatarios, actualizacionId } = job.attrs.data;

  // Plantilla HTML del correo
  const plantillaHtml = (contenido) => `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${asunto}</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#0a0a0a;">
      <table role="presentation" width="100%" style="background:#f4f4f4;padding:30px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" style="background:rgb(0,30,43);border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:20px;background:linear-gradient(90deg,#001e2b,#002a36);text-align:center;">
                  <img src="https://finanzaspersonales.icu/img/logo.jpeg" alt="Logo" width="80" style="border-radius:50%;display:block;margin:0 auto 10px;">
                  <h1 style="color:#00a35c;margin:0;font-size:20px">${asunto}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:20px;background:#fff;color:#111;">
                  ${contenido}
                </td>
              </tr>
              <tr>
                <td style="padding:20px;background:#001e2b;color:#fff;text-align:center;font-size:14px;">
                  <div style="color:#00a35c;font-weight:bold;font-size:16px;margin-bottom:8px;">
                    Finanzas Personales
                  </div>
                  <a href="https://finanzaspersonales.icu/login.html"
                     style="display:inline-block;
                            background:#00a35c;
                            color:#fff;
                            text-decoration:none;
                            padding:10px 18px;
                            border-radius:8px;
                            font-weight:bold;
                            margin-top:6px;
                            transition:background 0.3s;">
                     Ir
                  </a>
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
    await Actualizacion.findByIdAndUpdate(actualizacionId, {
      enviadosExitosos: exitos.length,
      enviadosFallidos: fallidos.length,
      detallesFallos: fallidos,
    });

    console.log(`📧 Job completado: ${exitos.length} enviados, ${fallidos.length} fallidos.`);
  } catch (err) {
    console.error("❌ Error en el job de envío de correos:", err);
  }
});

module.exports = agenda;
