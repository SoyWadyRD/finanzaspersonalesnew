const mongoose = require("mongoose");

const servicioSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    nombre: { type: String, required: true },
    monto: { type: Number, required: true },
    categoria: { type: String, required: function() { return this.tipo === 'servicio'; } },  // Solo requerido si es servicio
    fechaPago: { type: Date, required: true },
    periodo: { type: String, required: function() { return this.tipo === 'servicio'; } },  // Solo requerido si es servicio
    tipo: { type: String, enum: ['servicio', 'deuda'], required: true },
    recordatorioSemanal: { type: Boolean, default: false },
    recordatorioDia: { type: Boolean, default: false },
    descripcion: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Servicio", servicioSchema);
