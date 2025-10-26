const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const conectarDB = require("./config/db");
const metasRoutes = require("./routes/metasRoutes");
const authRoutes = require("./routes/authRoutes");
const finanzasRoutes = require("./routes/finanzasRoutes");

const cors = require('cors'); // Asegúrate de importar cors

dotenv.config();

// Crear instancia de Express
const app = express();

// Habilitar CORS
app.use(cors()); // Usamos CORS antes de configurar las rutas y archivos estáticos

// Conectar a la base de datos
conectarDB();

// Directorio para servir archivos estáticos
const __dirnameBase = path.resolve(); // Define __dirnameBase
app.use(express.static(path.join(__dirnameBase, "frontend"))); // Sirve todos los archivos estáticos desde el directorio frontend

// Sirve CSS y JS específicos si están en carpetas dentro de frontend
app.use(express.static(path.join(__dirnameBase, 'frontend', 'css')));
app.use(express.static(path.join(__dirnameBase, 'frontend', 'js')));
app.use(express.static(path.join(__dirnameBase, 'frontend', 'img')));

// Middlewares
app.use(express.json());

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/finanzas", metasRoutes);
app.use("/api/finanzas", finanzasRoutes);

// Ruta raíz que sirve login.html
app.get('/', (req, res) => {
  const filePath = path.join(__dirnameBase, 'frontend', 'index.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(500).send('Error al servir el archivo index.html');
    }
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
