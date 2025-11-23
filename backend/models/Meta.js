const mongoose = require("mongoose");

const MetaSchema = mongoose.Schema({
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
  categoria: { type: String, required: true },
  descripcion: { type: String, required: true },
  fechaMeta: { type: Date, required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  montoActual: { type: Number, default: 0 }, // Asegúrate de que exista montoActual
  estado: { type: String, default: "pendiente" }, // Pendiente, alcanzada, fallida
}, {
  timestamps: true
});

module.exports = mongoose.model("Meta", MetaSchema);

