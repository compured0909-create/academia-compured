// =========================================================================
// CONECTOR FRONTEND - ACADEMIA COMPURED Y COMPUCENTER
// =========================================================================

const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbzitV3d9Epu2DBnSXpndMJFi9EUx-3gdSBsb9Lc3KamsHneO0pDP53m0qiYokkvrh9jjA/exec";

function mostrarLoader(estado) {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.classList.toggle("oculto", !estado);
  }
}

function obtenerSesion() {
  const raw = sessionStorage.getItem("sesionCompured");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function guardarSesion(sesion) {
  sessionStorage.setItem("sesionCompured", JSON.stringify(sesion));
}

function exigirRol(rolRequerido) {
  const sesion = obtenerSesion();
  if (!sesion) {
    window.location.href = "index.html";
    return null;
  }
  if (rolRequerido && sesion.rol !== rolRequerido) {
    window.location.href = "index.html";
    return null;
  }

  const lblNombre = document.getElementById("lblUsuarioNombre");
  const lblRol = document.getElementById("lblUsuarioRol");
  const lblSede = document.getElementById("lblUsuarioSede");
  if (lblNombre) lblNombre.textContent = sesion.nombre;
  if (lblRol) lblRol.textContent = sesion.rol;
  if (lblSede) lblSede.textContent = sesion.sede;

  return sesion;
}

function cerrarSesion() {
  sessionStorage.removeItem("sesionCompured");
  window.location.href = "index.html";
}

async function llamarAPI(accion, datos = {}) {
  const sesion = obtenerSesion() || {};
  mostrarLoader(true);
  try {
    const respuesta = await fetch(URL_WEB_APP, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ accion, datos, sesion })
    });
    const texto = await respuesta.text();
    let json;
    try {
      json = JSON.parse(texto);
    } catch (errParse) {
      throw new Error("La respuesta del servidor no tuvo formato JSON válido.");
    }
    if (!json.exito) {
      throw new Error(json.mensaje || "Ocurrió un error en la operación.");
    }
    return json.data;
  } finally {
    mostrarLoader(false);
  }
}

function convertirArchivoBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo seleccionado."));
    reader.readAsDataURL(file);
  });
}

function cerrarModales() {
  document.querySelectorAll(".modal").forEach(m => {
    if (m.id === "modalBienvenidaCiclo" || m.id === "modalBienvenidaCicloDoc") return;
    m.classList.add("oculto");
  });
}

function abrirModalPassword() {
  const form = document.querySelector("#modalPassword form");
  if (form) form.reset();
  const modal = document.getElementById("modalPassword");
  if (modal) modal.classList.remove("oculto");
}

async function cambiarPasswordForm(e) {
  e.preventDefault();
  const input = document.getElementById("inputNuevaClave");
  const nuevaPassword = input ? input.value.trim() : "";
  try {
    const msg = await llamarAPI("cambiarPassword", { nuevaPassword });
    alert(msg);
    cerrarModales();
  } catch (err) {
    alert(err.message);
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}