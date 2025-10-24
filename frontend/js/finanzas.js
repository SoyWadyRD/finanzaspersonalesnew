const nombreUsuario = document.getElementById("nombreUsuario");
const totalIngresosEl = document.getElementById("totalIngresos");
const totalGastosEl = document.getElementById("totalGastos");
const balanceEl = document.getElementById("balance");
const listaMovimientos = document.getElementById("listaMovimientos");

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
    totalIngresosEl.textContent = data.totalIngresos;
    totalGastosEl.textContent = data.totalGastos;
    balanceEl.textContent = data.balance;
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
    listaMovimientos.innerHTML = "";
    data.forEach(m => {
      const li = document.createElement("li");
      li.classList.add(m.tipo); // Añadir clase 'ingreso' o 'gasto'
      li.dataset.id = m._id;

      // Crear una estructura más ordenada para mostrar los movimientos
      const tipoMovimiento = m.tipo.toUpperCase();
      const monto = `$${m.monto.toFixed(2)}`;
      const categoria = m.categoria ? m.categoria : "Sin categoría";
      const descripcion = m.descripcion ? m.descripcion : "Sin descripción";

      li.innerHTML = `
        <div class="movimiento-info">
          <span class="tipo-movimiento">${tipoMovimiento}</span>
          <span class="monto">${monto}</span>
        </div>
        <div class="detalle-movimiento">
          <span class="categoria">Categoría: ${categoria}</span>
          <span class="descripcion">Descripción: ${descripcion}</span>
        </div>
      `;

      li.addEventListener("click", () => {
        window.location.href = `detalle.html?id=${m._id}`;
      });
      listaMovimientos.appendChild(li);
    });
  })
  .catch(err => console.error("Error al cargar movimientos:", err));
};
mostrarMovimientos();






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
