const axios = require('axios');
require('dotenv').config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com/emails';


// Función para enviar el correo de recordatorio
const enviarCorreoRecordatorio = async (email, asunto, cuerpo) => {
  try {
    const response = await axios.post(RESEND_API_URL, {
      from: 'Finanzas Personales <notificaciones@finanzaspersonales.icu>',
      to: email,
      subject: asunto,
      html: cuerpo,
    }, {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('Correo enviado:', response.data);
  } catch (error) {
    console.error('Error al enviar correo:', error);
  }
};

module.exports = { enviarCorreoRecordatorio };
