document.addEventListener("DOMContentLoaded", async () => {
  Chart.register(ChartDataLabels);

  const token = localStorage.getItem("token");
  if (!token) return window.location.href = "login.html";

  const contenedor = document.getElementById("contenedorMeses");

  // Modal references
  const modalBackdrop = document.getElementById("modalBackdrop");
  const btnCerrarModal = document.getElementById("btnCerrarModal");
  const listaMovimientosEl = document.getElementById("listaMovimientos");
  const btnVerMasModal = document.getElementById("btnVerMasModal");
  const modalTitle = document.getElementById("modalTitle");

  let todosLosMovimientos = []; // cache de todos los movimientos
  let movimientosFiltrados = []; // movimientos mostrados en el modal (para mes actual del modal)
  let mostradosModal = 0;
  const cantidadPorPagina = 10;

  // helpers
  const formatearMonto = (num) => {
    return new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const formatearFechaCorta = (d) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  const formatearFechaLarga = (d) => {
    const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${diasSemana[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} del ${d.getFullYear()}`;
  };

  // Cargar movimientos una vez
  try {
    const res = await fetch("/api/finanzas/movimientos", { headers: { Authorization: `Bearer ${token}` }});
    if (!res.ok) throw new Error("Error al cargar movimientos");
    todosLosMovimientos = await res.json();
  } catch (err) {
    console.error("No se pudieron cargar movimientos:", err);
    contenedor.innerHTML = `<p style="padding:20px;color:#900">Error cargando estadísticas</p>`;
    return;
  }

  // Agrupar por mes
  const meses = {};
  todosLosMovimientos.forEach(mov => {
    const fecha = new Date(mov.fecha);
    const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
    if (!meses[key]) meses[key] = { ingresos: 0, gastos: 0, mes: fecha.getMonth(), año: fecha.getFullYear() };
    if (mov.tipo === "ingreso") meses[key].ingresos += mov.monto;
    else meses[key].gastos += mov.monto;
  });

  const mesesArray = Object.values(meses).sort((a,b) => new Date(b.año, b.mes) - new Date(a.año, a.mes));

  // Render mensual y botón que abre modal
  mesesArray.forEach((m) => {
    const divMes = document.createElement("div");
    divMes.classList.add("mes");

    const nombreMesOriginal = new Date(m.año, m.mes).toLocaleString("es-ES", { month: "long", year: "numeric" });
    const nombreMes = nombreMesOriginal.charAt(0).toUpperCase() + nombreMesOriginal.slice(1);

    divMes.innerHTML = `
      <h2>${nombreMes}</h2>
      <div class="resumen">
  <div>Ingresos: $${formatearMonto(m.ingresos)}</div>
  <div>Gastos: $${formatearMonto(m.gastos)}</div>
</div>

      <canvas class="grafico"></canvas>
      <div style="text-align:center;">
        <button class="btn-movimientos" data-mes="${m.mes}" data-año="${m.año}">Movimientos del mes</button>
      </div>
    `;
    contenedor.appendChild(divMes);

    const canvas = divMes.querySelector("canvas");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext("2d");

    const windowWidth = window.innerWidth;
    let cutoutSize = '50%';
    if (windowWidth <= 480) cutoutSize = '30%';
    if (windowWidth <= 320) cutoutSize = '25%';

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Gastos", "Ingresos"],
        datasets: [{ data: [m.gastos, m.ingresos], backgroundColor: ["#ff4d4d", "#00a35c"], borderWidth: 0, cutout: cutoutSize }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom", labels: { color: '#ffffffff', font: { size: 14 } } },
          datalabels: {
            display: true,
            color: '#fff',
            anchor: 'center',
            align: 'center',
            formatter: (value, context) => {
              const total = context.chart.data.datasets[0].data.reduce((a,b)=>a+b,0);
              if(total === 0) return '0%';
              return ((value/total)*100).toFixed(1) + '%';
            },
            font: { weight: 'bold', size: windowWidth <= 320 ? 12 : 14 }
          }
        }
      },
      plugins: [ChartDataLabels]
    });

    // evento para abrir modal con movimientos de este mes
    const btn = divMes.querySelector(".btn-movimientos");
    btn.addEventListener("click", () => {
      const mes = parseInt(btn.dataset.mes, 10);
      const año = parseInt(btn.dataset.año, 10);
      abrirModalConMes(mes, año, nombreMes);
    });
  });

  // --- FUNCIONES DE MODAL ---
  function abrirModalConMes(mes, año, nombreMes) {
    // Filtrar movimientos del mes
    movimientosFiltrados = todosLosMovimientos.filter(mov => {
      const d = new Date(mov.fecha);
      return d.getMonth() === mes && d.getFullYear() === año;
    }).sort((a,b) => new Date(a.fecha) - new Date(b.fecha)); // más recientes primero

    mostradosModal = 0;
    listaMovimientosEl.innerHTML = "";
    modalTitle.textContent = `Movimientos de ${nombreMes}`;
    if (movimientosFiltrados.length === 0) {
      listaMovimientosEl.innerHTML = `<li style="color:#ddd;padding:12px">No hay movimientos en este mes.</li>`;
      btnVerMasModal.style.display = "none";
    } else {
      cargarMasModal(); // carga primeros 10
    }

    // mostrar modal
    modalBackdrop.classList.add("show");
    modalBackdrop.setAttribute("aria-hidden", "false");
    // allow esc to close
    document.addEventListener("keydown", cerrarConEsc);
  }

 function cerrarModal() {
  document.activeElement.blur(); // 👈 QUITA EL FOCO DEL BOTÓN

  modalBackdrop.classList.remove("show");
  modalBackdrop.setAttribute("aria-hidden", "true");

  listaMovimientosEl.innerHTML = "";
  movimientosFiltrados = [];
  mostradosModal = 0;
  btnVerMasModal.style.display = "none";

  document.removeEventListener("keydown", cerrarConEsc);
}


  function cerrarConEsc(e) {
    if (e.key === "Escape") cerrarModal();
  }

 
  btnCerrarModal.addEventListener("click", cerrarModal);
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) cerrarModal();
  });

  // cargar más dentro del modal (paginación)
  function cargarMasModal() {
    const fin = mostradosModal + cantidadPorPagina;
    const nuevos = movimientosFiltrados.slice(mostradosModal, fin);

    nuevos.forEach(m => {
      const li = document.createElement("li");
      li.classList.add(m.tipo === "ingreso" ? "ingreso" : "gasto");
      li.dataset.id = m._id;
      li.dataset.fecha = new Date(m.fecha).toISOString().split("T")[0];

      

      const tipoMovimiento = (m.tipo || "").toUpperCase();
      const monto = `$${formatearMonto(m.monto)}`;
      const categoria = m.categoria || "Sin categoría";
      const descripcion = m.descripcion || "Sin descripción";
      const d = new Date(m.fecha);

      const fechaCorta = formatearFechaCorta(d);
      const fechaLarga = formatearFechaLarga(d);

      li.innerHTML = `
        <div class="movimiento-info">
          <span class="tipo-movimiento">${tipoMovimiento}</span>
          <span class="monto">${monto}</span>
        </div>
        <div class="detalle-movimiento">
          <span class="fecha">Fecha: ${fechaCorta}</span>
          <span class="fecha-larga">${fechaLarga}</span>
          <span class="categoria">Categoría: ${categoria}</span>
          <span class="descripcion">Descripción: ${descripcion}</span>
        </div>
      `;

      li.addEventListener("click", () => {
  verDetalle(m._id);
});


      listaMovimientosEl.appendChild(li);
    });

    mostradosModal = fin;
    // control de botón ver más
    if (mostradosModal >= movimientosFiltrados.length) {
      btnVerMasModal.style.display = "none";
    } else {
      btnVerMasModal.style.display = "inline-block";
    }
  }

  btnVerMasModal.addEventListener("click", () => cargarMasModal());

});





function verDetalle(id) {
  localStorage.setItem("paginaAnterior", "estadisticas.html");
  window.location.href = `detalle.html?id=${id}`;
}

localStorage.setItem("paginaAnterior", "estadisticas.html");










// Verificar si el navegador soporta Service Workers
  if ('serviceWorker' in navigator) {
    // Registrar el service worker
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration);
      })
      .catch(error => {
        console.error('Error al registrar el Service Worker:', error);
      });
  }