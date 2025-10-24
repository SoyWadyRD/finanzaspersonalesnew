const formMeta = document.getElementById("formMeta");
const listaMetas = document.getElementById("listaMetas");
const token = localStorage.getItem("token");

// Verificar que el token exista
if (!token) {
  window.location.href = "login.html";  // Redirige si no hay token
}

let metasGlobal = []; // Variable global para almacenar las metas

const mostrarMetas = () => {
  // Hacer la solicitud a la API
  fetch("/api/finanzas/metas", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Error en la solicitud: " + res.statusText);
      }
      return res.json();
    })
    .then((metas) => {
      metasGlobal = metas; // Almacenar las metas globalmente

      // Limpiar el contenedor de metas antes de agregar nuevas
      listaMetas.innerHTML = "";

      // Iterar sobre cada meta y mostrarla
      metas.forEach((meta) => {
        const li = document.createElement("li");
        li.classList.add("meta-item");

        const cantidadTotal = parseFloat(meta.cantidad);
        const montoActual = parseFloat(meta.montoActual || 0); // Si no existe, lo asignamos a 0
        const fechaMeta = new Date(meta.fechaMeta);  // Convertimos la fecha de la meta
        const fechaHoy = new Date();  // Fecha actual

        // Verificar si la meta ya pasó
        const metaCompletada = fechaMeta < fechaHoy; // Si la fecha es anterior a hoy
        const porcentaje = (montoActual / cantidadTotal) * 100;

        // Asegurarnos de que el porcentaje no exceda el 100%
        const porcentajeFinal = porcentaje > 100 ? 100 : porcentaje;

        // Determinar estado y visibilidad de los botones
        let estadoMeta = "No Completado";
        let mostrarBotones = true;

        // Si ya pasó la fecha o si se completó la meta, cambiar el estado
        if (montoActual >= cantidadTotal) {
          estadoMeta = "Completado";
          mostrarBotones = false; // No mostramos los botones si la meta ya está completada
        } else if (metaCompletada) {
          estadoMeta = "No Completado";
          mostrarBotones = false; // No mostramos los botones si ya pasó la fecha
        }

        // Mostrar la meta en el HTML
        li.innerHTML = `
          <h3>${meta.nombre}</h3>
          <div class="meta-details">
            <div><strong>Meta: </strong>$${cantidadTotal}</div>
            <div><strong>Logrado: </strong>$${montoActual}</div>
            <div><strong>Fecha: </strong>${fechaMeta.toLocaleDateString()}</div>
            <div><strong>Descripción: </strong>${meta.descripcion}</div>
            <div><strong>Estado: </strong>${estadoMeta}</div>
          </div>
          <div class="bar-container">
            <div class="progress-bar" style="width: ${porcentajeFinal}%"></div>
            <div class="progress-text">${Math.round(porcentajeFinal)}%</div>
          </div>
          <div class="button-container">
            ${mostrarBotones ? `
              <button class="add-remove" onclick="agregarMonto('${meta._id}')">Agregar Monto</button>
              <button class="remove" onclick="quitarMonto('${meta._id}')">Quitar Monto</button>
            ` : ""}
          </div>
          <button class="delete" onclick="eliminarMeta('${meta._id}')">Eliminar Meta</button>
        `;

        listaMetas.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("Error al cargar metas:", err);
      alert("Error al cargar metas: " + err.message);
    });
};

// Llamar a la función para mostrar las metas cuando la página se carga
mostrarMetas();














// Crear meta
formMeta.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreMeta").value;
  const cantidad = parseFloat(document.getElementById("cantidadMeta").value);
  const fechaMeta = document.getElementById("fechaMeta").value;
  const descripcion = document.getElementById("descripcionMeta").value;

  // Limpiar los mensajes previos
  const mensajeVerificacion = document.getElementById("mensajeVerificacion");
  const mensajeError = document.getElementById("mensajeError");
  if (mensajeVerificacion) mensajeVerificacion.style.display = "none";
  if (mensajeError) mensajeError.style.display = "none";

  try {
    const res = await fetch("/api/finanzas/meta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre, cantidad, fechaMeta, descripcion }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Mostrar el mensaje de error
      mostrarMensaje("error", data.mensaje);
      return;
    }

    // Mostrar el mensaje de éxito
    mostrarMensaje("verificacion", "Meta creada correctamente");
    formMeta.reset();
    mostrarMetas(); // Actualiza la lista de metas
  } catch (err) {
    // Mostrar el mensaje de error en caso de conexión fallida
    mostrarMensaje("error", "Error en la conexión");
    console.error("Error en la creación de la meta:", err);
  }
});







// Función para mostrar mensajes de éxito o error
// Función para mostrar mensajes de éxito o error en el div
const mostrarMensaje = (tipo, mensaje) => {
  const mensajeContainer = document.createElement("div");
  mensajeContainer.textContent = mensaje;

  // Asignamos las clases según el tipo de mensaje
  if (tipo === "verificacion") {
    mensajeContainer.classList.add("mensaje-verificacion");
    mensajeContainer.id = "mensajeVerificacion";
  } else if (tipo === "error") {
    mensajeContainer.classList.add("mensaje-error");
    mensajeContainer.id = "mensajeError";
  }

  // Agregar el mensaje al body
  document.body.appendChild(mensajeContainer);

  // Mostrar el mensaje inmediatamente
  mensajeContainer.style.display = "block";

  // Ocultar el mensaje después de 3 segundos
  setTimeout(() => {
    mensajeContainer.style.display = "none";
  }, 3000);
};













// Modales de agregar, quitar y eliminar monto
const modalAgregarMonto = document.getElementById("modalAgregarMonto");
const modalQuitarMonto = document.getElementById("modalQuitarMonto");
const modalEliminarMeta = document.getElementById("modalEliminarMeta");

// Función para abrir el modal de agregar monto
// Función para abrir el modal de agregar monto
const agregarMonto = (metaId) => {
  modalAgregarMonto.style.display = "flex";

  // Limpiar el campo de monto al abrir el modal
  document.getElementById("montoAgregar").value = "";

  const confirmarAgregarMonto = document.getElementById("confirmarAgregarMonto");
  const cancelarAgregarMonto = document.getElementById("cancelarAgregarMonto");

  // Confirmar agregar monto
  confirmarAgregarMonto.onclick = () => {
    let monto = parseFloat(document.getElementById("montoAgregar").value);
    
    // Verificar si el monto es válido
    if (!monto || isNaN(monto) || monto <= 0) {
      return mostrarMensaje("error", "Por favor ingrese un monto válido.");
    }

    // Obtener la meta correspondiente desde metasGlobal
    const meta = metasGlobal.find((meta) => meta._id === metaId);
    if (!meta) {
      return mostrarMensaje("error", "Meta no encontrada");
    }

    const cantidadTotal = parseFloat(meta.cantidad);
    const montoActual = parseFloat(meta.montoActual || 0);

    // Validar que el monto agregado no sea mayor que el total menos lo que ya se ha alcanzado
    if (montoActual + monto > cantidadTotal) {
      return mostrarMensaje("error", "No puedes agregar más de lo que queda para completar la meta.");
    }

    // Hacer la solicitud de agregar monto
    fetch(`/api/finanzas/meta/agregar/${metaId}`, {  
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ monto }),
    })
    .then((res) => res.json())
    .then(() => {
      mostrarMetas(); // Actualiza las metas al agregar el monto
      modalAgregarMonto.style.display = "none";
      
      // Limpiar el campo de monto después de agregarlo
      document.getElementById("montoAgregar").value = "";
    })
    .catch((err) => {
      console.error("Error al agregar monto:", err);
      mostrarMensaje("error", "Error al agregar el monto: " + err.message);
    });
  };

  // Cancelar acción
  cancelarAgregarMonto.onclick = () => {
    modalAgregarMonto.style.display = "none";
    // Limpiar el campo de monto si el usuario cancela la acción
    document.getElementById("montoAgregar").value = "";
  };
};

















// Función para abrir el modal de quitar monto
const quitarMonto = (metaId) => {
  modalQuitarMonto.style.display = "flex";

  // Limpiar el campo de monto al abrir el modal
  document.getElementById("montoQuitar").value = "";

  const confirmarQuitarMonto = document.getElementById("confirmarQuitarMonto");
  const cancelarQuitarMonto = document.getElementById("cancelarQuitarMonto");

  // Confirmar quitar monto
  confirmarQuitarMonto.onclick = () => {
    const monto = parseFloat(document.getElementById("montoQuitar").value);
    
    // Verificar si el monto es válido
    if (!monto || isNaN(monto) || monto <= 0) {
      return mostrarMensaje("error", "Por favor ingrese un monto válido.");
    }

    // Obtener la meta correspondiente desde metasGlobal
    const meta = metasGlobal.find((meta) => meta._id === metaId);
    if (!meta) {
      return mostrarMensaje("error", "Meta no encontrada");
    }

    const montoActual = parseFloat(meta.montoActual || 0);

    // Validar que el monto a quitar no sea mayor que lo que se ha logrado
    if (monto > montoActual) {
      return mostrarMensaje("error", "No puedes quitar más de lo que has logrado.");
    }

    // Hacer la solicitud de quitar monto
    fetch(`/api/finanzas/meta/quitar/${metaId}`, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ monto }),
    })
    .then(() => {
      mostrarMetas(); // Actualiza las metas al quitar el monto
      modalQuitarMonto.style.display = "none";
    })
    .catch((err) => alert("Error al quitar el monto"));
  };

  // Cancelar acción
  cancelarQuitarMonto.onclick = () => {
    modalQuitarMonto.style.display = "none";
  };
};
















// Función para abrir el modal de eliminar meta
const eliminarMeta = (metaId) => {
  modalEliminarMeta.style.display = "flex";
  const confirmarEliminarMeta = document.getElementById("confirmarEliminarMeta");
  const cancelarEliminarMeta = document.getElementById("cancelarEliminarMeta");

  // Confirmar eliminar meta
  confirmarEliminarMeta.onclick = () => {
    fetch(`/api/finanzas/meta/${metaId}`, {
      method: "DELETE",  
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        mostrarMetas(); // Actualiza la lista de metas después de eliminarla
        modalEliminarMeta.style.display = "none";
      })
      .catch((err) => {
        console.error("Error al eliminar la meta:", err);
        alert("Error al eliminar la meta: " + err.message);
      });
  };

  // Cancelar acción
  cancelarEliminarMeta.onclick = () => {
    modalEliminarMeta.style.display = "none";
  };
};













// Confirmar agregar monto
confirmarAgregarMonto.onclick = () => {
  let monto = parseFloat(document.getElementById("montoAgregar").value);
  
  // Verificar si el monto es válido
  if (!monto || isNaN(monto) || monto <= 0) {
    return mostrarMensaje("error", "Por favor ingrese un monto válido.");
  }

  // Obtener la meta correspondiente desde metasGlobal
  const meta = metasGlobal.find((meta) => meta._id === metaId);
  if (!meta) {
    return mostrarMensaje("error", "Meta no encontrada");
  }

  const cantidadTotal = parseFloat(meta.cantidad);
  const montoActual = parseFloat(meta.montoActual || 0);

  // Validar que el monto agregado no sea mayor que el total menos lo que ya se ha alcanzado
  if (montoActual + monto > cantidadTotal) {
    return mostrarMensaje("error", "No puedes agregar más de lo que queda para completar la meta.");
  }

  // Hacer la solicitud de agregar monto
  fetch(`/api/finanzas/meta/agregar/${metaId}`, {  
    method: "PUT", 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ monto }),
  })
  .then((res) => res.json())
  .then(() => {
    mostrarMetas(); // Actualiza las metas al agregar el monto
    modalAgregarMonto.style.display = "none";
    
    // Limpiar el campo de monto después de agregarlo
    document.getElementById("montoAgregar").value = "";
  })
  .catch((err) => {
    console.error("Error al agregar monto:", err);
    mostrarMensaje("error", "Error al agregar el monto: " + err.message);
  });
};