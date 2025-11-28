const Servicio = require("../models/servicio");
const Gasto = require("../models/gasto");
const { enviarCorreoRecordatorio } = require("../utils/notificaciones");
const jwt = require("jsonwebtoken"); // ← FALTA ESTA LÍNEA

const { format, addMonths, addYears, addWeeks } = require("date-fns");


exports.crearServicio = async (req, res) => {
  try {

    const authHeader = req.headers.authorization;
const token = authHeader.split(" ")[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const usuarioId = decoded.id;

    // Obtener los datos enviados en la solicitud
const { nombre, monto, categoria, fechaPago, periodo, recordatorioSemanal, recordatorioDia, descripcion, tipo } = req.body;
   


// Verificar si el usuarioId y tipo están presentes
    if (!usuarioId || !tipo) {
      return res.status(400).json({ error: "El campo usuarioId y tipo son obligatorios." });
    }

    // Convertir la fecha a un formato UTC y ajustar las horas para evitar problemas con la zona horaria
    const fecha = new Date(fechaPago);
    fecha.setUTCHours(12, 0, 0, 0);  // Establece las horas, minutos, segundos y milisegundos a 12:00:00 UTC

    // Crear el nuevo servicio
   const servicio = new Servicio({
  usuarioId,
  nombre,
  monto,
  categoria,
  fechaPago: fecha,  
  periodo,
  tipo,
  recordatorioSemanal: recordatorioSemanal || false,  // Valor por defecto
  recordatorioDia: recordatorioDia || false,          // Valor por defecto
  descripcion,
});



await servicio.save();;

    res.status(201).json(servicio);
  } catch (error) {
    console.error("Error en crear servicio:", error); // Registrar el error completo
    res.status(500).json({ error: "Hubo un problema al crear el servicio." });
  }
};


exports.marcarPagado = async (req, res) => {
  try {
    const { servicioId } = req.params;
    const servicio = await Servicio.findById(servicioId);

    if (!servicio) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    // Verificar que el servicio no haya sido marcado como pagado
    if (servicio.pagado) {
      return res.status(400).json({ error: "Este servicio ya ha sido marcado como pagado" });
    }

    let nuevaFechaPago;

    // Dependiendo del tipo de servicio, calcular la nueva fecha de pago
    if (servicio.tipo === "servicio") {
      if (servicio.periodo === "semanal") {
        nuevaFechaPago = new Date(servicio.fechaPago);
        nuevaFechaPago.setDate(nuevaFechaPago.getDate() + 7); // Asegura sumar una semana
      } else if (servicio.periodo === "mensual") {
        nuevaFechaPago = new Date(servicio.fechaPago);
        nuevaFechaPago.setMonth(nuevaFechaPago.getMonth() + 1); // Asegura sumar un mes
      } else if (servicio.periodo === "anual") {
        nuevaFechaPago = new Date(servicio.fechaPago);
        nuevaFechaPago.setFullYear(nuevaFechaPago.getFullYear() + 1); // Asegura sumar un año
      }

      servicio.fechaPago = nuevaFechaPago; // Actualizamos la fecha de pago
      servicio.pagado = true; // Marcamos el servicio como pagado

      await servicio.save();

      // Registrar gasto al marcar como pagado
      const gasto = new Gasto({
        usuarioId: servicio.usuarioId,
        monto: servicio.monto,
        categoria: servicio.categoria,
        descripcion: servicio.nombre,
        fecha: Date.now(), // Fecha actual cuando se marca como pagado
      });
      

      await gasto.save();
    } else {
      // Si el tipo es 'deuda', simplemente no se suman fechas y solo se marca como pagado
      servicio.pagado = true;
      await servicio.save();
    }

    res.status(200).json(servicio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






exports.obtenerServicios = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuarioId = decoded.id; // ← ID del usuario logueado

    // Traer solo los servicios del usuario logueado
    const servicios = await Servicio.find({ usuarioId });

    res.status(200).json(servicios);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ error: "Hubo un error al obtener los servicios" });
  }
};





exports.actualizarRecordatorio = async (req, res) => {
  try {
    const { servicioId } = req.params;
    const { recordatorioSemanal, recordatorioDia } = req.body;

    // Buscar el servicio en la base de datos
    const servicio = await Servicio.findById(servicioId);
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });

    // Actualizar los recordatorios
    if (recordatorioSemanal !== undefined) {
      servicio.recordatorioSemanal = recordatorioSemanal;
    }
    if (recordatorioDia !== undefined) {
      servicio.recordatorioDia = recordatorioDia;
    }

    await servicio.save();
    res.status(200).json(servicio); // Devolver el servicio actualizado
  } catch (error) {
    console.error("Error al actualizar recordatorio:", error);
    res.status(500).json({ error: "Hubo un problema al actualizar el recordatorio." });
  }
};






exports.eliminarServicio = async (req, res) => {
  try {
    const { servicioId } = req.params;
    
    const servicio = await Servicio.findByIdAndDelete(servicioId);
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });

    res.status(200).json({ message: "Servicio eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({ error: "Hubo un problema al eliminar el servicio." });
  }
};










// En el controlador
exports.actualizarServicio = async (req, res) => {
  try {
    const { servicioId } = req.params;
    const { tipo, nombre, monto, categoria, fechaPago, periodo } = req.body;

    const servicio = await Servicio.findById(servicioId);
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });

    // Actualizar los campos
    servicio.tipo = tipo;
    servicio.nombre = nombre;
    servicio.monto = monto;
    servicio.categoria = categoria;
    servicio.fechaPago = new Date(fechaPago); // Convertir a fecha
    servicio.periodo = periodo;
    

    await servicio.save();
    res.status(200).json(servicio); // Devolver el servicio actualizado
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({ error: "Hubo un problema al actualizar el servicio." });
  }
};



exports.obtenerServicio = async (req, res) => {
  try {
    const { servicioId } = req.params;
    const servicio = await Servicio.findById(servicioId);
    
    if (!servicio) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    res.status(200).json(servicio); // Devolver el servicio encontrado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hubo un error al obtener el servicio" });
  }
};




// Editar un servicio o deuda
exports.editarServicio = async (req, res) => {
  try {
    const { servicioId } = req.params;
    const { tipo, nombre, monto, categoria, fechaPago, periodo, recordatorioSemanal, recordatorioDia } = req.body;

    // Buscar el servicio por ID
    const servicio = await Servicio.findById(servicioId);
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });

    // Editar un servicio
    if (tipo === "servicio") {
      servicio.nombre = nombre || servicio.nombre;
      servicio.monto = parseFloat(monto) || servicio.monto;
      servicio.categoria = categoria || servicio.categoria;
      servicio.periodo = periodo || servicio.periodo;
      servicio.recordatorioSemanal = recordatorioSemanal !== undefined ? recordatorioSemanal : servicio.recordatorioSemanal;
      servicio.recordatorioDia = recordatorioDia !== undefined ? recordatorioDia : servicio.recordatorioDia;

      if (fechaPago && !isNaN(new Date(fechaPago).getTime())) {
        servicio.fechaPago = new Date(fechaPago);
      }
    }

    // Editar una deuda
    if (tipo === "deuda") {
      servicio.nombre = nombre || servicio.nombre;
      servicio.monto = monto || servicio.monto;
      if (fechaPago && !isNaN(new Date(fechaPago).getTime())) {
        servicio.fechaPago = new Date(fechaPago);
      }
      servicio.recordatorioSemanal = recordatorioSemanal !== undefined ? recordatorioSemanal : servicio.recordatorioSemanal;
      servicio.recordatorioDia = recordatorioDia !== undefined ? recordatorioDia : servicio.recordatorioDia;
    }

    // Guardar los cambios
    await servicio.save();
    res.status(200).json(servicio);
  } catch (error) {
    console.error("Error al editar el servicio:", error);
    res.status(500).json({ error: "Hubo un problema al editar el servicio." });
  }
};











