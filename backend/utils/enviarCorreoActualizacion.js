// utils/enviarCorreoActualizacion.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un correo usando Resend.
 * @param {string} to - Destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} html - Contenido HTML
 * @returns {Promise<{success: boolean, id?: string}>} Resultado del envío
 */
const enviarCorreo = async (to, subject, html) => {
  console.log(`📤 Enviando correo a ${to}...`);

  try {
    const result = await resend.emails.send({
      from: "Finanzas Personales <actualizacion@finanzaspersonales.icu>",
      to,
      subject,
      html,
    });

   if (result?.id || result?.data?.id) {
  const id = result.id || result.data.id;
  console.log(`✅ Correo enviado con éxito a ${to} (ID: ${id || 'no disponible'})`);
  return { success: true, id };
} else {
  console.log(`✅ Correo enviado a ${to}, pero sin ID devuelto`);
  return { success: true }; // <-- lo consideramos exitoso aunque no haya ID
}


  } catch (error) {
    console.error(`❌ Error al enviar correo a ${to}:`, error.message);
    return { success: false };
  }
};

module.exports = enviarCorreo;
