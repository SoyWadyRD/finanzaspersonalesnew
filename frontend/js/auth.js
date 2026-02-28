const API_URL = "/api/auth";

let intervaloReenvio; // variable global

function iniciarContadorReenvio() {
  const contadorReenviar = document.getElementById("contadorReenviar");
  const btnReenviar = document.getElementById("btnReenviar");

  let tiempo = 30;

  btnReenviar.disabled = true;
  btnReenviar.style.opacity = "0.5";

  contadorReenviar.textContent = `Reenviar enlace en ${tiempo}s`;

  // Si ya había un intervalo, lo limpiamos para evitar duplicados
  if (intervaloReenvio) clearInterval(intervaloReenvio);

  intervaloReenvio = setInterval(() => {
    tiempo--;
    contadorReenviar.textContent = `Reenviar enlace en ${tiempo}s`;

    if (tiempo <= 0) {
      clearInterval(intervaloReenvio);
      contadorReenviar.textContent = "Puedes reenviar el enlace";
      btnReenviar.disabled = false;
      btnReenviar.style.opacity = "1";
    }
  }, 1000);
}

// Función para mostrar el loader
const mostrarLoader = () => {
  document.getElementById("loader").style.display = "flex";
};

// Función para ocultar el loader
const ocultarLoader = () => {
  document.getElementById("loader").style.display = "none";
};

// Función para mostrar mensajes de error en el div
const mostrarMensajeError = (mensaje, esVerificacion = false) => {
  const mensajeError = document.getElementById("mensajeError");
  const textoError = document.getElementById("textoError");
  const bloqueVerificacion = document.getElementById("bloqueVerificacion");

  // 🛑 Si no existen, no hacer nada (evita el error en login o recuperar)
  if (!mensajeError || !textoError) {
    console.warn("⚠️ Elementos de mensaje no existen en esta página");
    return;
  }

  textoError.textContent = mensaje;
  mensajeError.style.display = "block";

  if (esVerificacion) {
    if (bloqueVerificacion) {
      bloqueVerificacion.style.display = "block";
      iniciarContadorVerificacionError();
    }
  } else {
    if (bloqueVerificacion) {
      bloqueVerificacion.style.display = "none";
    }
  }

  if (!esVerificacion) {
    setTimeout(() => {
      mensajeError.style.display = "none";
    }, 3000);
  }
};


function iniciarContadorVerificacionError() {
  const contador = document.getElementById("contadorError");
  const btn = document.getElementById("btnReenviarDesdeError");
  const ya = document.getElementById("yaVerificadoError");

  let tiempo = 30;

  btn.disabled = true;
  btn.style.opacity = "0.5";

  contador.textContent = `Reenviar enlace en ${tiempo}s`;
  ya.style.display = "none";

  if (intervaloReenvio) clearInterval(intervaloReenvio);

  intervaloReenvio = setInterval(() => {
    tiempo--;
    contador.textContent = `Reenviar enlace en ${tiempo}s`;

    if (tiempo <= 0) {
      clearInterval(intervaloReenvio);
      contador.textContent = "Puedes reenviar el enlace";
      btn.disabled = false;
      btn.style.opacity = "1";

      ya.style.display = "block";
    }
  }, 1000);
}



const btnReenviarDesdeError = document.getElementById("btnReenviarDesdeError");
if (btnReenviarDesdeError) {
  btnReenviarDesdeError.addEventListener("click", async () => {

    const correo = document.getElementById("correoLogin").value.trim();

    if (!correo) {
      mostrarMensajeError("Ingresa tu correo arriba para reenviar.");
      return;
    }

    mostrarLoader();

    try {
      const res = await fetch(`${API_URL}/reenviar-verificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo })
      });

      const data = await res.json();
      ocultarLoader();

      if (res.ok) {
        mostrarMensajeError("Correo reenviado ✔️");
        iniciarContadorVerificacionError();
      } else {
        mostrarMensajeError(data.mensaje || "No se pudo reenviar.");
      }

    } catch {
      ocultarLoader();
      mostrarMensajeError("Error en el servidor ❌");
    }
  });
}




// Función para validar la contraseña
const validarContraseña = (contraseña) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]:;"'<>,.?/\\|]).{8,}$/;
  return regex.test(contraseña);
};

// Función para validar el nombre
const validarNombre = (nombre) => {
  // Permite letras A-Z, a-z, espacios y Ñ/ñ; bloquea acentos, guiones y demás caracteres especiales
  if (/[^a-zA-ZñÑ\s]/.test(nombre)) {
    return { valido: false, mensaje: "El nombre no puede contener acentos, guiones ni caracteres especiales." };
  }

  // Separa el nombre en partes y valida que tenga al menos nombre y apellido
  const nombreSplit = nombre.trim().split(/\s+/);
  if (nombreSplit.length < 2) {
    return { valido: false, mensaje: "El nombre debe contener al menos un nombre y un apellido." };
  }

  return { valido: true };
};

// Registro
const formRegistro = document.getElementById("formRegistro");
if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contraseña = document.getElementById("contraseña").value.trim();

    // Validar nombre
    const resultadoNombre = validarNombre(nombre);
    if (!resultadoNombre.valido) {
      mostrarMensajeError(resultadoNombre.mensaje);
      return;
    }

    // Validar contraseña
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
  const mensajeVerificacion = document.getElementById("mensajeVerificacion");
  const contadorReenviar = document.getElementById("contadorReenviar");
  const btnReenviar = document.getElementById("btnReenviar");
  const textoYaVerificado = document.getElementById("textoYaVerificado");

  mensajeVerificacion.style.display = "block";

  // Mostrar "¿Ya verificaste tu correo?" a los 10s
  setTimeout(() => {
    textoYaVerificado.style.display = "block";
  }, 10000);

  // 👉 SOLO UNA VEZ
  iniciarContadorReenvio();
}

 else {
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

  if (data.mensaje === "Cuenta no verificada") {

  // 🟢 Mostrar el bloque de verificación
  mostrarMensajeError("Cuenta no verificada", true);

  // 🟢 Enviar automáticamente el correo de verificación
  reenviarCorreoAutomatico(correo);

} else {
  mostrarMensajeError(data.mensaje || "Correo o contraseña incorrectos ❌");
}


}

    } catch (err) {
      ocultarLoader();
      mostrarMensajeError("Error en el servidor ❌");
    }
  });
}




async function reenviarCorreoAutomatico(correo) {
  try {
    const res = await fetch(`${API_URL}/reenviar-verificacion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo })
    });

    const data = await res.json();

    if (res.ok) {
      console.log("📨 Correo de verificación enviado automáticamente");
      iniciarContadorVerificacionError(); // reinicia el contador
    } else {
      console.warn("No se pudo reenviar automáticamente:", data.mensaje);
    }

  } catch {
    console.warn("Error reenviando correo automáticamente");
  }
}





// Botón para reenviar verificación desde login
const btnVerificarDesdeLogin = document.getElementById("btnVerificarDesdeLogin");
if (btnVerificarDesdeLogin) {
  btnVerificarDesdeLogin.addEventListener("click", async () => {

    const correo = document.getElementById("correoLogin").value.trim();

    if (!correo) {
      mostrarMensajeError("Ingresa tu correo arriba para reenviar la verificación.");
      return;
    }

    mostrarLoader();

    try {
      const res = await fetch(`${API_URL}/reenviar-verificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo })
      });

      const data = await res.json();
      ocultarLoader();

      if (res.ok) {
        mostrarMensajeError("Correo de verificación enviado ✔️");
      } else {
        mostrarMensajeError(data.mensaje || "No se pudo enviar.");
      }

    } catch (err) {
      ocultarLoader();
      mostrarMensajeError("Error en el servidor ❌");
    }
  });
}




function iniciarContadorLogin() {
  const contador = document.getElementById("contadorReenviarLogin");
  const btn = document.getElementById("btnReenviarLogin");

  let tiempo = 30;

  btn.disabled = true;
  btn.style.opacity = "0.5";

  contador.textContent = `Reenviar enlace en ${tiempo}s`;

  if (intervaloReenvio) clearInterval(intervaloReenvio);

  intervaloReenvio = setInterval(() => {
    tiempo--;
    contador.textContent = `Reenviar enlace en ${tiempo}s`;

    if (tiempo <= 0) {
      clearInterval(intervaloReenvio);
      contador.textContent = "Puedes reenviar el enlace";
      btn.disabled = false;
      btn.style.opacity = "1";
    }
  }, 1000);
}


const btnReenviarLogin = document.getElementById("btnReenviarLogin");
if (btnReenviarLogin) {
  btnReenviarLogin.addEventListener("click", async () => {
    
    const correo = document.getElementById("correoLogin").value.trim();

    if (!correo) {
      mostrarMensajeError("Ingresa tu correo arriba.");
      return;
    }

    mostrarLoader();

    try {
      const res = await fetch(`${API_URL}/reenviar-verificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo })
      });

      const data = await res.json();
      ocultarLoader();

      if (res.ok) {
        iniciarContadorLogin();
      }

      mostrarMensajeError(data.mensaje || "Intentando reenviar...");

    } catch {
      ocultarLoader();
      mostrarMensajeError("Error en el servidor");
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














// Reenviar correo de verificación
// Reenviar correo de verificación
const btnReenviar = document.getElementById("btnReenviar");
if (btnReenviar) {
  btnReenviar.addEventListener("click", async () => {
    
    // 🔥 BLOQUEO INMEDIATO (evita cualquier doble click)
    btnReenviar.disabled = true;
    btnReenviar.style.opacity = "0.5";

    const correo = document.getElementById("correo").value.trim();

    if (!correo) {
      mostrarMensajeError("Primero ingresa un correo válido.");
      
      // 🔁 Rehabilitar si falla por correo vacío
      btnReenviar.disabled = false;
      btnReenviar.style.opacity = "1";

      return;
    }

    mostrarLoader();

    try {
      const res = await fetch(`${API_URL}/reenviar-verificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo })
      });

      const data = await res.json();
      ocultarLoader();

      if (res.ok) {
        mostrarMensajeError("Correo reenviado ✔️");
        iniciarContadorReenvio(); // 🔥 Reinicia los 30 segundos
      } else {
        mostrarMensajeError(data.mensaje || "No se pudo reenviar.");

        // 🔁 Rehabilitar si hubo error
        btnReenviar.disabled = false;
        btnReenviar.style.opacity = "1";
      }
    } catch (err) {
      ocultarLoader();
      mostrarMensajeError("Error en el servidor ❌");

      // 🔁 Rehabilitar si hay error
      btnReenviar.disabled = false;
      btnReenviar.style.opacity = "1";
    }
  });
}

