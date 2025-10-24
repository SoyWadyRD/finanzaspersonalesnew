const mongoose = require("mongoose");

const ingresoSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    monto: { type: Number, required: true },
    tipo: { type: String, default: "sueldo" }, // sueldo, bono, etc.
    categoria: { type: String, required: true },
    descripcion: { type: String },
    fecha: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ingreso", ingresoSchema);
