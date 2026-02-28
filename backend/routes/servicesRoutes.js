const express = require('express');
const router = express.Router();
const { crearServicio,
     marcarPagado,
      obtenerServicios,
       actualizarRecordatorio,
        eliminarServicio,
         actualizarServicio,
         obtenerServicio,
          editarServicio,
 } = require('../controllers/services');

// Rutas para los servicios
router.post('/', crearServicio);  // Crear servicio
router.put('/:servicioId/marcar-pagado', marcarPagado);  // Marcar como pagado
router.get('/', obtenerServicios);  // Obtener todos los servicios
router.post('/:servicioId/actualizar-recordatorio', actualizarRecordatorio);  // Actualizar recordatorios
router.delete('/:servicioId', eliminarServicio);  // Eliminar servicio
router.put('/:servicioId', actualizarServicio);  // Actualizar servicio

router.get('/:servicioId', obtenerServicio);  // Obtener servicio por ID
router.put('/:servicioId/editar', editarServicio);  // Nueva ruta para editar un servicio

router.put("/pagar/:servicioId", marcarPagado);

router.put("/recordatorio/:servicioId", actualizarRecordatorio);



module.exports = router;
