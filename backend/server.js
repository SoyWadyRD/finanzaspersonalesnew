const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const conectarDB = require("./config/db");
const metasRoutes = require("./routes/metasRoutes");
const authRoutes = require("./routes/authRoutes");
const finanzasRoutes = require("./routes/finanzasRoutes");
const helmet = require('helmet');
const cors = require('cors'); // Asegúrate de importar cors

dotenv.config();



// Crear instancia de Express
const app = express();

// Política CSP mejorada
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Solo permite cargar contenido del mismo dominio
      scriptSrc: [
        "'self'", // Solo scripts desde el mismo dominio
        "https://cdnjs.cloudflare.com", // Permitir scripts desde CDN de Cloudflare
        "https://fonts.googleapis.com", // Permitir Google Fonts
        "'unsafe-inline'", // Permitir inline scripts (es necesario para algunos casos)
      ],
      styleSrc: [
        "'self'", // Solo estilos desde el mismo dominio
        "https://fonts.googleapis.com", // Permitir estilos de Google Fonts
        "https://cdnjs.cloudflare.com", // Permitir estilos desde CDN de Cloudflare
        "'unsafe-inline'", // Permitir estilos inline (es necesario para algunos casos)
      ],
      fontSrc: [
        "'self'", // Solo fuentes desde el mismo dominio
        "https://fonts.gstatic.com", // Permitir fuentes de Google
      ],
      connectSrc: ["'self'"], // Solo permite conexiones desde el mismo dominio
      imgSrc: ["'self'", "data:"], // Permitir imágenes del mismo dominio y de tipo `data:`
      objectSrc: ["'none'"], // Desactivar objetos embebidos (como Flash)
      mediaSrc: ["'self'"], // Permitir medios del mismo dominio
      frameSrc: ["'none'"], // Desactivar iframes (si no los usas)
      scriptSrcAttr: ["'unsafe-inline'"], // Permitir inline en atributos de script (onclick, etc.)
      baseUri: ["'self'"], // Solo permite base URI desde el mismo dominio
      formAction: ["'self'"], // Permitir que los formularios solo apunten a tu propio dominio
    },
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
