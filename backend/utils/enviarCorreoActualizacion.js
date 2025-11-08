const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const enviarCorreo = async (to, subject, html) => {
  console.log(`📤 Enviando correo a ${to}...`);

  try {
    const result = await resend.emails.send({
      from: "Finanzas Personales <actualizacion@finanzaspersonales.icu>",
      to,
      subject,
      html,
    });

    if (result.data?.id) {
      console.log(`✅ Correo enviado con éxito a ${to} (ID: ${result.data.id})`);
    } else {
      console.log(`⚠️ Correo enviado pero sin ID devuelto (${to})`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error al enviar correo a ${to}:`, error.message);
    throw new Error(`Error enviando a ${to}: ${error.message}`);
  }
};

module.exports = enviarCorreo;
