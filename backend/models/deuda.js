// deuda.js

const mongoose = require("mongoose");

const deudaSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    nombre: { type: String, required: true },
    monto: { type: Number, required: true },
    fechaPago: { type: Date, required: true },
    recordatorioSemanal: { type: Boolean, default: false },
    recordatorioDia: { type: Boolean, default: false },
    descripcion: { type: String },
    tipo: { type: String, default: 'deuda' }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deuda", deudaSchema);
