const Meta = require("../models/Meta");

// Crear una nueva meta
exports.crearMeta = async (req, res) => {
  const { nombre, cantidad, descripcion, fechaMeta } = req.body;
  const usuarioId = req.usuarioId;

  try {
    const nuevaMeta = new Meta({
      nombre,
      cantidad,
      descripcion,
      fechaMeta,
      usuarioId
    });

    await nuevaMeta.save();
    res.status(201).json({ mensaje: "Meta creada correctamente", meta: nuevaMeta });
  } catch (error) {
    console.error("Error al crear la meta:", error);
    res.status(500).json({ mensaje: "Error al crear la meta", error: error.message });
  }
};

// Obtener todas las metas del usuario
exports.obtenerMetas = async (req, res) => {
  const usuarioId = req.usuarioId;

  try {
    const metas = await Meta.find({ usuarioId });
    res.json(metas);
  } catch (error) {
    console.error("Error al obtener las metas:", error);
    res.status(500).json({ mensaje: "Error al obtener las metas", error: error.message });
  }
};

// Actualizar una meta (por ejemplo, para marcarla como alcanzada)
exports.actualizarMeta = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const meta = await Meta.findOne({ _id: id, usuarioId: req.usuarioId });
    if (!meta) {
      return res.status(404).json({ mensaje: "Meta no encontrada" });
    }

    meta.estado = estado;
    await meta.save();

    res.json({ mensaje: "Meta actualizada correctamente", meta });
  } catch (error) {
    console.error("Error al actualizar la meta:", error);
    res.status(500).json({ mensaje: "Error al actualizar la meta", error: error.message });
  }
};

// Eliminar una meta
exports.eliminarMeta = async (req, res) => {
  const { id } = req.params;

  try {
    const meta = await Meta.findOneAndDelete({ _id: id, usuarioId: req.usuarioId });
    if (!meta) {
      return res.status(404).json({ mensaje: "Meta no encontrada" });
    }

    res.json({ mensaje: "Meta eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la meta:", error);
    res.status(500).json({ mensaje: "Error al eliminar la meta", error: error.message });
  }
};
















// Agregar monto a una meta
// Agregar monto a una meta
exports.agregarMonto = async (req, res) => {
  const { id } = req.params;
  const { monto } = req.body;

  try {
    const meta = await Meta.findOne({ _id: id, usuarioId: req.usuarioId });
    if (!meta) {
      return res.status(404).json({ mensaje: "Meta no encontrada" });
    }

    // Incrementar montoActual
    meta.montoActual = (meta.montoActual || 0) + monto; // Asegúrate de que el monto se sume correctamente
    await meta.save();

    // Responde con la meta actualizada
    res.json({ mensaje: "Monto agregado correctamente", meta });
  } catch (error) {
    console.error("Error al agregar monto:", error);
    res.status(500).json({ mensaje: "Error al agregar monto", error: error.message });
  }
};
















// Quitar monto de una meta
exports.quitarMonto = async (req, res) => {
  const { id } = req.params;
  const { monto } = req.body;

  try {
    const meta = await Meta.findOne({ _id: id, usuarioId: req.usuarioId });
    if (!meta) {
      return res.status(404).json({ mensaje: "Meta no encontrada" });
    }

    // Restar montoActual
    meta.montoActual = (meta.montoActual || 0) - monto; // Asegúrate de que el monto se reste correctamente
    if (meta.montoActual < 0) {
      meta.montoActual = 0; // Evita que el monto actual sea negativo
    }
    await meta.save();

    // Responde con la meta actualizada
    res.json({ mensaje: "Monto quitado correctamente", meta });
  } catch (error) {
    console.error("Error al quitar monto:", error);
    res.status(500).json({ mensaje: "Error al quitar monto", error: error.message });
  }
};






