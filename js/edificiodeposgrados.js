window.SWITCHES_DB = [];

async function guardarSwitchEnBD(payload) {
    const resp = await fetch("../php/procesar_switch.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    return await resp.json();
}

async function cargarSwitchesBD(idZona) {
    const resp = await fetch(`../php/obtener_switch.php?id_zona=${idZona}`);
    return await resp.json();
}

async function eliminarSwitchBD(id_switch) {
    const resp = await fetch("../php/procesar_switch.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "eliminar_switch", id_switch })
    });
    return await resp.json();
}

async function eliminarPuertoBD(id_switch, numero_puerto) {
    const resp = await fetch("../php/procesar_switch.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "eliminar_puerto", id_switch, numero_puerto })
    });
    return await resp.json();
}

/* ================================== */
/* === VARIABLES Y CONFIGURACIÓN === */
/* ================================== */
const NUM_PUERTOS = 30; // Se mantiene para bucles de guardado/lectura.

// Modales
const modalVerPunto = document.getElementById("modal-ver-punto");
const modalEditarPunto = document.getElementById("modal-editar-punto");

// Botones de control
const btnEditarInfo = document.getElementById("btn-editar-info");
const guardarPuntoBtn = document.getElementById("guardar-punto");
const eliminarPuntoBtn = document.getElementById("eliminar-punto");

// Elementos de la vista de Ver
const verSwitchNombre = document.getElementById("ver-switch-nombre");
const verSwitchUbicacion = document.getElementById("ver-switch-ubicacion");
const verSwitchSerie = document.getElementById("ver-switch-serie");
const verSwitchMac = document.getElementById("ver-switch-mac");
const tablaPuertosVer = document.getElementById("tabla-puertos-ver");
const tituloVerPunto = document.getElementById('titulo-ver-punto');

// Elementos de la vista de Editar (Información del Switch)
const switchNombreInput = document.getElementById("switch-nombre");
const switchUbicacionInput = document.getElementById("switch-ubicacion");
const switchSerieInput = document.getElementById("switch-serie");
const switchMacInput = document.getElementById("switch-mac");
const tituloEditarPunto = document.getElementById('titulo-punto');

let puntoActual = null; 

/* ================================== */
/* === NOTA: LA FUNCIÓN generarPuertosHTML() FUE ELIMINADA. === */
/* === LOS PUERTOS SE CARGAN DIRECTAMENTE DESDE EL HTML. === */
/* ================================== */


/* ================================== */
/* === FUNCIÓN CARGAR SWITCHES === */
/* ================================== */

async function cargarSwitchDesdeBD() {
    try {
        const resp = await fetch("../php/obtener_switch.php?id_zona=11");
        const json = await resp.json();

        if (!json.success) {
            console.error(json.message);
            return;
        }

        window.SWITCH_DB = json.data;
    } catch (e) {
        console.error("Error cargando switch:", e);
    }
}

/* ================================== */
/* === FUNCIÓN PARA ABRIR MODAL VER (LEER) === */
/* ================================== */
function abrirModalVer(elemento) {
    const switchCodigo = elemento.id; // punto-switch-01

    const sw = window.SWITCHES_DB.find(
        x => x.codigo_switch === switchCodigo
    );

    if (!sw) {
        alert("Este switch aún no existe en la base de datos");
        return;
    }

    puntoActual = elemento;

    // Datos del switch
    verSwitchNombre.textContent = sw.nombre || "Sin asignar";
    verSwitchUbicacion.textContent = sw.ubicacion || "N/A";
    verSwitchSerie.textContent = sw.serie || "N/A";
    verSwitchMac.textContent = sw.mac || "N/A";

    // Puertos
    let html = `
        <table class="tabla-puertos">
            <thead>
                <tr>
                    <th>Puerto</th>
                    <th>Nombre</th>
                    <th>Localización</th>
                    <th>Observaciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 1; i <= 30; i++) {
        const p = sw.puertos.find(x => x.numero_puerto == i) || {};
        html += `
            <tr>
                <td>Punto ${i}</td>
                <td>${p.nombre || "N/A"}</td>
                <td>${p.localizacion || "N/A"}</td>
                <td>${p.observaciones || "N/A"}</td>
            </tr>
        `;
    }

    html += "</tbody></table>";
    tablaPuertosVer.innerHTML = html;

    modalVerPunto.style.display = "flex";
}

/* ==================================== */
/* === FUNCIÓN PARA ABRIR MODAL EDITAR (LEER para llenar formulario) === */
/* ==================================== */
function abrirModalEditar() {
    if (!puntoActual) return;

    // 1. LEER datos de localStorage
    const datosGuardados = JSON.parse(localStorage.getItem(puntoActual.id)) || {};
    
    // 2. Rellenar campos del formulario de edición del Switch
    switchNombreInput.value = datosGuardados.nombre || ""; 
    switchUbicacionInput.value = datosGuardados.ubicacion || "";
    switchSerieInput.value = datosGuardados.serie || ""; 
    switchMacInput.value = datosGuardados.mac || "";

    // 3. Rellenar campos de Puertos (Se asume que los 30 IDs existen en el HTML)
    const puertos = datosGuardados.puertos || [];

    for (let i = 1; i <= NUM_PUERTOS; i++) {
        const p = puertos[i - 1] || {};
        
        // Asignar valores a los campos de cada puerto usando sus IDs
        const nombreInput = document.getElementById(`nombre-punto-${i}`);
        const localizacionInput = document.getElementById(`localizacion-punto-${i}`);
        const obsTextarea = document.getElementById(`observaciones-punto-${i}`);
        
        if (nombreInput) nombreInput.value = p.nombre || "";
        if (localizacionInput) localizacionInput.value = p.localizacion || "";
        if (obsTextarea) obsTextarea.value = p.observaciones || "";
    }
    
    // 4. Actualizar título del modal de editar
    tituloEditarPunto.textContent = `EDITAR SWITCH: ${datosGuardados.nombre || 'N/A'}`;

    modalVerPunto.style.display = "none";
    modalEditarPunto.style.display = "flex";
}


/* ================================= */
/* === FUNCIÓN PARA GUARDAR DATOS (GLOBAL) === */
/* ================================= */
async function guardarDatosSwitch() {

    const puertos = [];
    for (let i = 1; i <= NUM_PUERTOS; i++) {
        puertos.push({
            numero: i,
            nombre: document.getElementById(`nombre-punto-${i}`).value,
            localizacion: document.getElementById(`localizacion-punto-${i}`).value,
            observaciones: document.getElementById(`observaciones-punto-${i}`).value
        });
    }

    const data = {
        id_switch: puntoActual.dataset.idSwitch || null,
        nombre: switchNombreInput.value,
        ubicacion: switchUbicacionInput.value,
        serie: switchSerieInput.value,
        mac: switchMacInput.value,
        id_zona: 11, // POSGRADOS
        puertos
    };

    const resp = await fetch("../php/procesar_switch.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const json = await resp.json();

    if (json.success) {
        alert("Switch guardado correctamente");
        modalEditarPunto.style.display = "none";
    } else {
        alert("Error: " + json.message);
    }
}

/* ================================== */
/* === FUNCIÓN DE CARGA INICIAL Y EVENTOS === */
/* ================================== */
function inicializarEventos() {
    // 1. ESTABLECER EL PUNTO ACTUAL AL CARGAR LA PÁGINA
    const switchPunto = document.getElementById("punto-switch-01"); 
    
    if (switchPunto) {
        puntoActual = switchPunto; 

        // Asignar evento de click para abrir el modal de Ver
        switchPunto.addEventListener("click", () => {
            abrirModalVer(puntoActual);
        });
        
        // Evento para pasar de Ver a Editar 
        btnEditarInfo.addEventListener("click", abrirModalEditar);
    } else {
        console.error("ERROR CRÍTICO: No se encontró el elemento con ID 'punto-switch-01'.");
    }

    // 2. Evento para GUARDAR
    guardarPuntoBtn.addEventListener("click", async () => {

    const puertos = [];
    for (let i = 1; i <= NUM_PUERTOS; i++) {
        puertos.push({
            numero: i,
            nombre: document.getElementById(`nombre-punto-${i}`).value,
            localizacion: document.getElementById(`localizacion-punto-${i}`).value,
            observaciones: document.getElementById(`observaciones-punto-${i}`).value
        });
    }

    const data = {
        accion: puntoActual?.id_switch ? "UPDATE" : "INSERT",
        id_switch: puntoActual?.id_switch || null,
        codigo_switch: "punto-switch-01",
        nombre: switchNombreInput.value,
        ubicacion: switchUbicacionInput.value,
        serie: switchSerieInput.value,
        mac: switchMacInput.value,
        id_zona: 11,
        puertos
    };

    const resp = await fetch("../php/procesar_switch.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const json = await resp.json();

    if (json.success) {
        alert("Switch guardado correctamente");
        modalEditarPunto.style.display = "none";
        cargarSwitchDesdeBD();
    } else {
        alert(json.message);
    }
});

//evento eliminar
    eliminarPuntoBtn.addEventListener("click", async () => {
    if (!puntoActual) return;

    const confirmar = confirm("¿Estás seguro de que quieres eliminar este switch y todos sus puertos?");
    if (!confirmar) return;

    try {
        const response = await fetch("../php/procesar_switch.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accion: "DELETE",
                id_switch: puntoActual.id // EJ: punto-switch-01
            })
        });

        const json = await response.json();

        if (json.success) {
            alert("Switch eliminado correctamente");

            // Cerrar modales
            modalEditarPunto.style.display = "none";
            modalVerPunto.style.display = "none";

            // Limpiar referencia
            puntoActual = null;
        } else {
            alert("Error al eliminar: " + json.message);
        }

    } catch (error) {
        console.error("Error eliminando switch:", error);
        alert("Error de conexión con el servidor");
    }
});

    
    // 4. Eventos para cerrar los modales
    const cerrarBtns = document.querySelectorAll('#cerrar-ver, #cerrar-ver-btn, #cerrar-punto, #cerrar-punto-btn');
    cerrarBtns.forEach(btn => {
        btn.onclick = () => {
            modalVerPunto.style.display = "none";
            modalEditarPunto.style.display = "none";
        };
    });
    
    // 5. Cerrar al hacer clic fuera
    window.onclick = e => {
        if (e.target == modalVerPunto) modalVerPunto.style.display = "none";
        if (e.target == modalEditarPunto) modalEditarPunto.style.display = "none";
    };
}


/* ================================ */
/* === EJECUTAR AL CARGAR LA PÁGINA === */
/* ================================ */
document.addEventListener("DOMContentLoaded", () => {
    cargarSwitchDesdeBD();
    inicializarEventos();
});

