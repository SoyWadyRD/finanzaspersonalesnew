const mongoose = require("mongoose");

const gastoSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    monto: { type: Number, required: true },
    categoria: { type: String, required: true },
    descripcion: { type: String },
    fecha: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gasto", gastoSchema);
