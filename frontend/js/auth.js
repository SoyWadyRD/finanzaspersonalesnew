const API_URL = "/api/auth";

// Función para mostrar el loader
const mostrarLoader = () => {
  document.getElementById("loader").style.display = "flex";
};

// Función para ocultar el loader
const ocultarLoader = () => {
  document.getElementById("loader").style.display = "none";
};

// Función para mostrar mensajes de error en el div
const mostrarMensajeError = (mensaje) => {
  const mensajeError = document.getElementById("mensajeError");
  mensajeError.querySelector("p").textContent = mensaje;
  mensajeError.style.display = "block";

  // Ocultar el mensaje después de 3 segundos
  setTimeout(() => {
    mensajeError.style.display = "none";
  }, 3000);
};

// Función para validar la contraseña
const validarContraseña = (contraseña) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]:;"'<>,.?/\\|]).{8,}$/;
  return regex.test(contraseña);
};

// Función para validar el nombre
const validarNombre = (nombre) => {
  // Verifica si contiene caracteres inválidos (solo permite a-z, A-Z, espacios y ñ/Ñ)
  const contieneCaracteresInvalidos = /[^a-zA-ZñÑ\s]/.test(nombre);
  if (contieneCaracteresInvalidos) {
    mostrarMensajeError("El nombre no puede contener acentos, guiones ni caracteres especiales.");
    return false;
  }

  // Separa el nombre en partes y valida que tenga al menos nombre y apellido
  const nombreSplit = nombre.trim().split(/\s+/);
  if (nombreSplit.length < 2) {
    mostrarMensajeError("El nombre debe contener al menos un nombre y un apellido.");
    return false;
  }

  return true;
};


// Registro
const formRegistro = document.getElementById("formRegistro");
if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contraseña = document.getElementById("contraseña").value.trim();

    // Validar nombre y contraseña
    if (!validarNombre(nombre)) {
      mostrarMensajeError("El nombre debe contener al menos un nombre y un apellido.");
      return;
    }

    if (!validarContraseña(contraseña)) {
      mostrarMensajeError("La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.");
      return;
    }

    // Mostrar el loader mientras se procesa la solicitud
    mostrarLoader();

    try {
      const res = await fetch(`${API_URL}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, contraseña })
      });

      const data = await res.json();
      ocultarLoader();

      if (res.ok) {
        // Mostrar mensaje de verificación de correo
        const mensajeVerificacion = document.getElementById("mensajeVerificacion");
        mensajeVerificacion.style.display = "block";

        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
          mensajeVerificacion.style.display = "none";
          window.location.href = "login.html";
        }, 3000);
      } else {
        mostrarMensajeError(data.mensaje || "Error al registrarte ❌");
      }
    } catch (err) {
      ocultarLoader();
      mostrarMensajeError("Error en el servidor ❌");
    }
  });
}












// Login
const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correoLogin").value.trim();
    const contraseña = document.getElementById("contraseñaLogin").value.trim();

    // Mostrar el loader mientras se procesa la solicitud
    mostrarLoader();

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contraseña })
      });

      const data = await res.json();
      ocultarLoader();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
      } else {
        mostrarMensajeError(data.mensaje || "Error al iniciar sesión ❌");
      }
    } catch (err) {
      ocultarLoader();
      mostrarMensajeError("Error en el servidor ❌");
    }
  });
}














// Función para mostrar/ocultar la contraseña
const togglePassword = document.getElementById("togglePassword"); 
if (togglePassword) {
  togglePassword.addEventListener("click", () => {
    const contraseñaInput = document.getElementById("contraseña");  // Input en el formulario de registro
    const contraseñaLogin = document.getElementById("contraseñaLogin");  // Input en el formulario de login

    // Verifica cuál input está disponible
    const input = contraseñaInput || contraseñaLogin;  // Si existe contraseñaInput usa ese, si no, usa contraseñaLogin
    if (input) {
      const type = input.type === "password" ? "text" : "password";  // Cambia el tipo
      input.type = type;
      togglePassword.classList.toggle("fa-eye-slash");  // Cambia el icono
    }
  });
}





















// Función para manejar la recuperación de contraseña
const formRecuperar = document.getElementById("formRecuperar");
if (formRecuperar) {
  formRecuperar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correoRecuperar").value.trim();

    if (!correo) {
      mostrarMensajeError("Por favor, ingresa tu correo electrónico.");
      return;
    }

    // Mostrar el loader mientras se procesa la solicitud
    mostrarLoader();

    try {
      const res = await fetch(`${API_URL}/recuperar-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo })
      });

      const data = await res.json();
      ocultarLoader();

      if (res.ok) {
        // Mostrar mensaje de éxito
        mostrarMensajeError("Te hemos enviado un enlace para restablecer tu contraseña.");
        // Redirigir a login después de un tiempo
        setTimeout(() => {
          window.location.href = "login.html";
        }, 3000);
      } else {
        mostrarMensajeError(data.mensaje || "Error al enviar el enlace de recuperación.");
      }
    } catch (err) {
      ocultarLoader();
      mostrarMensajeError("Error en el servidor ❌");
    }
  });
}