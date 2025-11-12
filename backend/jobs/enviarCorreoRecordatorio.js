const cron = require('node-cron');
const Servicio = require('../models/servicio');
const { enviarCorreoRecordatorio } = require('../utils/notificaciones');
const { obtenerUsuarioPorId } = require('../utils/obtenerUsuario');
const moment = require('moment');

// 🕘 Ejecutar todos los días a las 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('🕘 Ejecutando tarea diaria de recordatorios de correo...');

  try {
    const servicios = await Servicio.find({
      $or: [{ recordatorioSemanal: true }, { recordatorioDia: true }],
      fechaPago: { $gte: new Date() },
    });

    for (let servicio of servicios) {
      const usuario = await obtenerUsuarioPorId(servicio.usuarioId);
      if (!usuario) continue;

      const email = usuario.correo;
      const fechaPago = moment(servicio.fechaPago);
      const diasRestantes = fechaPago.diff(moment(), 'days');
      const fechaFormateada = fechaPago.format('DD [de] MMMM [de] YYYY');

      // 💌 Plantilla HTML con diseño completo
      const plantillaHtml = (titulo, mensaje, botonTexto, botonLink) => `
        <!doctype html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>${titulo}</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#0a0a0a;">
          <table role="presentation" width="100%" style="background:#f4f4f4;padding:30px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" style="background:rgb(0,30,43);border-radius:8px;overflow:hidden;">
                  <tr>
                    <td style="padding:20px;background:linear-gradient(90deg,#001e2b,#002a36);text-align:center;">
                      <img src="https://finanzaspersonales.icu/img/logo.jpeg" alt="Logo" width="80" style="border-radius:50%;display:block;margin:0 auto 10px;">
                      <h1 style="color:#00a35c;margin:0;font-size:20px">${titulo}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px;background:#fff;color:#111;">
                      <p style="font-size:15px;line-height:1.6;">${mensaje}</p>
                      <p style="font-size:14px;margin-top:10px;color:#555;">
                        <strong>📅 Fecha de pago:</strong> ${fechaFormateada}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px;background:#001e2b;color:#fff;text-align:center;font-size:14px;">
                      <div style="color:#00a35c;font-weight:bold;font-size:16px;margin-bottom:8px;">
                        Finanzas Personales
                      </div>
                      <a href="${botonLink}"
                         style="display:inline-block;
                                background:#00a35c;
                                color:#fff;
                                text-decoration:none;
                                padding:10px 18px;
                                border-radius:8px;
                                font-weight:bold;
                                margin-top:6px;
                                transition:background 0.3s;">
                         ${botonTexto}
                      </a>
                      <p style="margin-top:18px;color:#bbb;font-size:13px;line-height:1.4;">
                        Gracias por usar <strong style="color:#00a35c;">Finanzas Personales 💚</strong><br>
                        Tu asistente financiero de confianza.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      // 🗓️ Recordatorio semanal (7 días antes del pago)
      if (servicio.recordatorioSemanal && diasRestantes === 7) {
        const titulo = 'Recordatorio: Pago de servicio en 7 días';
        const mensaje = `¡Hola ${usuario.nombre}! Este es un recordatorio de que el servicio "<strong>${servicio.nombre}</strong>" vence en <strong>7 días</strong>. 
        Asegúrate de prepararte antes del <strong>${fechaFormateada}</strong> para evitar retrasos.`;
        await enviarCorreoRecordatorio(
          email,
          titulo,
          plantillaHtml(
            titulo,
            mensaje,
            'Ir al Dashboard',
            'https://finanzaspersonales.icu/dashboard.html'
          )
        );
      }

      // 💰 Recordatorio del día del pago
      if (servicio.recordatorioDia && diasRestantes === 0) {
        const titulo = 'Recordatorio: Pago de servicio hoy';
        const mensaje = `¡Hola ${usuario.nombre}! Este es un recordatorio de que el servicio "<strong>${servicio.nombre}</strong>" vence <strong>hoy (${fechaFormateada})</strong>. 
        No olvides realizar el pago para mantener tus finanzas al día.`;
        await enviarCorreoRecordatorio(
          email,
          titulo,
          plantillaHtml(
            titulo,
            mensaje,
            'Ver servicio',
            'https://finanzaspersonales.icu/servicios.html'
          )
        );
      }
    }
  } catch (error) {
    console.error('❌ Error en la tarea de recordatorios de correo:', error);
  }
});




