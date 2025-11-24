const Gasto = require('../models/gasto');
const Ingreso = require('../models/ingreso');
const Usuario = require('../models/usuario');
const moment = require('moment');
const jwt = require('jsonwebtoken');

exports.obtenerCalendarios = async (req, res) => {
  try {
    // Cambiar 'x-auth-token' por 'Authorization' y verificar el formato
    const authHeader = req.headers.authorization;

    // Verificar si la cabecera 'Authorization' está presente
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ mensaje: 'No autorizado, token no proporcionado' });
    }

    // Extraer el token del formato 'Bearer <token>'
    const token = authHeader.split(" ")[1];

    // Verificación del token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ mensaje: 'Token no válido' });
    }

    // Guardamos la información decodificada del token en req.user
    req.user = decoded;

    const usuario = await Usuario.findById(req.user.id);  // Ahora se usa req.user.id
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const fechaRegistro = moment(usuario.createdAt); // Fecha de registro del usuario
    const fechaHoy = moment().hours(12).minutes(0).seconds(0);  // Hora establecida a las 12:00 PM
if (fechaHoy.isAfter(moment(usuario.createdAt))) {
  // Si estamos después de las 12 PM y el usuario ya está registrado, agrega un nuevo día
  const nuevoDia = {
    dia: fechaHoy.date(),
    fecha: fechaHoy.format('YYYY-MM-DD')
  };
  mesHoy.dias.push(nuevoDia);
}



    // Crear un array para los meses
    const meses = [];
    let mesActual = fechaRegistro.clone().startOf('month');

    // Recorremos todos los meses desde el mes de registro hasta el mes actual
    while (mesActual.isBefore(fechaHoy, 'month')) {
      const mes = { mes: mesActual.format('MMMM YYYY'), dias: [] };

      const diasEnElMes = mesActual.daysInMonth();
      for (let i = 1; i <= diasEnElMes; i++) {
        const dia = mesActual.clone().date(i);

        // Si estamos en el mes de registro, solo incluir los días a partir del registro
        if (mesActual.isSame(fechaRegistro, 'month') && dia.isBefore(fechaRegistro, 'day')) {
          continue; // Omite los días antes del registro
        }

        // Incluye los días hasta el día actual
        if (dia.isBefore(fechaHoy) || dia.isSame(fechaHoy, 'day')) {
          mes.dias.push({ dia: dia.date(), fecha: dia.format('YYYY-MM-DD') });
        }
      }
      meses.push(mes);
      mesActual.add(1, 'month');
    }

    // Ahora agregamos el mes actual (noviembre)
    if (fechaHoy.isSameOrAfter(fechaRegistro, 'day')) {
      const mesHoy = {
        mes: fechaHoy.format('MMMM YYYY'),
        dias: []
      };

      // Si estamos en noviembre, comenzamos desde el 1 hasta el día de hoy
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
    console.error("Error en el servidor:", error);  // Verifica los errores en el servidor
    res.status(500).json({ error: 'Error al obtener calendarios' });
  }
};









// Ruta para obtener los gastos e ingresos del día
exports.obtenerGastosIngresosDelDia = async (req, res) => {
  try {
    const { fecha } = req.params;

    // Convertir la fecha en un formato adecuado
    const fechaInicio = moment(fecha).startOf('day').toDate();
    const fechaFin = moment(fecha).endOf('day').toDate();

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

    // Buscar los gastos e ingresos
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

// Asegúrate de revisar en consola que el tipo sea correcto


// Responder con los movimientos
res.json({ movimientos });


  } catch (error) {
    console.error("Error al obtener los gastos e ingresos del día:", error);
    res.status(500).json({ error: 'Error al obtener los gastos e ingresos' });
  }
};