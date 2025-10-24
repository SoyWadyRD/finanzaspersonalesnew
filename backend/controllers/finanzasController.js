const Gasto = require("../models/gasto");
const Ingreso = require("../models/ingreso");

// Registrar gasto
// Registrar gasto
exports.registrarGasto = async (req, res) => {
  const { monto, categoria, descripcion, fecha } = req.body;

  // Validación
  if (!monto || !categoria) {
    return res.status(400).json({ mensaje: "El monto y la categoría son obligatorios" });
  }

  try {
    const gasto = await Gasto.create({
      usuarioId: req.usuarioId,
      monto,
      categoria,
      descripcion: descripcion || "",
      fecha: fecha || new Date()
    });
    res.status(201).json(gasto);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar gasto", error: error.message });
  }
};


// Registrar ingreso
// Registrar ingreso
exports.registrarIngreso = async (req, res) => {
  const { monto, tipo, categoria, fecha } = req.body; // Asegúrate de que 'categoria' se está recibiendo

  // Validación
  if (!monto || !categoria) {
    return res.status(400).json({ mensaje: "El monto y la categoría son obligatorios" });
  }

  try {
    const ingreso = await Ingreso.create({
      usuarioId: req.usuarioId,
      monto,
      tipo,
      categoria,  // Registrar la categoría aquí
      descripcion: req.body.descripcion || "",  // También asegurate de manejar la descripción correctamente
      fecha: fecha || new Date(),
    });
    res.status(201).json(ingreso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al registrar ingreso", error: error.message });
  }
};

// Obtener balance total
exports.obtenerBalance = async (req, res) => {
  try {
    const ingresos = await Ingreso.find({ usuarioId: req.usuarioId });
    const gastos = await Gasto.find({ usuarioId: req.usuarioId });

    const totalIngresos = ingresos.reduce((acc, i) => acc + i.monto, 0);
    const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);

    res.json({ totalIngresos, totalGastos, balance: totalIngresos - totalGastos });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener balance", error: error.message });
  }
};

exports.listarMovimientos = async (req, res) => {
  try {
    const gastos = await Gasto.find({ usuarioId: req.usuarioId }).sort({ fecha: -1 });
    const ingresos = await Ingreso.find({ usuarioId: req.usuarioId }).sort({ fecha: -1 });

    // Combinar y ordenar todos los movimientos por fecha descendente
    const movimientos = [...gastos.map(g => ({ ...g._doc, tipo: "gasto" })), 
                         ...ingresos.map(i => ({ ...i._doc, tipo: "ingreso" }))];

    movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al listar movimientos", error: error.message });
  }
};