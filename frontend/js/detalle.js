document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem("token");
  if (!token) return window.location.href = "login.html";

  // === Fechas globales ===
  const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const montoEl = document.getElementById("monto");
  const fechaEl = document.getElementById("fecha");
  const fechaLargaEl = document.getElementById("fechaLarga");
  const categoriaEl = document.getElementById("categoria");
  const descripcionEl = document.getElementById("descripcion");
  const tipoEl = document.getElementById("tipo");

  const eliminarBtn = document.getElementById("eliminarBtn");
  const confirmacionEliminacion = document.getElementById("confirmacionEliminacion");
  const mensajeError = document.getElementById("mensajeError");
  const mensajeExito = document.getElementById("mensajeExito");

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

      const data = await res.json().catch(() => ({}));
      

      if (!res.ok) return mostrarError(data.mensaje || "Error al eliminar");

      mostrarExito("Movimiento eliminado");
      setTimeout(() => (window.location.href = "dashboard.html"), 2000);
    } catch (error) {
      console.error("Error al eliminar:", error);
      mostrarError("Error de conexión");
    }
    confirmacionEliminacion.style.display = "none";
  });





  
let editando = false;
let movimiento = {};

try {
  const res = await fetch(`/api/finanzas/movimiento/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  movimiento = await res.json();

  montoEl.textContent = movimiento.monto;
  const d = new Date(movimiento.fecha);
const fechaFija = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
fechaEl.textContent = fechaFija;



const fechaLarga = `${diasSemana[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} del ${d.getFullYear()}`;
document.getElementById("fechaLarga").textContent = fechaLarga;


  categoriaEl.textContent = movimiento.categoria || "-";
  descripcionEl.textContent = movimiento.descripcion || "-";
  tipoEl.textContent = movimiento.tipo && movimiento.tipo !== "gasto" ? "Ingreso" : "Gasto";

} catch (err) {
  console.error("Error al cargar los datos:", err);
  mostrarError("Error al cargar la transacción");
}

const editarBtn = document.getElementById("editarBtn");
const cancelarBtn = document.getElementById("cancelarEdicionBtn");

// ===================== BOTÓN EDITAR/GUARDAR =====================
editarBtn.addEventListener("click", async () => {
  if (!editando) {
    convertirAEditable();
    fechaLargaEl.style.display = "none";
    editarBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
    cancelarBtn.style.display = "block";
    editando = true;
  } else {
    const inputMonto = document.getElementById("inputMonto").value.trim();
    const inputFecha = document.getElementById("inputFecha").value.trim();
    const categoriaSelect = document.getElementById("categoriaSelect");
    const categoriaOtro = document.getElementById("categoriaOtro");
    const nuevaCategoria = categoriaSelect.value === "Otro" ? categoriaOtro.value.trim() : categoriaSelect.value;
    const nuevaDescripcion = document.getElementById("inputDescripcion").value.trim();

    if (!inputMonto || !inputFecha || !nuevaCategoria) {
      return mostrarError("Todos los campos son obligatorios");
    }

    await guardarCambios(inputMonto, inputFecha, nuevaCategoria, nuevaDescripcion);
  }
});

cancelarBtn.addEventListener("click", () => {
  window.location.reload(); // Cancelar edición
});

// ===================== FUNCIONES =====================
/// --- helper: convierte una fecha UTC a formato local para datetime-local ---
function toLocalDateTimeString(dateInput) {
  const date = new Date(dateInput);

  // Formato correcto sin alterar zona horaria
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


// --- helper: convierte de formato local (datetime-local) a UTC para guardar ---


function convertirAEditable() {
  montoEl.innerHTML = `<input type="number" id="inputMonto" value="${movimiento.monto}" required>`;
  descripcionEl.innerHTML = `<input type="text" id="inputDescripcion" value="${movimiento.descripcion || ""}">`;

  tipoEl.textContent = movimiento.tipo && movimiento.tipo !== "gasto" ? "Ingreso" : "Gasto";


  // Usamos la fecha convertida a hora local visible correctamente
  const fechaLocal = toLocalDateTimeString(movimiento.fecha);
  fechaEl.innerHTML = `<input type="datetime-local" id="inputFecha" value="${fechaLocal}" required>`;

  categoriaEl.innerHTML = `
    <select id="categoriaSelect" required></select>
    <input type="text" id="categoriaOtro" placeholder="Escribe categoría" style="display:none;margin-top:5px;">
  `;

  const categoriaSelect = document.getElementById("categoriaSelect");
  const categoriaOtro = document.getElementById("categoriaOtro");
  actualizarCategorias(movimiento.tipo, categoriaSelect, categoriaOtro, movimiento.categoria);

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

async function guardarCambios(monto, fechaInputLocal, categoria, descripcion) {
  try {


    // Ajusta para que Node la entienda igual en producción
   // Añadir zona horaria local a la fecha del input
function agregarZonaHoraria(fechaLocal) {
  const tzOffset = -new Date().getTimezoneOffset(); // en minutos
  const sign = tzOffset >= 0 ? "+" : "-";
  const horas = String(Math.abs(Math.floor(tzOffset / 60))).padStart(2, "0");
  const minutos = String(Math.abs(tzOffset % 60)).padStart(2, "0");
  return `${fechaLocal}${sign}${horas}:${minutos}`;
}



const datosActualizados = {
  monto,
  categoria,
  descripcion,
  fecha: agregarZonaHoraria(fechaInputLocal)
};

    const res = await fetch(`/api/finanzas/movimiento/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(datosActualizados)
    });


    const data = await res.json().catch(() => ({}));
    if (!res.ok) return mostrarError(data.mensaje || "Error al actualizar");

    const actualizado = data.movimiento || data || {};
    movimiento.monto = actualizado.monto ?? monto;
    movimiento.categoria = actualizado.categoria ?? categoria;
    movimiento.descripcion = actualizado.descripcion ?? descripcion;
    movimiento.fecha = actualizado.fecha ?? fechaInputLocal;

    // ✅ Mostrar en hora local real
    montoEl.textContent = movimiento.monto;
    descripcionEl.textContent = movimiento.descripcion || "-";
    const d2 = new Date(movimiento.fecha);
const fechaFija2 = `${String(d2.getDate()).padStart(2,'0')}/${String(d2.getMonth()+1).padStart(2,'0')}/${d2.getFullYear()} ${String(d2.getHours()).padStart(2,'0')}:${String(d2.getMinutes()).padStart(2,'0')}`;
fechaEl.textContent = fechaFija2;

const d3 = new Date(movimiento.fecha);
const fechaLarga2 = `${diasSemana[d3.getDay()]} ${d3.getDate()} de ${meses[d3.getMonth()]} del ${d3.getFullYear()}`;
document.getElementById("fechaLarga").textContent = fechaLarga2;


    categoriaEl.textContent = movimiento.categoria || "-";
    tipoEl.textContent = movimiento.tipo && movimiento.tipo !== "gasto" ? "Ingreso" : "Gasto";

    fechaLargaEl.style.display = "block";

    editarBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
    cancelarBtn.style.display = "none";
    editando = false;

    mostrarExito("Cambios guardados correctamente");
  } catch (err) {
    console.error("Error al guardar:", err);
    mostrarError("Error de conexión al guardar");
  }
}




function actualizarCategorias(tipo, categoriaSelect, categoriaOtro, categoriaActual = "") {
  const opciones = tipo && tipo !== "gasto"
    ? ["Trabajo", "Emprendimiento", "Regalo", "Otro"] // 👉 Ingresos
    : ["Comida", "Bebida", "Deporte", "Entretenimiento", "Gasolina", "Servicios","Agua", "Luz", "Alquiler","Internet", "Ropa", "Salud", "Tecnología", "Transporte", "Otro"]; // 👉 Gastos

  categoriaSelect.innerHTML = "";
  opciones.forEach(op => {
    const optionEl = document.createElement("option");
    optionEl.value = op;
    optionEl.textContent = op;
    categoriaSelect.appendChild(optionEl);
  });

  if (opciones.includes(categoriaActual)) {
    categoriaSelect.value = categoriaActual;
    categoriaOtro.style.display = "none";
  } else if (categoriaActual) {
    categoriaSelect.value = "Otro";
    categoriaOtro.style.display = "block";
    categoriaOtro.value = categoriaActual;
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


});






