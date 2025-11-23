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
        const [year, month, day] = meta.fechaMeta.split("T")[0].split("-");
        const fechaMeta = { year, month, day };  // objeto simple sin fecha js

        // Convertimos la fecha de la meta
        const fechaHoy = new Date();  // Fecha actual

        // Verificar si la meta ya pasó
        const fechaJS = new Date(`${fechaMeta.year}-${fechaMeta.month}-${fechaMeta.day}T23:59:59`);
        const metaCompletada = fechaJS < new Date(); // Si la fecha es anterior a hoy
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
            <div><strong>Fecha: </strong>${fechaMeta.day}/${fechaMeta.month}/${fechaMeta.year}</div>
            <div><strong>Categoria: </strong>${meta.categoria}</div> <!-- Aquí mostramos la categoría -->
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
          <button class="edit" onclick="editarMeta('${meta._id}')">Editar Meta</button>
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

  const nombre = document.getElementById("nombreMeta").value.trim();
  const cantidad = document.getElementById("cantidadMeta").value;
  const fechaMeta = document.getElementById("fechaMeta").value;
  const descripcion = document.getElementById("descripcionMeta").value.trim();
  const categoriaSelect = document.getElementById("categoriaSelect");
  const categoriaOtro = document.getElementById("categoriaOtro");

  // Obtener categoría final
  let categoria = categoriaSelect.value;
  if (categoria === "Otro") {
    categoria = categoriaOtro.value.trim();
  }

  if (!categoria) {
    mostrarMensaje("error", "Debes seleccionar o escribir una categoría");
    return;
  }

  try {
    const res = await fetch("/api/finanzas/meta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre,
        cantidad,
        fechaMeta,
        descripcion,
        categoria,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Error al crear meta");

    formMeta.reset();
    categoriaOtro.style.display = "none";

    mostrarMetas();
    mostrarMensaje("verificacion", "Meta creada con éxito");
  } catch (e) {
    console.error(e);
    mostrarMensaje("error", "Hubo un error al crear la meta");
  }
});










// Función para mostrar mensajes de éxito o error
// Función para mostrar mensajes de éxito o error en el div
const mostrarMensaje = (tipo, mensaje) => {
  // Primero, elimina cualquier mensaje previo
  const mensajeContainerExistente = document.getElementById(tipo === "verificacion" ? "mensajeVerificacion" : "mensajeError");
  if (mensajeContainerExistente) {
    mensajeContainerExistente.remove();
  }

  // Crear el nuevo contenedor de mensaje
  const mensajeContainer = document.createElement("div");
  mensajeContainer.textContent = mensaje;

  // Asignar las clases y el ID según el tipo de mensaje
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








// Función para mostrar el loader
const mostrarLoader = () => {
  document.getElementById("loader").style.display = "flex";
};

// Función para ocultar el loader
const ocultarLoader = () => {
  document.getElementById("loader").style.display = "none";
};







// Modales de agregar, quitar y eliminar monto
const modalAgregarMonto = document.getElementById("modalAgregarMonto");
const modalQuitarMonto = document.getElementById("modalQuitarMonto");
const modalEliminarMeta = document.getElementById("modalEliminarMeta");




// Función para abrir el modal de agregar monto
const agregarMonto = (metaId) => {
  modalAgregarMonto.style.display = "flex";
  document.getElementById("montoAgregar").value = "";

  const confirmarAgregarMonto = document.getElementById("confirmarAgregarMonto");
  const cancelarAgregarMonto = document.getElementById("cancelarAgregarMonto");

  confirmarAgregarMonto.onclick = () => {
    let monto = parseFloat(document.getElementById("montoAgregar").value);
    
    if (!monto || isNaN(monto) || monto <= 0) {
      return mostrarMensaje("error", "Por favor ingrese un monto válido.");
    }

    const meta = metasGlobal.find((meta) => meta._id === metaId);
    if (!meta) {
      return mostrarMensaje("error", "Meta no encontrada");
    }

    const cantidadTotal = parseFloat(meta.cantidad);
    const montoActual = parseFloat(meta.montoActual || 0);

    if (montoActual + monto > cantidadTotal) {
      return mostrarMensaje("error", "No puedes agregar más de lo que queda para completar la meta.");
    }

    // Mostrar loader antes de la petición
    mostrarLoader();

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
      mostrarMetas();
      modalAgregarMonto.style.display = "none";
      document.getElementById("montoAgregar").value = "";
    })
    .catch((err) => {
      console.error("Error al agregar monto:", err);
      mostrarMensaje("error", "Error al agregar el monto: " + err.message);
    })
    .finally(() => {
      ocultarLoader(); // Ocultar loader cuando la petición termina
    });
  };

  cancelarAgregarMonto.onclick = () => {
    modalAgregarMonto.style.display = "none";
    document.getElementById("montoAgregar").value = "";
  };
};

















// Función para abrir el modal de quitar monto
// Función para abrir el modal de quitar monto
const quitarMonto = (metaId) => {
  modalQuitarMonto.style.display = "flex";
  document.getElementById("montoQuitar").value = "";

  const confirmarQuitarMonto = document.getElementById("confirmarQuitarMonto");
  const cancelarQuitarMonto = document.getElementById("cancelarQuitarMonto");

  confirmarQuitarMonto.onclick = () => {
    const monto = parseFloat(document.getElementById("montoQuitar").value);

    if (!monto || isNaN(monto) || monto <= 0) {
      return mostrarMensaje("error", "Por favor ingrese un monto válido.");
    }

    const meta = metasGlobal.find((meta) => meta._id === metaId);
    if (!meta) {
      return mostrarMensaje("error", "Meta no encontrada");
    }

    const montoActual = parseFloat(meta.montoActual || 0);
    if (monto > montoActual) {
      return mostrarMensaje("error", "No puedes quitar más de lo que has logrado.");
    }

    // Mostrar loader antes de la petición
    mostrarLoader();

    fetch(`/api/finanzas/meta/quitar/${metaId}`, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ monto }),
    })
    .then(() => {
      mostrarMetas();
      modalQuitarMonto.style.display = "none";
    })
    .catch((err) => {
      console.error("Error al quitar el monto:", err);
      mostrarMensaje("error", "Error al quitar el monto: " + err.message);
    })
    .finally(() => {
      ocultarLoader(); // Ocultar loader cuando la petición termina
    });
  };

  cancelarQuitarMonto.onclick = () => {
    modalQuitarMonto.style.display = "none";
  };
};
















// Función para abrir el modal de eliminar meta
const eliminarMeta = (metaId) => {
  modalEliminarMeta.style.display = "flex";
  const confirmarEliminarMeta = document.getElementById("confirmarEliminarMeta");
  const cancelarEliminarMeta = document.getElementById("cancelarEliminarMeta");

  confirmarEliminarMeta.onclick = () => {
    // Mostrar loader antes de la petición
    mostrarLoader();

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
      mostrarMensaje("error", "Error al eliminar la meta: " + err.message);
    })
    .finally(() => {
      // Ocultar loader cuando la petición termina
      ocultarLoader();
    });
  };

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










const modalEditarMeta = document.getElementById("modalEditarMeta");

const editarMeta = (metaId) => {
  const meta = metasGlobal.find((m) => m._id === metaId);
  if (!meta) return mostrarMensaje("error", "Meta no encontrada");

  // Rellenar los campos del modal con los datos actuales
  document.getElementById("editarNombreMeta").value = meta.nombre;
  document.getElementById("editarCantidadMeta").value = meta.cantidad;
  document.getElementById("editarFechaMeta").value = meta.fechaMeta.split("T")[0]; // formato yyyy-mm-dd
  document.getElementById("editarDescripcionMeta").value = meta.descripcion;

  // Cargar la categoría en el select
  const categoriaSelect = document.getElementById("editarCategoriaSelect");
  categoriaSelect.value = meta.categoria || "Otro";  // "Otro" por defecto si no hay categoría

  // Mostrar el campo de categoría personalizada si es "Otro"
  const categoriaOtro = document.getElementById("editarCategoriaOtro");
  if (meta.categoria === "Otro") {
    categoriaOtro.style.display = "block";
    categoriaOtro.value = meta.categoria;  // Asignar la categoría personalizada
  } else {
    categoriaOtro.style.display = "none";
  }

  modalEditarMeta.style.display = "flex";

  // Cuando se cambia la categoría en el select
  categoriaSelect.onchange = () => {
    if (categoriaSelect.value === "Otro") {
      categoriaOtro.style.display = "block"; // Mostrar campo para otra categoría
    } else {
      categoriaOtro.style.display = "none"; // Ocultar campo si no es "Otro"
    }
  };

  const confirmarEditarMeta = document.getElementById("confirmarEditarMeta");
  const cancelarEditarMeta = document.getElementById("cancelarEditarMeta");

  confirmarEditarMeta.onclick = async () => {
    const nombreMeta = document.getElementById("editarNombreMeta").value; // Definir correctamente
    const cantidadMeta = parseFloat(document.getElementById("editarCantidadMeta").value); // Definir correctamente
    const fechaMeta = document.getElementById("editarFechaMeta").value; // Definir correctamente
    const descripcionMeta = document.getElementById("editarDescripcionMeta").value; // Definir correctamente
    const categoriaSelect = document.getElementById("editarCategoriaSelect");
    const categoriaOtro = document.getElementById("editarCategoriaOtro");

    // Verificar que todos los campos estén completos
    if (!nombreMeta || !cantidadMeta || !fechaMeta || !descripcionMeta || !categoriaSelect || !categoriaOtro) {
      return mostrarMensaje("error", "Algunos elementos del formulario no se encuentran.");
    }

    let categoria = categoriaSelect.value;

    // Si se selecciona "Otro", obtener el valor del campo de texto adicional
    if (categoria === "Otro") {
      categoria = categoriaOtro.value.trim(); // Obtener valor del campo "Otro"
    }

    // Validar que la categoría no esté vacía
    if (!categoria) {
      return mostrarMensaje("error", "Debes seleccionar o escribir una categoría");
    }

    try {
      mostrarLoader(); // Mostrar loader antes de la petición

      const res = await fetch(`/api/finanzas/meta/editar/${metaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: nombreMeta, cantidad: cantidadMeta, fechaMeta, descripcion: descripcionMeta, categoria }), // Usar las variables correctamente
      });

      if (!res.ok) {
        const data = await res.json();
        return mostrarMensaje("error", data.mensaje || "Error al editar la meta");
      }

      mostrarMetas(); // Refresca la lista
      modalEditarMeta.style.display = "none";
    } catch (err) {
      console.error("Error al editar meta:", err);
      mostrarMensaje("error", "Error al editar la meta");
    } finally {
      ocultarLoader(); // Ocultar loader al finalizar la petición
    }
  };

  cancelarEditarMeta.onclick = () => {
    modalEditarMeta.style.display = "none";
  };
};






const categoriaSelect = document.getElementById("categoriaSelect");
const categoriaOtro = document.getElementById("categoriaOtro");

let categoriaFinal = categoriaSelect.value;

categoriaSelect.addEventListener("change", () => {
  if (categoriaSelect.value === "Otro") {
    categoriaOtro.style.display = "block";
    categoriaOtro.required = true;
  } else {
    categoriaOtro.style.display = "none";
    categoriaOtro.required = false;
    categoriaOtro.value = "";
  }
});
