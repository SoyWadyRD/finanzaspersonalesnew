const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const conectarDB = require("./config/db");
const metasRoutes = require("./routes/metasRoutes");
const authRoutes = require("./routes/authRoutes");
const finanzasRoutes = require("./routes/finanzasRoutes");
const adminRoutes = require("./routes/adminRoutes");
const helmet = require('helmet');
const cors = require('cors'); // Asegúrate de importar cors

dotenv.config();



// Crear instancia de Express
const app = express();

// Política CSP mejorada
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net", // <- agregar esta línea
        "'unsafe-inline'"
      ],
      styleSrc: [
        "'self'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
        "'unsafe-inline'"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ],
      connectSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  })
);



// Habilitar CORS
app.use(cors()); // Usamos CORS antes de configurar las rutas y archivos estáticos

// Conectar a la base de datos
conectarDB();

// Directorio para servir archivos estáticos
const __dirnameBase = path.resolve();
app.use(express.static(path.join(__dirname, '..', 'frontend'))); // Sirve todos los archivos estáticos desde el directorio frontend

// Especificar rutas de los archivos estáticos de forma más precisa
app.use('/reset-password/js', express.static(path.join(__dirnameBase, 'frontend', 'js')));
app.use('/reset-password/img', express.static(path.join(__dirnameBase, 'frontend', 'img')));
app.use('/reset-password/css', express.static(path.join(__dirnameBase, 'frontend', 'css')));

// Verifica que los archivos estáticos sean accesibles
app.use((req, res, next) => {
  next();
});

// Middlewares
app.use(express.json());

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/finanzas", metasRoutes);
app.use("/api/finanzas", finanzasRoutes);

app.use("/api/admin", adminRoutes);

// Ruta raíz que sirve login.html
app.get('/', (req, res) => {
  const filePath = path.join(__dirnameBase, 'frontend', 'index.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(500).send('Error al servir el archivo index.html');
    }
  });
});

// Ruta de restablecimiento de contraseña
app.get('/reset-password/:token', (req, res) => {
  const token = req.params.token;
  const filePath = path.join(__dirname, '..', 'frontend', 'reset-password.html');
  res.sendFile(filePath, (err) => {
    if (err) {

      res.status(500).send("Error al cargar la página de restablecimiento.");
    } else {

    }
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
