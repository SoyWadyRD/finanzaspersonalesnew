document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem("token");
  if (!token) window.location.href = "login.html";

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const montoEl = document.getElementById("monto");
  const fechaEl = document.getElementById("fecha");
  const categoriaEl = document.getElementById("categoria");
  const descripcionEl = document.getElementById("descripcion");
  const tipoEl = document.getElementById("tipo"); // Elemento para mostrar el tipo
  const eliminarBtn = document.getElementById("eliminarBtn");






 fetch(`/api/finanzas/movimiento/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
})
.then(res => res.json())
.then(m => {
  montoEl.textContent = m.monto;
  fechaEl.textContent = new Date(m.fecha).toLocaleString();
  categoriaEl.textContent = m.categoria || "-";
  descripcionEl.textContent = m.descripcion || "-";

  // Aquí, verifica si el campo tipo existe para determinar si es un gasto o un ingreso
  const tipoTransaccion = m.tipo ? "Ingreso" : "Gasto"; 
  document.getElementById("tipo").textContent = tipoTransaccion; // Mostrar el tipo de transacción
})
.catch(err => alert("Error al cargar la transacción"));

  // Obtener los elementos del DOM
  const confirmacionEliminacion = document.getElementById("confirmacionEliminacion");
  const confirmarEliminarBtn = document.getElementById("confirmarEliminarBtn");
  const cancelarEliminarBtn = document.getElementById("cancelarEliminarBtn");



  // Mostrar el div de confirmación al hacer clic en "Eliminar"
  eliminarBtn.addEventListener("click", () => {

    confirmacionEliminacion.style.display = "block"; // Mostrar el div
  });

  // Evento para "Aceptar" la eliminación
  confirmarEliminarBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(`/api/finanzas/movimiento/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        mostrarMensajeError(data.mensaje || "Error al eliminar");
      } else {
        mostrarMensajeExito("Movimiento eliminado correctamente");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 2000);
      }
    } catch (err) {
      mostrarMensajeError("Error en la conexión");
    } finally {
      confirmacionEliminacion.style.display = "none"; // Ocultar el div
    }
  });

  // Evento para "Cancelar" la eliminación
  cancelarEliminarBtn.addEventListener("click", () => {
    confirmacionEliminacion.style.display = "none"; // Ocultar el div sin hacer nada
  });

  // Función para mostrar mensajes de error
  const mostrarMensajeError = (mensaje) => {
    const mensajeError = document.getElementById("mensajeError");
    if (mensajeError) {
      mensajeError.querySelector("p").textContent = mensaje;
      mensajeError.style.display = "block";
      setTimeout(() => {
        mensajeError.style.display = "none";
      }, 2000);
    }
  };

  // Función para mostrar mensajes de éxito
  const mostrarMensajeExito = (mensaje) => {
    const mensajeExito = document.getElementById("mensajeExito");
    if (mensajeExito) {
      mensajeExito.textContent = mensaje;
      mensajeExito.style.display = "block";
      setTimeout(() => {
        mensajeExito.style.display = "none";
      }, 2000);
    }
  };
});
