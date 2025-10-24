const mailjet = require('node-mailjet');

const client = mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC, 
  process.env.MJ_APIKEY_PRIVATE
);

const enviarCorreo = async (to, subject, html) => {
  console.log("✅ Iniciando proceso para enviar correo...");
  console.log("Public Key:", process.env.MJ_APIKEY_PUBLIC);
  console.log("Private Key:", process.env.MJ_APIKEY_PRIVATE);
  console.log("Mailjet User:", process.env.SMTP_USER_MAILJET);

  // Configuración del contenido del correo
  const mailOptions = {
    Messages: [
      {
        From: {
          Email: process.env.SMTP_USER_MAILJET, // Tu correo de Mailjet
          Name: "Finanzas Personales"
        },
        To: [
          {
            Email: to
          }
        ],
        Subject: subject,
        HTMLPart: html
      }
    ]
  };

  console.log("📧 Intentando enviar correo...");

  try {
    // Enviar el correo utilizando la API de Mailjet
    const result = await client.post("send", { data: mailOptions });

    console.log(`✅ Correo de verificación enviado a ${to} con éxito. Info: ${JSON.stringify(result)}`);
    console.log('Código de estado:', result.statusCode);

  } catch (error) {
    console.error("❌ Error al enviar el correo:", error.message);
    console.log("🛑 Detalles del error:", error);
    throw new Error("No se pudo enviar el correo de verificación.");
  }
};

module.exports = enviarCorreo;
