const Meta = require("../models/Meta");
const Gasto = require("../models/gasto");  // <-- FALTA ESTO


// Crear una nueva meta
// Crear meta
exports.crearMeta = async (req, res) => {
  const { nombre, cantidad, descripcion, fechaMeta, categoria } = req.body;
  const usuarioId = req.usuarioId;

  try {
    const nuevaMeta = new Meta({
      nombre,
      cantidad,
      descripcion,
      fechaMeta,
      categoria,
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
// Obtener metas
exports.obtenerMetas = async (req, res) => {
  try {
    const metas = await Meta.find({ usuarioId: req.usuarioId });
    res.json(metas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener metas", error: error.message });
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
// Eliminar meta
exports.eliminarMeta = async (req, res) => {
  try {
    const meta = await Meta.findOneAndDelete({
      _id: req.params.id,
      usuarioId: req.usuarioId
    });

    if (!meta) return res.status(404).json({ mensaje: "Meta no encontrada" });

    res.json({ mensaje: "Meta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar meta", error: error.message });
  }
};

















// Agregar monto
exports.agregarMonto = async (req, res) => {
  const { id } = req.params;
  const { monto } = req.body;

  try {
    const meta = await Meta.findOne({ _id: id, usuarioId: req.usuarioId });
    if (!meta) return res.status(404).json({ mensaje: "Meta no encontrada" });

    meta.montoActual = (meta.montoActual || 0) + monto;

    const metaCompletada = meta.montoActual >= meta.cantidad;
    if (metaCompletada && meta.estado !== "completada") {
      meta.estado = "completada";

      // Crear el gasto con la categoría de la meta
      await Gasto.create({
        usuarioId: req.usuarioId,
        monto: meta.cantidad,
        categoria: meta.categoria,  // Usar la categoría de la meta
        descripcion: `Meta "${meta.nombre}" completada`
      });
    }

    await meta.save();

    res.json({
      mensaje: metaCompletada
        ? "Monto agregado y meta completada"
        : "Monto agregado correctamente",
      meta
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al agregar monto", error: error.message });
  }
};
















// Quitar monto
exports.quitarMonto = async (req, res) => {
  const { id } = req.params;
  const { monto } = req.body;

  try {
    const meta = await Meta.findOne({ _id: id, usuarioId: req.usuarioId });
    if (!meta) return res.status(404).json({ mensaje: "Meta no encontrada" });

    meta.montoActual = (meta.montoActual || 0) - monto;
    if (meta.montoActual < 0) meta.montoActual = 0;

    await meta.save();

    res.json({ mensaje: "Monto quitado correctamente", meta });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al quitar monto", error: error.message });
  }
};






// Actualizar meta
// Editar meta
exports.editarMeta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cantidad, fechaMeta, descripcion, categoria } = req.body; // Asegúrate de que 'categoria' esté en el body

    const meta = await Meta.findOne({
      _id: id,
      usuarioId: req.usuarioId
    });

    if (!meta) {
      return res.status(404).json({ mensaje: "Meta no encontrada" });
    }

    meta.nombre = nombre;
    meta.cantidad = cantidad;
    meta.fechaMeta = fechaMeta;
    meta.descripcion = descripcion;
    meta.categoria = categoria;  // Aquí se actualiza la categoría

    await meta.save();

    res.json({ mensaje: "Meta actualizada correctamente", meta });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al editar meta", error: error.message });
  }
};

