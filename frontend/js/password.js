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
  if (mensajeError) {
    mensajeError.querySelector("p").textContent = mensaje;
    mensajeError.style.display = "block";

    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
      mensajeError.style.display = "none";
    }, 3000);
  }
};

// Función para mostrar mensaje de éxito
const mostrarMensajeExito = (mensaje) => {
  const mensajeExito = document.getElementById("mensajeExito");
  mensajeExito.textContent = mensaje;
  mensajeExito.style.display = "block";

  // Ocultar el mensaje después de 3 segundos y redirigir a login
  setTimeout(() => {
    mensajeExito.style.display = "none";
    window.location.href = "/login.html";  // Redirigir correctamente a login.html
  }, 3000);
};

// Formulario recuperar contraseña
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
        mostrarMensajeExito("Te hemos enviado un enlace para restablecer tu contraseña.");
        // Redirigir a login después de un tiempo
        setTimeout(() => {
          window.location.href = "/login.html";  // Redirigir correctamente a login.html
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






// Mostrar/ocultar contraseña en el formulario de recuperación
const togglePasswordRecuperar = document.getElementById("togglePasswordRecuperar"); 
const contraseñaInputRecuperar = document.getElementById("nuevaContraseña"); 
if (togglePasswordRecuperar && contraseñaInputRecuperar) { 
  togglePasswordRecuperar.addEventListener("click", function() { 
    const type = contraseñaInputRecuperar.type === "password" ? "text" : "password"; 
    contraseñaInputRecuperar.type = type; 
    this.classList.toggle("fa-eye-slash"); 
  });
}

// Mostrar/ocultar contraseña en el formulario de login
const togglePasswordLogin = document.getElementById("togglePasswordLogin"); 
const contraseñaInputLogin = document.getElementById("contraseñaLogin"); 
if (togglePasswordLogin && contraseñaInputLogin) { 
  togglePasswordLogin.addEventListener("click", function() { 
    const type = contraseñaInputLogin.type === "password" ? "text" : "password"; 
    contraseñaInputLogin.type = type; 
    this.classList.toggle("fa-eye-slash"); 
  });
}




// Formulario de restablecer contraseña
const formRestablecer = document.getElementById("formRestablecer");
if (formRestablecer) {
  formRestablecer.addEventListener("submit", async (e) => {
    e.preventDefault();

    const contraseña = document.getElementById("nuevaContraseña").value.trim();
    const token = window.location.pathname.split("/").pop();  // Asegúrate de que esto esté funcionando correctamente

    console.log("Token extraído de la URL:", token);  // Verificar que el token se extrae correctamente

    // Validar la contraseña
    if (!validarContraseña(contraseña)) {
      mostrarMensajeError("La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.");
      return;
    }

    try {
      const res = await fetch(`/api/auth/restablecer-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contraseña })
      });

      const data = await res.json();
      console.log("Respuesta del servidor:", data);  // Verificar qué responde el servidor

      if (res.ok) {
        // Mostrar mensaje de éxito
        mostrarMensajeExito("Tu contraseña ha sido restablecida correctamente.");
      } else {
        mostrarMensajeError(data.mensaje || "Error al restablecer la contraseña");
      }
    } catch (err) {
      console.error("Error al restablecer la contraseña", err);  // Log del error en el frontend
    }
  });
}

// Función para validar contraseña
function validarContraseña(contraseña) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return regex.test(contraseña);
}
