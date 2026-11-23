// =========================================================================
// CONECTOR FRONTEND -> GOOGLE APPS SCRIPT
// =========================================================================

const API_URL = "https://script.google.com/macros/s/AKfycbzitV3d9Epu2DBnSXpndMJFi9EUx-3gdSBsb9Lc3KamsHneO0pDP53m0qiYokkvrh9jjA/exec";
const WHATSAPP_ACADEMIA = "50233834646";

function mostrarLoader(visible) {
  const el = document.getElementById("loader");
  if (el) el.classList.toggle("oculto", !visible);
}

function guardarSesion(sesion) {
  sessionStorage.setItem("compured_sesion", JSON.stringify(sesion));
}

function obtenerSesion() {
  const raw = sessionStorage.getItem("compured_sesion");
  return raw ? JSON.parse(raw) : null;
}

function cerrarSesion() {
  sessionStorage.removeItem("compured_sesion");
  window.location.href = "login.html";
}

function exigirRol(rolEsperado) {
  const sesion = obtenerSesion();
  if (!sesion) {
    window.location.href = "login.html";
    return null;
  }
  if (rolEsperado && sesion.rol !== rolEsperado) {
    redirigirPorRol(sesion.rol);
    return null;
  }
  pintarEncabezadoSesion(sesion);
  return sesion;
}

function redirigirPorRol(rol) {
  if (rol === "Director") window.location.href = "director.html";
  else if (rol === "Docente") window.location.href = "docente.html";
  else if (rol === "Estudiante") window.location.href = "estudiante.html";
  else window.location.href = "login.html";
}

function pintarEncabezadoSesion(sesion) {
  const lblNombre = document.getElementById("lblUsuarioNombre");
  const lblRol = document.getElementById("lblUsuarioRol");
  const lblSede = document.getElementById("lblUsuarioSede");
  if (lblNombre) lblNombre.textContent = sesion.nombre;
  if (lblRol) lblRol.textContent = sesion.rol;
  if (lblSede) lblSede.textContent = sesion.sede;
}

async function llamarAPI(accion, datos = {}, sesionOverride = null) {
  mostrarLoader(true);
  try {
    const sesion = sesionOverride !== null ? sesionOverride : obtenerSesion();
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ accion, datos, sesion })
    });
    const json = await respuesta.json();
    if (!json.exito) throw new Error(json.mensaje || "Error en el servidor.");
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

function abrirModalPassword() {
  document.getElementById("inputNuevaClave").value = "";
  document.getElementById("modalPassword").classList.remove("oculto");
}

function cerrarModales() {
  document.querySelectorAll(".modal").forEach(m => m.classList.add("oculto"));
}

async function cambiarPasswordForm(e) {
  e.preventDefault();
  const nuevaPassword = document.getElementById("inputNuevaClave").value.trim();
  try {
    const msg = await llamarAPI("cambiarPassword", { nuevaPassword });
    alert(msg);
    cerrarModales();
  } catch (err) {
    alert(err.message);
  }
}