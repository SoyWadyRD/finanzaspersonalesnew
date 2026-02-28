
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

// Función para mostrar mensajes de éxito en el div
const mostrarMensajeExito = (mensaje) => {
  const mensajeExito = document.getElementById("mensajeExito");
  if (mensajeExito) {
    mensajeExito.textContent = mensaje;
    mensajeExito.style.display = "block";

    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
      mensajeExito.style.display = "none";
    }, 3000);
  }
};