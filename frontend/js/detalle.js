document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem("token");
  if (!token) return window.location.href = "login.html";

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const montoEl = document.getElementById("monto");
  const fechaEl = document.getElementById("fecha");
  const categoriaEl = document.getElementById("categoria");
  const descripcionEl = document.getElementById("descripcion");
  const tipoEl = document.getElementById("tipo");

  // const editarBtn = document.getElementById("editarBtn");
  const cancelarBtn = document.getElementById("cancelarEdicionBtn");
  const eliminarBtn = document.getElementById("eliminarBtn");

  const mensajeError = document.getElementById("mensajeError");
  const mensajeExito = document.getElementById("mensajeExito");
  const confirmacionEliminacion = document.getElementById("confirmacionEliminacion");

  let editando = false;
  let movimiento = {};

  // Cargar datos
  try {
    const res = await fetch(`/api/finanzas/movimiento/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    movimiento = await res.json();

    

    montoEl.textContent = movimiento.monto;
    fechaEl.textContent = new Date(movimiento.fecha).toLocaleString();
    categoriaEl.textContent = movimiento.categoria || "-";
    descripcionEl.textContent = movimiento.descripcion || "-";

    // Verificar si es Ingreso o Gasto
    if (movimiento.tipo === "ingreso") {
      tipoEl.textContent = "Ingreso";
    } else if (movimiento.tipo === "gasto") {
      tipoEl.textContent = "Gasto";
    } else {
      // Asumir tipo Gasto si no tiene tipo definido
      if (movimiento.categoria) {
        tipoEl.textContent = "Gasto";
      } else {
        tipoEl.textContent = "Desconocido"; // Si no tiene ni tipo ni categoría
      }
    }

  } catch (err) {
    console.error("Error al cargar los datos:", err);
    mostrarError("Error al cargar la transacción");
  }

  // ===================== BOTÓN EDITAR/GUARDAR =====================
  /* editarBtn.addEventListener("click", async () => {
    if (!editando) {
      convertirAEditable();
      editarBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
      cancelarBtn.style.display = "block";
      editando = true;
    } else {
      const inputMonto = document.getElementById("inputMonto").value.trim();
      const inputFecha = document.getElementById("inputFecha").value.trim();
      const inputTipo = document.getElementById("inputTipo").value;
      const categoriaSelect = document.getElementById("categoriaSelect");
      const categoriaOtro = document.getElementById("categoriaOtro");
      let nuevaCategoria = categoriaSelect.value === "Otro" ? categoriaOtro.value.trim() : categoriaSelect.value;

      console.log("Valores antes de guardar:");
      console.log("Monto:", inputMonto);
      console.log("Fecha:", inputFecha);
      console.log("Tipo:", inputTipo);
      console.log("Categoría:", nuevaCategoria);

      if (!inputMonto || !inputFecha || !inputTipo || !nuevaCategoria) {
        return mostrarError("Todos los campos son obligatorios");
      }

      // Llamar la función para guardar cambios sin recargar la página
      await guardarCambios(inputMonto, inputFecha, inputTipo, nuevaCategoria);
    }
  }); */

  // ===================== FUNCIONES =====================
  function convertirAEditable() {
    // Verifica si los elementos existen antes de manipularlos
    if (!montoEl || !fechaEl || !categoriaEl || !descripcionEl || !tipoEl) {
      console.error("Algunos elementos no están disponibles.");
      return;
    }

    // Convierte los campos en elementos editables
    montoEl.innerHTML = `<input type="number" id="inputMonto" value="${movimiento.monto}" required>`;
    descripcionEl.innerHTML = `<input type="text" id="inputDescripcion" value="${movimiento.descripcion || ""}">`;

    // Crear el campo de tipo de transacción editable (Ingreso o Gasto)
    tipoEl.innerHTML = `
      <select id="inputTipo">
        <option value="gasto" ${movimiento.tipo === "gasto" ? "selected" : ""}>Gasto</option>
        <option value="ingreso" ${movimiento.tipo === "ingreso" ? "selected" : ""}>Ingreso</option>
      </select>
    `;

    // Convertir la fecha a formato datetime-local
    const fechaISO = new Date(movimiento.fecha).toISOString().slice(0, 16);
    fechaEl.innerHTML = `<input type="datetime-local" id="inputFecha" value="${fechaISO}">`;

    // Crear el campo de categoría editable
    categoriaEl.innerHTML = `
      <select id="categoriaSelect" required></select>
      <input type="text" id="categoriaOtro" placeholder="Escribe categoría" style="display:none;margin-top:5px;">
    `;

    const categoriaSelect = document.getElementById("categoriaSelect");
    const categoriaOtro = document.getElementById("categoriaOtro");
    const tipoMovimiento = document.getElementById("inputTipo");

    // Actualizar las categorías según el tipo de movimiento
    actualizarCategorias(tipoMovimiento.value, categoriaSelect, categoriaOtro, movimiento.categoria);

    // Controlar el cambio de tipo de movimiento (Ingreso o Gasto)
    tipoMovimiento.addEventListener("change", () => {
      actualizarCategorias(tipoMovimiento.value, categoriaSelect, categoriaOtro, categoriaSelect.value);
    });

    // Controlar el cambio en la categoría seleccionada (mostrar el campo 'Otro' si es necesario)
    categoriaSelect.addEventListener("change", () => {
      if (categoriaSelect.value === "Otro") {
        categoriaOtro.style.display = "block";
        categoriaOtro.focus();
      } else {
        categoriaOtro.style.display = "none";
        categoriaOtro.value = "";
      }
    });
  }

  async function guardarCambios(inputMonto, inputFecha, inputTipo, nuevaCategoria) {
    const nuevaDescripcion = document.getElementById("inputDescripcion").value;
    const nuevaFecha = inputFecha;

    // Validar que la categoría corresponde con el tipo
    if (inputTipo === "ingreso" && !["Trabajo", "Emprendimiento", "Regalo", "Otro"].includes(nuevaCategoria)) {
      return mostrarError("Categoría inválida para ingreso");
    }
    if (inputTipo === "gasto" && !["Comida", "Deporte", "Entretenimiento", "Gasolina", "Ropa", "Salud", "Tecnología", "Transporte", "Otro"].includes(nuevaCategoria)) {
      return mostrarError("Categoría inválida para gasto");
    }

    console.log("Datos a guardar:", {
      inputMonto,
      nuevaDescripcion,
      nuevaFecha,
      inputTipo,
      nuevaCategoria
    });

    try {
      const res = await fetch(`/api/finanzas/movimiento/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          monto: inputMonto,
          categoria: nuevaCategoria,
          descripcion: nuevaDescripcion,
          fecha: nuevaFecha,
          tipo: inputTipo  // Enviar tipo como string (ingreso o gasto)
        })
      });

      const data = await res.json();

      // Log de la respuesta del servidor
      console.log("Respuesta del servidor:", data);

      if (!res.ok) return mostrarError(data.mensaje || "Error al actualizar");

      // Actualizar localmente el objeto movimiento
      movimiento.monto = inputMonto;
      movimiento.descripcion = nuevaDescripcion;
      movimiento.fecha = nuevaFecha;
      movimiento.tipo = inputTipo;
      movimiento.categoria = nuevaCategoria;

      // Actualizar la vista de la transacción sin recargar la página
      montoEl.textContent = movimiento.monto;
      descripcionEl.textContent = movimiento.descripcion || "-";
      fechaEl.textContent = new Date(movimiento.fecha).toLocaleString();
      categoriaEl.textContent = movimiento.categoria || "-";
      tipoEl.textContent = movimiento.tipo === "ingreso" ? "Ingreso" : "Gasto";

      mostrarExito("Cambios guardados correctamente");
    } catch (err) {
      console.log("Error al guardar:", err);
      mostrarError("Error de conexión al guardar");
    }
  }

  function mostrarError(msg) {
    mensajeError.querySelector("p").textContent = msg;
    mensajeError.style.display = "block";
    setTimeout(() => (mensajeError.style.display = "none"), 3000);
  }

  function mostrarExito(msg) {
    mensajeExito.textContent = msg;
    mensajeExito.style.display = "block";
    setTimeout(() => (mensajeExito.style.display = "none"), 3000);
  }

  function actualizarCategorias(tipo, categoriaSelect, categoriaOtro, categoriaActual = "") {
    const opciones = tipo === "ingreso"
      ? ["Trabajo", "Emprendimiento", "Regalo", "Otro"]
      : ["Comida", "Deporte", "Entretenimiento", "Gasolina", "Ropa", "Salud", "Tecnología", "Transporte", "Otro"];

    // Limpiar select
    categoriaSelect.innerHTML = "";

    // Crear las opciones
    opciones.forEach(op => {
      const optionEl = document.createElement("option");
      optionEl.value = op;
      optionEl.textContent = op;
      categoriaSelect.appendChild(optionEl);
    });

    // Si la categoría actual está en opciones → selecciona
    if (opciones.includes(categoriaActual)) {
      categoriaSelect.value = categoriaActual;
      categoriaOtro.style.display = "none";
      categoriaOtro.value = "";
    } else if (categoriaActual) {
      // Si no está → selecciona "Otro" y llena input
      categoriaSelect.value = "Otro";
      categoriaOtro.style.display = "block";
      categoriaOtro.value = categoriaActual;
    } else {
      // Sin categoría
      categoriaSelect.value = "";
      categoriaOtro.style.display = "none";
      categoriaOtro.value = "";
    }
  }
});









  function mostrarError(msg) {
    mensajeError.querySelector("p").textContent = msg;
    mensajeError.style.display = "block";
    setTimeout(() => (mensajeError.style.display = "none"), 3000);
  }

  function mostrarExito(msg) {
    mensajeExito.textContent = msg;
    mensajeExito.style.display = "block";
    setTimeout(() => (mensajeExito.style.display = "none"), 3000);
  }

  // ===================== ELIMINAR =====================
  document.getElementById("cancelarEliminarBtn").addEventListener("click", () => {
    confirmacionEliminacion.style.display = "none";
  });

  eliminarBtn.addEventListener("click", () => {
    confirmacionEliminacion.style.display = "block";
  });

  document.getElementById("confirmarEliminarBtn").addEventListener("click", async () => {
    try {
      const res = await fetch(`/api/finanzas/movimiento/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return mostrarError("Error al eliminar");
      mostrarExito("Movimiento eliminado");
      setTimeout(() => (window.location.href = "dashboard.html"), 2000);
    } catch {
      mostrarError("Error de conexión");
    }
    confirmacionEliminacion.style.display = "none";
  });



