// models/actualizacion.js
const mongoose = require("mongoose");

const actualizacionSchema = new mongoose.Schema({
  asunto: { type: String, required: true },
  contenidoHtml: { type: String, required: true },
  fechaEnvio: { type: Date, default: Date.now },
  destinatarios: [{ type: String }], // lista de emails
  cantidadDestinatarios: { type: Number, default: 0 },
  enviadosExitosos: { type: Number, default: 0 },
  enviadosFallidos: { type: Number, default: 0 },
  detallesFallos: [{ email: String, error: String }]
}, { timestamps: true });

module.exports = mongoose.model("Actualizacion", actualizacionSchema);
