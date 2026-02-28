const Usuario = require('../models/usuario');

const obtenerUsuarioPorId = async (usuarioId) => {
  try {
    const usuario = await Usuario.findById(usuarioId);
    return usuario;
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    throw new Error('No se pudo obtener el usuario.');
  }
};

module.exports = { obtenerUsuarioPorId };
