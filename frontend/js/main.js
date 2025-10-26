// Botón del menú hamburguesa y el menú lateral
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

// Abre/cierra el menú cuando se hace clic en el botón
menuBtn.addEventListener("click", () => {
  menu.classList.toggle("active");
  menuBtn.classList.toggle("active");
});


// Cerrar el menú cuando se haga clic fuera de él
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
    menu.classList.remove("active");
    menuBtn.classList.remove("active");
  }
});

// Botón de cerrar sesión
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});




















// Elementos
const btnFiltro = document.getElementById("btnFiltro");
const modalFiltro = document.getElementById("modalFiltro");
const cerrarModal = document.getElementById("cerrarModal");
const aplicarFiltro = document.getElementById("aplicarFiltro");
const limpiarFiltro = document.getElementById("limpiarFiltro");
const resumenFiltros = document.getElementById("resumenFiltros");
const filtroCategoria = document.getElementById("filtroCategoria");

// Mostrar modal
btnFiltro.addEventListener("click", () => {
  modalFiltro.style.display = "block";
  modalFiltro.querySelector(".modal-content").style.animation = "fadeInZoom 0.3s forwards";

  // Cargar categorías únicas de los movimientos
  const categorias = new Set();
  const movimientos = listaMovimientos.querySelectorAll("li");
  movimientos.forEach(li => {
    const cat = li.querySelector(".categoria").textContent.replace("Categoría: ", "");
    if(cat) categorias.add(cat);
  });

  // Limpiar y agregar opciones al select
  filtroCategoria.innerHTML = '<option value="">Todas</option>';
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filtroCategoria.appendChild(option);
  });
});

// Cerrar modal
cerrarModal.addEventListener("click", () => {
  const content = modalFiltro.querySelector(".modal-content");
  content.style.animation = "fadeOutZoom 0.3s forwards";
  setTimeout(() => { modalFiltro.style.display = "none"; }, 300);
});

// Mostrar/ocultar fechas
const filtroFecha = document.getElementById("filtroFecha");
const fechaInicio = document.getElementById("fechaInicio");
const fechaFin = document.getElementById("fechaFin");

filtroFecha.addEventListener("change", () => {
  if(filtroFecha.value === "personalizado"){
    fechaInicio.style.display = "block";
    fechaFin.style.display = "block";
  } else {
    fechaInicio.style.display = "none";
    fechaFin.style.display = "none";
  }
});

// Función para aplicar filtros
aplicarFiltro.addEventListener("click", () => {
  const tipo = document.getElementById("filtroTipo").value;
  const categoria = document.getElementById("filtroCategoria").value;
  const fecha = filtroFecha.value;
  const inicio = fechaInicio.value;
  const fin = fechaFin.value;
  const montoMin = document.getElementById("montoMin").value;
  const montoMax = document.getElementById("montoMax").value;
  const descripcion = document.getElementById("filtroDescripcion").value.toLowerCase();

  // Obtener todos los <li> de movimientos
  const movimientos = listaMovimientos.querySelectorAll("li");

  movimientos.forEach(li => {
    const liTipo = li.classList.contains("gasto") ? "gasto" : "ingreso";
    const liCategoria = li.querySelector(".categoria").textContent.replace("Categoría: ", "");
    const liDescripcion = li.querySelector(".descripcion").textContent.replace("Descripción: ", "").toLowerCase();
    const liMonto = parseFloat(li.querySelector(".monto").textContent.replace("$", ""));
    const liFStr = li.dataset.fecha; // 'yyyy-mm-dd'
    const hoyStr = new Date().toISOString().split('T')[0];

    let mostrar = true;

    if (tipo && liTipo !== tipo) mostrar = false;
    if (categoria && liCategoria !== categoria) mostrar = false;
    if (descripcion && !liDescripcion.includes(descripcion)) mostrar = false;
    if (montoMin && liMonto < parseFloat(montoMin)) mostrar = false;
    if (montoMax && liMonto > parseFloat(montoMax)) mostrar = false;

    // Filtrar por fecha
    if (fecha === "hoy") {
      mostrar = mostrar && liFStr === hoyStr;
    } else if (fecha === "7dias") {
      const hoy = new Date();
      const hace7 = new Date();
      hace7.setDate(hoy.getDate() - 6);
      const liDate = new Date(liFStr);
      mostrar = mostrar && liDate >= new Date(hace7.toISOString().split('T')[0]) && liDate <= new Date(hoyStr);
    } else if (fecha === "mes") {
      const hoy = new Date();
      const liDate = new Date(liFStr);
      mostrar = mostrar &&
        liDate.getFullYear() === hoy.getFullYear() &&
        liDate.getMonth() === hoy.getMonth();
    } else if (fecha === "personalizado" && inicio && fin) {
      const liDate = new Date(liFStr);
      mostrar = mostrar && liDate >= new Date(inicio) && liDate <= new Date(fin);
    }

    li.style.display = mostrar ? "block" : "none";
  });





// Contar cuántos movimientos se están mostrando
const movimientosVisibles = Array.from(movimientos).filter(li => li.style.display === "block");
const totalMostrados = movimientosVisibles.length;

// Construir resumen
let resumenText = `Mostrando ${totalMostrados} movimiento${totalMostrados !== 1 ? "s" : ""}`;

// Añadir tipo de movimiento si se seleccionó
if (tipo) resumenText += ` ${tipo}${totalMostrados !== 1 ? "s" : ""}`;

// Añadir categoría si se seleccionó
if (categoria) resumenText += ` de ${categoria}`;

// Añadir rango de monto si se especificó
if (montoMin || montoMax) resumenText += ` entre $${montoMin || 0} y $${montoMax || "∞"}`;

// Añadir fecha de forma amigable
if (fecha) {
  if (fecha === "hoy") resumenText += " hoy";
  else if (fecha === "7dias") resumenText += " últimos 7 días";
  else if (fecha === "mes") resumenText += " este mes";
  else if (fecha === "personalizado" && inicio && fin) resumenText += ` del ${inicio} al ${fin}`;
}

// Añadir descripción si se filtró
if (descripcion) resumenText += ` con descripción que contiene '${descripcion}'`;

resumenFiltros.textContent = resumenText;


  // Cerrar modal
  cerrarModal.click();
});


// Limpiar filtros
limpiarFiltro.addEventListener("click", () => {
  const movimientos = listaMovimientos.querySelectorAll("li");
  movimientos.forEach(li => li.style.display = "block");
  resumenFiltros.textContent = "";
  // Reset inputs
  document.getElementById("filtroTipo").value = "";
  document.getElementById("filtroCategoria").value = "";
  document.getElementById("filtroFecha").value = "";
  fechaInicio.style.display = "none";
  fechaFin.style.display = "none";
  fechaInicio.value = "";
  fechaFin.value = "";
  document.getElementById("montoMin").value = "";
  document.getElementById("montoMax").value = "";
  document.getElementById("filtroDescripcion").value = "";

  // Cerrar modal
  cerrarModal.click();
});

