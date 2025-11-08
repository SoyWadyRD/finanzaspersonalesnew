// controllers/enviarCorreoActualizacionController.js
const Usuario = require("../models/usuario");
const Actualizacion = require("../models/actualizacion");
const enviarCorreoActualizacion = require("../utils/enviarCorreoActualizacion"); // tu módulo con Resend

/**
 * POST /api/admin/enviar-actualizacion
 * Body: { asunto, contenidoHtml, destinatarios: [email,...], all: boolean }
 */
exports.enviarActualizacion = async (req, res) => {
  try {
    const { asunto, contenidoHtml, destinatarios = [], all = false } = req.body;

    if (!asunto || !contenidoHtml) {
      return res.status(400).json({ mensaje: "Asunto y contenido son obligatorios" });
    }

    // Obtener destinatarios: si all === true -> obtener todos los correos de usuarios verificados
    let listaFinal = [];

    if (all) {
      // Opcional: solo usuarios verificados si quieres
      const usuarios = await Usuario.find({}, "correo").lean();
      listaFinal = usuarios.map(u => u.correo).filter(Boolean);
    } else {
      // Si proporcionaron una lista, usarla (filtrar nulos y duplicados)
      listaFinal = Array.isArray(destinatarios) ? destinatarios.filter(Boolean) : [];
    }

    listaFinal = Array.from(new Set(listaFinal)); // quitar duplicados

    if (!listaFinal.length) {
      return res.status(400).json({ mensaje: "No hay destinatarios para enviar" });
    }

    // Construir plantilla HTML completa (logo, header, contenido y footer)
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
                  <td style="padding:20px;background:linear-gradient(90deg,#001e2b, #002a36);text-align:center;">
                    <img src="finanzaspersonales.icu/img/logo.jpeg" alt="Logo" width="80" style="border-radius:50%;display:block;margin:0 auto 10px;">
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

    // Envío: usar Promise.allSettled para no cortar si algún envío falla
    const resultados = await Promise.allSettled(
      listaFinal.map(async (email) => {
        try {
          // enviarCorreo espera (to, subject, html)
          await enviarCorreoActualizacion(email, asunto, plantillaHtml(contenidoHtml));
          return { email, status: "fulfilled" };
        } catch (err) {
          // devolver el error para resumir después
          return { email, status: "rejected", error: err.message || String(err) };
        }
      })
    );

    // Resumir resultados
    const exitos = resultados.filter(r => r.status === "fulfilled").length;
    const fallidos = resultados.filter(r => r.status === "rejected").length;
    const detallesFallos = resultados
      .filter(r => r.status === "rejected")
      .map(r => ({ email: r.value ? r.value.email : "desconocido", error: r.reason?.message || JSON.stringify(r.reason) }));

    // Guardar historial
    const nuevaActualizacion = new Actualizacion({
      asunto,
      contenidoHtml,
      fechaEnvio: new Date(),
      destinatarios: listaFinal,
      cantidadDestinatarios: listaFinal.length,
      enviadosExitosos: exitos,
      enviadosFallidos: fallidos,
      detallesFallos
    });

    await nuevaActualizacion.save();

    return res.json({
      mensaje: "Correo Enviado",
      total: listaFinal.length,
      exitos,
      fallidos,
      detallesFallos
    });

  } catch (err) {
    console.error("Error enviarActualizacion:", err);
    return res.status(500).json({ mensaje: "Error al procesar el envío", error: err.message });
  }
};
