    const formatearMonto = (num) => {
  return new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
};

const nombreUsuario = document.getElementById("nombreUsuario");
const totalIngresosEl = document.getElementById("totalIngresos");
const totalGastosEl = document.getElementById("totalGastos");
const balanceEl = document.getElementById("balance");
const listaMovimientos = document.getElementById("listaMovimientos");

let todosLosMovimientos = [];
let movimientosMostrados = 0;
const cantidadPorPagina = 10;


const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

// Mostrar nombre del usuario
fetch("/api/auth/perfil", {
  headers: { Authorization: `Bearer ${token}` }
})
.then(res => res.json())
.then(data => nombreUsuario.textContent = data.nombre);

// Obtener balance
const actualizarBalance = () => {
  fetch("/api/finanzas/balance", {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => {
balanceEl.textContent = formatearMonto(data.balance);
totalIngresosEl.textContent = formatearMonto(data.totalIngresos);
totalGastosEl.textContent = formatearMonto(data.totalGastos);

  });
};
actualizarBalance();





// Obtener y mostrar movimientos recientes
const mostrarMovimientos = () => {
  fetch("/api/finanzas/movimientos", {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => {
    todosLosMovimientos = data;
    movimientosMostrados = 0;
    listaMovimientos.innerHTML = "";

    mostrar10Movimientos(); // YA FUNCIONA
  })
  .catch(err => console.error("Error al cargar movimientos:", err));
};

mostrarMovimientos();  // <-- AHORA SÍ FUNCIONA


// === FUNCIÓN GLOBAL (ahora sí disponible para el botón) ===
function mostrar10Movimientos() {
  const fin = movimientosMostrados + cantidadPorPagina;
  const nuevos = todosLosMovimientos.slice(movimientosMostrados, fin);

  nuevos.forEach(m => {
    const li = document.createElement("li");
    li.classList.add(m.tipo);
    li.dataset.id = m._id;
    li.dataset.fecha = new Date(m.fecha).toISOString().split("T")[0];

    const tipoMovimiento = m.tipo.toUpperCase();
    const monto = `$${formatearMonto(m.monto)}`;
    const categoria = m.categoria || "Sin categoría";
    const descripcion = m.descripcion || "Sin descripción";
    const d = new Date(m.fecha);

    const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

    const fechaCorta = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    const hora = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    const fechaLarga = `${diasSemana[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} del ${d.getFullYear()}`;

    li.innerHTML = `
  <div class="movimiento-info">
    <span class="tipo-movimiento">${tipoMovimiento}</span>
    <span class="monto">${monto}</span>
  </div>
  <div class="detalle-movimiento">
    <span class="fecha">Fecha: ${fechaCorta}</span>
    <span class="hora" style="color: #6b6b6bff;">${hora}</span> <!-- Aquí va el span para la hora -->
    <span class="fecha-larga">${fechaLarga}</span>
    <span class="categoria">Categoría: ${categoria}</span>
    <span class="descripcion">Descripción: ${descripcion}</span>
  </div>
`;

    li.addEventListener("click", () => {
      window.location.href = `detalle.html?id=${m._id}`;
    });

    listaMovimientos.appendChild(li);
  });

  movimientosMostrados = fin;
  agregarBotonVerMas();
}


function agregarBotonVerMas() {
   // Eliminar si existe
   const btnExistente = document.getElementById("btnVerMas");
   if (btnExistente) btnExistente.remove();

   // Si ya no hay más movimientos o el filtro ha mostrado todos, no mostrar el botón
   if (movimientosMostrados >= todosLosMovimientos.length) return;

   // Crear botón
   const btn = document.createElement("button");
   btn.id = "btnVerMas";
   btn.textContent = "Ver más";

   // Estilos del botón
   btn.style.display = "block";
   btn.style.margin = "15px auto";
   btn.style.width = "90%";
   btn.style.padding = "12px";
   btn.style.background = "#00a35c";
   btn.style.color = "white";
   btn.style.border = "none";
   btn.style.borderRadius = "8px";
   btn.style.fontWeight = "bold";
   btn.style.cursor = "pointer";

   btn.onclick = () => {
     mostrar10Movimientos();
   };

   // Insertar justo debajo de la lista
   listaMovimientos.after(btn);
}





// Categoria select / Otro
const categoriaSelect = document.getElementById("categoriaSelect");
const categoriaOtro = document.getElementById("categoriaOtro");

categoriaSelect.addEventListener("change", () => {
  if (categoriaSelect.value === "Otro") {
    categoriaOtro.style.display = "block";
    categoriaOtro.focus();
  } else {
    categoriaOtro.style.display = "none";
    categoriaOtro.value = "";
  }
});





// Registrar gasto o ingreso
// Registrar gasto o ingreso
const form = document.getElementById("formGastoIngreso");
form.addEventListener("submit", async e => {
  e.preventDefault();

  const tipo = document.getElementById("tipoMovimiento").value;
  const monto = parseFloat(document.getElementById("monto").value);
  const descripcion = document.getElementById("descripcion").value;

  let categoria = categoriaSelect.value;
  if (categoria === "") {
    mostrarMensajeError("Debes seleccionar una categoría");
    return;
  }

  if (categoria === "Otro") {
    categoria = categoriaOtro.value.trim();
    if (!categoria) {
      mostrarMensajeError("Debes escribir una categoría");
      return;
    }
  }

  let url = "/api/finanzas/gastos";
  let body = { monto, categoria, descripcion, fecha: new Date() };

  if (tipo === "ingreso") {
    url = "/api/finanzas/ingresos";
    body.tipo = "otro";
    body.categoria = categoria; // también registrar la categoría
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      mostrarMensajeError(data.mensaje);
      return;
    }

    // Mostrar mensaje de éxito
    mostrarMensajeExito(`${tipo} registrado correctamente`);
    actualizarBalance();
    mostrarMovimientos();
    
    // Restablecer el formulario y mostrar las categorías correspondientes
    form.reset();
    categoriaOtro.style.display = "none";
    
    // Actualizar las categorías después de un registro exitoso
    actualizarCategorias(tipo);  // Volver a actualizar las categorías con el tipo seleccionado
    tipoMovimiento.value = "gasto"; // Restablecer el tipo de movimiento a "gasto" por defecto
    actualizarCategorias("gasto"); // Asegurarse de que las categorías de "gasto" se muestren

  } catch (err) {
    mostrarMensajeError("Error en la conexión");
  }
});

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

// Actualizar categorías según el tipo de movimiento
tipoMovimiento.addEventListener("change", () => {
  const tipo = tipoMovimiento.value;
  actualizarCategorias(tipo);
});

// Función para actualizar las categorías según el tipo de movimiento
const actualizarCategorias = (tipo) => {
  // Reseteamos la categoría seleccionada a su valor inicial
  categoriaSelect.value = "";  // Limpiamos la selección anterior

  if (tipo === "ingreso") {
    // Si es ingreso, agregar categorías extra
    categoriaSelect.innerHTML = `
      <option value="">Selecciona categoría</option>
      <option value="Trabajo">Trabajo</option>
      <option value="Emprendimiento">Emprendimiento</option>
      <option value="Regalo">Regalo</option>
      <option value="Otro">Otro</option>
    `;
  } else if (tipo === "gasto") {
    // Si es gasto, solo mostrar las categorías típicas
    categoriaSelect.innerHTML = `
      <option value="">Selecciona categoría</option>
      <option value="Comida">Comida</option>
      <option value="Bebida">Bebida</option>
      <option value="Deporte">Deporte</option>
      <option value="Entretenimiento">Entretenimiento</option>
      <option value="Gasolina">Gasolina</option>
      <option value="Servicios">Servicios</option>
      <option value="Agua">Agua</option>
      <option value="Luz">Luz</option>
      <option value="Alquiler">Alquiler</option>
      <option value="Internet">Internet</option>
      <option value="Ropa">Ropa</option>
      <option value="Salud">Salud</option>
      <option value="Tecnología">Tecnología</option>
      <option value="Transporte">Transporte</option>
      <option value="Otro">Otro</option>
    `;
  }

  // Asegurarse de que si está seleccionado "Otro", se muestre el campo de categoría personalizada
  if (categoriaSelect.value === "Otro") {
    categoriaOtro.style.display = "block";
  } else {
    categoriaOtro.style.display = "none";
    categoriaOtro.value = ""; // Limpiar el campo si no está activo
  }
};

// Llamar a la función para establecer las categorías por defecto según el tipo seleccionado
const tipoSeleccionado = document.getElementById("tipoMovimiento").value;
actualizarCategorias(tipoSeleccionado);

// Categoria select / Otro
categoriaSelect.addEventListener("change", () => {
  if (categoriaSelect.value === "Otro") {
    categoriaOtro.style.display = "block";
    categoriaOtro.focus();
  } else {
    categoriaOtro.style.display = "none";
    categoriaOtro.value = "";
  }
});





function verDetalle(id) {
  localStorage.setItem("paginaAnterior", "dashboard.html");
  window.location.href = `detalle.html?id=${id}`;
}


localStorage.setItem("paginaAnterior", "dashboard.html");



