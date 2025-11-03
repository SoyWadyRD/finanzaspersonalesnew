document.addEventListener("DOMContentLoaded", async () => {
  Chart.register(ChartDataLabels); // registra el plugin

  const token = localStorage.getItem("token");
  if (!token) return window.location.href = "login.html";

  const contenedor = document.getElementById("contenedorMeses");

  try {
    const res = await fetch("/api/finanzas/movimientos", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al cargar movimientos");
    const movimientos = await res.json();

    const meses = {};
    movimientos.forEach(mov => {
      const fecha = new Date(mov.fecha);
      const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
      if (!meses[key]) meses[key] = { ingresos: 0, gastos: 0, mes: fecha.getMonth(), año: fecha.getFullYear() };
      if (mov.tipo === "ingreso") meses[key].ingresos += mov.monto;
      else meses[key].gastos += mov.monto;
    });

    const mesesArray = Object.values(meses).sort((a,b) => new Date(b.año, b.mes) - new Date(a.año, a.mes));

    mesesArray.forEach((m) => {
      const divMes = document.createElement("div");
      divMes.classList.add("mes");

      const nombreMesOriginal = new Date(m.año, m.mes)
    .toLocaleString("es-ES", { month: "long", year: "numeric" });

// Convertir primera letra a mayúscula
const nombreMes = nombreMesOriginal.charAt(0).toUpperCase() + nombreMesOriginal.slice(1);

      divMes.innerHTML = `
  <h2>${nombreMes}</h2>
  <div class="resumen">
    <div>Ingresos: $${m.ingresos.toFixed(0)}</div>
    <div>Gastos: $${m.gastos.toFixed(0)}</div>
  </div>
  <canvas class="grafico"></canvas>
`;

      contenedor.appendChild(divMes);

      const canvas = divMes.querySelector("canvas");
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext("2d");

      // --- VERIFICACIÓN EN CONSOLA ---
      const total = m.ingresos + m.gastos;
      const porcentajeIngresos = total === 0 ? 0 : ((m.ingresos / total) * 100).toFixed(1);
      const porcentajeGastos = total === 0 ? 0 : ((m.gastos / total) * 100).toFixed(1);
      

      // dentro del forEach de mesesArray
// dentro del forEach de mesesArray



const windowWidth = window.innerWidth;

// definir cutout según tamaño de pantalla
let cutoutSize = '50%'; // por defecto
if (windowWidth <= 480) cutoutSize = '30%'; // más grueso en móviles
if (windowWidth <= 320) cutoutSize = '25%'; // aún más grueso para pantallas muy pequeñas

new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Gastos", "Ingresos"],
    datasets: [{
      data: [m.gastos, m.ingresos],
      backgroundColor: ["#ff4d4d", "#00a35c"],
      borderWidth: 0,
      cutout: cutoutSize
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: "bottom",
      labels: {
        color: '#ffffffff', // <-- aquí cambias el color del texto
        font: {
          size: 14,
          
        }
      }
    },
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
        font: {
          weight: 'bold',
          size: windowWidth <= 320 ? 12 : 14 // un poquito más pequeño en pantallas muy pequeñas
        }
      }
    }
  },
  plugins: [ChartDataLabels]
});

    });

  } catch (err) {
    contenedor.innerHTML = `<p>Error cargando estadísticas</p>`;
    console.error(err);
  }
});
