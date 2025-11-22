const fs = require('fs');
const path = require('path');

// Función para recorrer todas las carpetas y archivos dentro de un directorio
const listFiles = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      // Si es una carpeta, llamar a la función recursivamente
      console.log(`Carpeta: ${fullPath}`);
      listFiles(fullPath);  // Llamada recursiva para explorar la carpeta
    } else {
      // Si es un archivo, mostrar su ruta
      console.log(`Archivo: ${fullPath}`);
    }
  });
};

// Llamamos a la función para listar los archivos y carpetas de la carpeta 'frontend' y 'backend'
listFiles(path.join(__dirname, 'frontend'));  // Listar archivos en la carpeta frontend
listFiles(path.join(__dirname, 'backend'));   // Listar archivos en la carpeta backend
