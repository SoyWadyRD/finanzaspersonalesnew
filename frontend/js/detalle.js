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

  const editarBtn = document.getElementById("editarBtn");
  const cancelarBtn = document.getElementById("cancelarEdicionBtn");
  const eliminarBtn = document.getElementById("eliminarBtn");

  const mensajeError = document.getElementById("mensajeError");
  const mensajeExito = document.getElementById("mensajeExito");
  const confirmacionEliminacion = document.getElementById("confirmacionEliminacion");

  let editando = false;
  let movimiento = {};

  // ===================== CARGAR DATOS =====================
  try {
    const res = await fetch(`/api/finanzas/movimiento/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    movimiento = await res.json();

    montoEl.textContent = movimiento.monto;
    fechaEl.textContent = new Date(movimiento.fecha).toLocaleString();
    categoriaEl.textContent = movimiento.categoria || "-";
    descripcionEl.textContent = movimiento.descripcion || "-";
    tipoEl.textContent = movimiento.tipo ? "Ingreso" : "Gasto";
  } catch (err) {
    mostrarError("Error al cargar la transacción");
  }

  // ===================== BOTÓN EDITAR/GUARDAR =====================
  editarBtn.addEventListener("click", async () => {
  if (!editando) {
    convertirAEditable();
    editarBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
    cancelarBtn.style.display = "block";
    editando = true;
  } else {
    // Validar campos obligatorios
    const inputMonto = document.getElementById("inputMonto").value.trim();
    const inputFecha = document.getElementById("inputFecha").value.trim();
    const inputTipo = document.getElementById("inputTipo").value;
    const categoriaSelect = document.getElementById("categoriaSelect");
    const categoriaOtro = document.getElementById("categoriaOtro");
    let nuevaCategoria = categoriaSelect.value === "Otro" ? categoriaOtro.value.trim() : categoriaSelect.value;

    if (!inputMonto || !inputFecha || !inputTipo || !nuevaCategoria) {
      return mostrarError("Todos los campos son obligatorios");
    }

    await guardarCambios();

    // Mostrar mensaje y esperar 2s antes de recargar
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
});


  // ===================== BOTÓN CANCELAR =====================
  cancelarBtn.addEventListener("click", () => {
    window.location.reload();
  });

  // ===================== FUNCIONES =====================
  function convertirAEditable() {
    montoEl.innerHTML = `<input type="number" id="inputMonto" value="${movimiento.monto}" required>`;
    descripcionEl.innerHTML = `<input type="text" id="inputDescripcion" value="${movimiento.descripcion || ""}">`;

    tipoEl.innerHTML = `
      <select id="inputTipo">
        <option value="gasto" ${!movimiento.tipo ? "selected" : ""}>Gasto</option>
        <option value="ingreso" ${movimiento.tipo ? "selected" : ""}>Ingreso</option>
      </select>
    `;

    const fechaISO = new Date(movimiento.fecha).toISOString().slice(0, 16);
    fechaEl.innerHTML = `<input type="datetime-local" id="inputFecha" value="${fechaISO}">`;

    categoriaEl.innerHTML = `
      <select id="categoriaSelect" required></select>
      <input type="text" id="categoriaOtro" placeholder="Escribe categoría" style="display:none;margin-top:5px;">
    `;

    const categoriaSelect = document.getElementById("categoriaSelect");
    const categoriaOtro = document.getElementById("categoriaOtro");
    const tipoMovimiento = document.getElementById("inputTipo");

    actualizarCategorias(tipoMovimiento.value, categoriaSelect, categoriaOtro);
    categoriaSelect.value = movimiento.categoria || "";

    if (movimiento.categoria === "Otro") {
      categoriaOtro.style.display = "block";
      categoriaOtro.value = movimiento.categoria;
    }

    tipoMovimiento.addEventListener("change", () => {
      actualizarCategorias(tipoMovimiento.value, categoriaSelect, categoriaOtro);
    });

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

  async function guardarCambios() {
    const nuevoMonto = document.getElementById("inputMonto").value;
    const nuevaDescripcion = document.getElementById("inputDescripcion").value;
    const nuevaFecha = document.getElementById("inputFecha").value;
    const nuevoTipo = document.getElementById("inputTipo").value;
    const categoriaSelect = document.getElementById("categoriaSelect");
    const categoriaOtro = document.getElementById("categoriaOtro");

    let nuevaCategoria = categoriaSelect.value === "Otro" ? categoriaOtro.value.trim() : categoriaSelect.value;

    try {
      const res = await fetch(`/api/finanzas/movimiento/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          monto: nuevoMonto,
          categoria: nuevaCategoria,
          descripcion: nuevaDescripcion,
          fecha: nuevaFecha,
          tipo: nuevoTipo
        })
      });

      const data = await res.json();
      if (!res.ok) return mostrarError(data.mensaje || "Error al actualizar");

      mostrarExito("Cambios guardados correctamente");
    } catch {
      mostrarError("Error de conexión al guardar");
    }
  }

  function actualizarCategorias(tipo, categoriaSelect, categoriaOtro) {
    if (tipo === "ingreso") {
      categoriaSelect.innerHTML = `
        <option value="">Selecciona categoría</option>
        <option value="Trabajo">Trabajo</option>
        <option value="Emprendimiento">Emprendimiento</option>
        <option value="Regalo">Regalo</option>
        <option value="Otro">Otro</option>
      `;
    } else {
      categoriaSelect.innerHTML = `
        <option value="">Selecciona categoría</option>
        <option value="Comida">Comida</option>
        <option value="Deporte">Deporte</option>
        <option value="Entretenimiento">Entretenimiento</option>
        <option value="Gasolina">Gasolina</option>
        <option value="Ropa">Ropa</option>
        <option value="Salud">Salud</option>
        <option value="Tecnología">Tecnología</option>
        <option value="Transporte">Transporte</option>
        <option value="Otro">Otro</option>
      `;
    }

    categoriaOtro.style.display = "none";
    categoriaOtro.value = "";
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
});
