const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    verificado: { type: Boolean, default: false }, // Nuevo campo
    sueldoBase: { type: Number, default: 0 },
    diaCobro: { type: Number, default: 1 },
    AFP: { type: Number, default: 0 },
    seguro: { type: Number, default: 0 },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
  },
  { timestamps: true }
);

usuarioSchema.pre("save", async function (next) {
  if (!this.isModified("contraseña")) return next();
  const salt = await bcrypt.genSalt(10);
  this.contraseña = await bcrypt.hash(this.contraseña, salt);
  next();
});

usuarioSchema.methods.compararContraseña = async function (password) {
  return await bcrypt.compare(password, this.contraseña);
};

module.exports = mongoose.model("Usuario", usuarioSchema);
