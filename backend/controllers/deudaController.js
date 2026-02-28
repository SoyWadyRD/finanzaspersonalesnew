const mongoose = require('mongoose');
const Deuda = require("../models/deuda");

exports.crearDeuda = async (req, res) => {
  try {
    const { usuarioId, nombre, monto, fechaPago, recordatorioSemanal, recordatorioDia, descripcion } = req.body;

    // Verificar si los datos necesarios están presentes
    if (!usuarioId || !nombre || !monto || !fechaPago) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Guardar la fecha tal cual se recibe (no es necesario hacer conversiones adicionales)
    const deuda = new Deuda({
      usuarioId,
      nombre,
      monto,
      fechaPago: new Date(fechaPago),  // La fecha llega en formato "YYYY-MM-DD" y se guarda tal cual
      recordatorioSemanal,
      recordatorioDia,
      descripcion,
    });


    

    console.log("Datos recibidos para la deuda:", req.body); // Asegúrate de ver lo que llega al backend

    await deuda.save();
    res.status(201).json(deuda);
  } catch (error) {
    console.error("Error al crear deuda:", error);
    res.status(500).json({ error: "Hubo un problema al crear la deuda." });
  }
};




exports.obtenerDeudas = async (req, res) => {
  try {
    const deudas = await Deuda.find();  // Obtener todas las deudas
    // Asegúrate de que la fecha en la respuesta sea en formato UTC o ISO
    const deudasFormateadas = deudas.map(deuda => {
      deuda.fechaPago = deuda.fechaPago.toISOString().split('T')[0]; // Formato "YYYY-MM-DD"
      return deuda;
    });
    res.status(200).json(deudasFormateadas);  // Enviar la respuesta con todas las deudas
  } catch (error) {
    console.error("Error al obtener las deudas:", error);
    res.status(500).json({ error: "Hubo un problema al obtener las deudas." });
  }
};



exports.eliminarDeuda = async (req, res) => {
  try {
    const { deudaId } = req.params;
    const deuda = await Deuda.findByIdAndDelete(deudaId);
    if (!deuda) {
      return res.status(404).json({ error: "Deuda no encontrada" });
    }
    res.status(200).json({ message: "Deuda eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar deuda:", error);
    res.status(500).json({ error: "Hubo un problema al eliminar la deuda." });
  }
};

// Controlador para obtener una deuda por su ID
exports.obtenerDeuda = async (req, res) => {
  try {
    const { deudaId } = req.params;
    const deuda = await Deuda.findById(deudaId);

    if (!deuda) {
      return res.status(404).json({ error: "Deuda no encontrada." });
    }

    res.status(200).json(deuda);
  } catch (error) {
    console.error("Error al obtener deuda:", error);
    res.status(500).json({ error: "Hubo un problema al obtener la deuda." });
  }
};




exports.editarDeuda = async (req, res) => {
  try {
    const { deudaId } = req.params;  // Obtener el ID de la deuda desde los parámetros
    if (!mongoose.Types.ObjectId.isValid(deudaId)) {
      return res.status(400).json({ error: "ID de deuda no válido." });
    }

    const { nombre, monto, fechaPago, recordatorioSemanal, recordatorioDia, descripcion } = req.body;

    const deuda = await Deuda.findByIdAndUpdate(deudaId, {
      nombre,
      monto,
      fechaPago: new Date(fechaPago),
      recordatorioSemanal,
      recordatorioDia,
      descripcion,
    }, { new: true });

    if (!deuda) {
      return res.status(404).json({ error: "Deuda no encontrada." });
    }

    res.status(200).json(deuda);
  } catch (error) {
    console.error("Error al editar deuda:", error);
    res.status(500).json({ error: "Hubo un problema al editar la deuda." });
  }
};
