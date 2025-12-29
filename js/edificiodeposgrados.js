window.SWITCHES_DB = [];

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

        window.SWITCHES_DB = json.data;

        console.log("RESPUESTA obtener_switch:", json);
        console.log("SWITCHES_DB cargado:", window.SWITCHES_DB);
    } catch (e) {
        console.error("Error cargando switch:", e);
    }
}

/* ================================== */
/* === FUNCIÓN PARA ABRIR MODAL VER (LEER) === */
/* ================================== */
function abrirModalVer(elemento) {
    puntoActual = elemento;

    const swBD = window.SWITCHES_DB?.[0] || null;

    // 1) Si hay switch en BD: úsalo
    if (swBD) {
        puntoActual.dataset.idSwitch = swBD.id_switch;

        verSwitchNombre.textContent = swBD.nombre || "Sin asignar";
        verSwitchUbicacion.textContent = swBD.ubicacion || "N/A";
        verSwitchSerie.textContent = swBD.serie || "N/A";
        verSwitchMac.textContent = swBD.mac || "N/A";

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
            const p = swBD.puertos?.find(x => Number(x.numero) === i) || {};
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
        return;
    }

    // 2) Si NO hay switch en BD: usa localStorage
    const ls = JSON.parse(localStorage.getItem(puntoActual.id)) || null;

    verSwitchNombre.textContent = ls?.nombre || "Sin asignar";
    verSwitchUbicacion.textContent = ls?.ubicacion || "N/A";
    verSwitchSerie.textContent = ls?.serie || "N/A";
    verSwitchMac.textContent = ls?.mac || "N/A";

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
        const p = ls?.puertos?.find(x => Number(x.numero) === i) || {};
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

    // NO alert, solo mostramos modal
    modalVerPunto.style.display = "flex";
}


/* ==================================== */
/* === FUNCIÓN PARA ABRIR MODAL EDITAR (LEER para llenar formulario) === */
/* ==================================== */
function abrirModalEditar() {
    if (!puntoActual) return;

    const sw = window.SWITCHES_DB?.[0] || null;

    // si hay switch en BD, úsalo; si no, usa localStorage
    const datosGuardados = sw ? {
        nombre: sw.nombre,
        ubicacion: sw.ubicacion,
        serie: sw.serie,
        mac: sw.mac,
        puertos: sw.puertos
    } : (JSON.parse(localStorage.getItem(puntoActual.id)) || {});

    // 3. Rellenar campos de Puertos (Se asume que los 30 IDs existen en el HTML)
    const puertos = datosGuardados.puertos || [];

    for (let i = 1; i <= NUM_PUERTOS; i++) {
        const p = Array.isArray(datosGuardados.puertos)
            ? (datosGuardados.puertos.find(x => Number(x.numero) === i) || {})
            : {};

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

    if (!puntoActual) {
        alert("Primero selecciona el switch.");
        return;
    }


    const puertos = [];
    for (let i = 1; i <= NUM_PUERTOS; i++) {
        puertos.push({
            numero: i,
            nombre: document.getElementById(`nombre-punto-${i}`).value,
            localizacion: document.getElementById(`localizacion-punto-${i}`).value,
            observaciones: document.getElementById(`observaciones-punto-${i}`).value
        });
    }

    const idSwitchBD = puntoActual.dataset.idSwitch ? Number(puntoActual.dataset.idSwitch) : null;

    const data = {
        accion: idSwitchBD ? "UPDATE" : "INSERT",
        id_switch: idSwitchBD,
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

        if (!idSwitchBD && json.id_switch) {
            puntoActual.dataset.idSwitch = json.id_switch;
        }

        localStorage.setItem(
            puntoActual.id,
            JSON.stringify({
                nombre: data.nombre,
                ubicacion: data.ubicacion,
                serie: data.serie,
                mac: data.mac,
                puertos: data.puertos
            })
        );

        await cargarSwitchDesdeBD();
        abrirModalVer(puntoActual);

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
    guardarPuntoBtn.addEventListener("click", guardarDatosSwitch);


    //evento eliminar
    eliminarPuntoBtn.addEventListener("click", async () => {
        if (!puntoActual) return;

        const idSwitchBD = puntoActual.dataset.idSwitch ? Number(puntoActual.dataset.idSwitch) : null;
        if (!idSwitchBD) {
            alert("Este switch aún no está en la BD.");
            return;
        }

        const confirmar = confirm("¿Estás seguro de que quieres eliminar este switch y todos sus puertos?");
        if (!confirmar) return;

        try {
            const response = await fetch("../php/procesar_switch.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accion: "eliminar_switch",
                    id_switch: idSwitchBD
                })
            });

            const json = await response.json();

            if (json.success) {
                alert("Switch eliminado correctamente");

                // limpiar localStorage también
                localStorage.removeItem(puntoActual.id);

                // cerrar modales
                modalEditarPunto.style.display = "none";
                modalVerPunto.style.display = "none";

                // recargar lista desde BD
                await cargarSwitchDesdeBD();
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
document.addEventListener("DOMContentLoaded", async () => {
    await cargarSwitchDesdeBD();
    inicializarEventos();
});


