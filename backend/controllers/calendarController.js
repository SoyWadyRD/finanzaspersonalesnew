const Gasto = require('../models/gasto');
const Ingreso = require('../models/ingreso');
const Usuario = require('../models/usuario');
const moment = require('moment');
const jwt = require('jsonwebtoken');

exports.obtenerCalendarios = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ mensaje: 'No autorizado, token no proporcionado' });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ mensaje: 'Token no válido' });
    }

    req.user = decoded;

    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const fechaRegistro = moment(usuario.createdAt);  // Fecha de registro
    const fechaHoy = moment().startOf('day'); // Aseguramos que sea a las 00:00 de hoy

    const meses = [];
    let mesActual = fechaRegistro.clone().startOf('month');

    while (mesActual.isBefore(fechaHoy, 'month')) {
      const mes = { mes: mesActual.format('MMMM YYYY'), dias: [] };
      const diasEnElMes = mesActual.daysInMonth();
      for (let i = 1; i <= diasEnElMes; i++) {
        const dia = mesActual.clone().date(i);
        if (mesActual.isSame(fechaRegistro, 'month') && dia.isBefore(fechaRegistro, 'day')) {
          continue; 
        }
        if (dia.isBefore(fechaHoy) || dia.isSame(fechaHoy, 'day')) {
          mes.dias.push({ dia: dia.date(), fecha: dia.format('YYYY-MM-DD') });
        }
      }
      meses.push(mes);
      mesActual.add(1, 'month');
    }

    // Agregar el mes actual (noviembre)
    if (fechaHoy.isSameOrAfter(fechaRegistro, 'day')) {
      const mesHoy = {
        mes: fechaHoy.format('MMMM YYYY'),
        dias: []
      };
      for (let i = 1; i <= fechaHoy.date(); i++) {
        mesHoy.dias.push({
          dia: i,
          fecha: fechaHoy.clone().date(i).format('YYYY-MM-DD')
        });
      }
      meses.push(mesHoy);
    }

    res.json({ meses });

  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: 'Error al obtener calendarios' });
  }
};









exports.obtenerGastosIngresosDelDia = async (req, res) => {
  try {
    const { fecha } = req.params;

    // Convertir la fecha en un formato adecuado con hora local
    const fechaInicio = moment(fecha).startOf('day').local().toDate();  
    const fechaFin = moment(fecha).endOf('day').local().toDate();    
    
    
    
    console.log("Fecha recibida desde frontend: ", fecha);
console.log("Fecha de inicio (startOf day): ", fechaInicio);
console.log("Fecha de fin (endOf day): ", fechaFin);

    // Obtener el usuario
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ mensaje: 'No autorizado, token no proporcionado' });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ mensaje: 'Token no válido' });
    }

    const usuario = await Usuario.findById(decoded.id); 
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Buscar los gastos e ingresos con las fechas correctamente filtradas
    const gastos = await Gasto.find({
      usuarioId: usuario._id,
      fecha: { $gte: fechaInicio, $lte: fechaFin }
    });

    const ingresos = await Ingreso.find({
      usuarioId: usuario._id,
      fecha: { $gte: fechaInicio, $lte: fechaFin }
    });

    // Asignar tipo explícito a los gastos e ingresos
    gastos.forEach(gasto => {
      gasto.tipo = 'gasto'; // Todos los gastos se marcan como tipo 'gasto'
    });

    ingresos.forEach(ingreso => {
      if (!ingreso.tipo) {
        ingreso.tipo = 'sueldo'; // Si no tiene tipo, lo asignamos como 'sueldo'
      } else if (ingreso.tipo !== 'sueldo') {
        ingreso.tipo = 'ingreso'; // Si tiene un tipo diferente a 'sueldo', lo tratamos como ingreso
      }
    });



    // Unir ambos arreglos
    const movimientos = [...gastos, ...ingresos];

    // Responder con los movimientos
    res.json({ movimientos });

  } catch (error) {
    console.error("Error al obtener los gastos e ingresos del día:", error);
    res.status(500).json({ error: 'Error al obtener los gastos e ingresos' });
  }
};
