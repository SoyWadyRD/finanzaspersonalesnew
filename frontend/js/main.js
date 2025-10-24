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
