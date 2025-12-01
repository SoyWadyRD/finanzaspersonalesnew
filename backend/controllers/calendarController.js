const Gasto = require('../models/gasto');
const Ingreso = require('../models/ingreso');
const Usuario = require('../models/usuario');

const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
moment.locale('es');    // ← SOLUCIÓN

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

    // FECHAS
    const fechaRegistro = moment.tz(usuario.createdAt, 'America/Santo_Domingo').startOf('month');
    const fechaHoy = moment.tz('America/Santo_Domingo').startOf('month');
    const hoyDia = moment.tz('America/Santo_Domingo').date();

    let mesActual = fechaRegistro.clone();
    const meses = [];

    // RECORRER DESDE EL MES DE REGISTRO HASTA HOY
    while (mesActual.isSameOrBefore(fechaHoy, 'month')) {

      const inicioMes = mesActual.clone().startOf('month');
      const finMes = mesActual.clone().endOf('month');
      const diasMes = [];

      let diaActual = inicioMes.clone();

      while (diaActual.isSameOrBefore(finMes, 'day')) {

        // Evitar días futuros
        if (
          diaActual.isSameOrAfter(fechaRegistro, 'day') &&
          diaActual.isSameOrBefore(moment.tz('America/Santo_Domingo'), 'day')
        ) {
          diasMes.push({
            dia: diaActual.date(),
            fecha: diaActual.format('YYYY-MM-DD')
          });
        }

        diaActual.add(1, 'day');
      }

      meses.push({
        mes: mesActual.format('MMMM YYYY'),
        dias: diasMes
      });

      mesActual.add(1, 'month');
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
    const fechaInicio = moment.tz(fecha, 'YYYY-MM-DD', 'America/Santo_Domingo').startOf('day').toDate();  
const fechaFin = moment.tz(fecha, 'YYYY-MM-DD', 'America/Santo_Domingo').endOf('day').toDate();

   
    
    
    


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
