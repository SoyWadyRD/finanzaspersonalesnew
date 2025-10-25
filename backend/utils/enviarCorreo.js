const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const enviarCorreo = async (to, subject, html) => {
  console.log("✅ Iniciando envío de correo con Resend...");

  try {
    const result = await resend.emails.send({
      from: 'Finanzas Personales <onboarding@resend.dev>',
      to,
      subject,
      html
    });

    console.log(`✅ Correo enviado a ${to} con éxito.`);
    console.log("📬 Respuesta:", result);
  } catch (error) {
    console.error("❌ Error al enviar el correo:", error);
    throw new Error("No se pudo enviar el correo de verificación con Resend.");
  }
};

module.exports = enviarCorreo;
