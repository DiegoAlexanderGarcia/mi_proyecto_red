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
const tituloVerPunto = document.getElementById("titulo-ver-punto");


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


let SWITCHES = [];

async function cargarSwitchesZona(idZona) {
    const r = await fetch(`../php/obtener_switch.php?id_zona=${idZona}`);
    const j = await r.json();
    SWITCHES = j.data || [];

    const select = document.getElementById("switch-id");
    select.innerHTML = `<option value="">(Sin switch)</option>` +
        SWITCHES.map(s => `<option value="${s.id_switch}">${s.nombre}</option>`).join("");
}



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
    const codigo = elemento.id; // "punto-switch-01"

    // buscar en BD por codigo_switch
    const sw = window.SWITCHES_DB.find(x => x.codigo_switch === codigo) || null;

    puntoActual = elemento;

    // si existe en BD, guardo id_switch en dataset
    if (sw) {
        puntoActual.dataset.idSwitch = sw.id_switch;
    } else {
        delete puntoActual.dataset.idSwitch; // es NUEVO
    }

    // ✅ Mensaje en el título (y datos por defecto)
    if (!sw) {
        tituloVerPunto.textContent = "Información del Switch (NO registrado en BD)";
        verSwitchNombre.textContent = "Sin asignar";
        verSwitchUbicacion.textContent = "N/A";
        verSwitchSerie.textContent = "N/A";
        verSwitchMac.textContent = "N/A";
    } else {
        tituloVerPunto.textContent = "Información del Switch";
        verSwitchNombre.textContent = sw.nombre || "Sin asignar";
        verSwitchUbicacion.textContent = sw.ubicacion || "N/A";
        verSwitchSerie.textContent = sw.numero_serie || "N/A";
        verSwitchMac.textContent = sw.mac || "N/A";
    }

    // abrir modal SIEMPRE
    modalVerPunto.style.display = "flex";
}



/* ==================================== */
/* === FUNCIÓN PARA ABRIR MODAL EDITAR (LEER para llenar formulario) === */
/* ==================================== */
function abrirModalEditar() {
    if (!puntoActual) return;

    const codigo = puntoActual.id;
    const sw = window.SWITCHES_DB.find(x => x.codigo_switch === codigo) || null;

    if (sw) {
        // existe en BD: precarga datos
        switchNombreInput.value = sw.nombre || "";
        switchUbicacionInput.value = sw.ubicacion || "";
        switchSerieInput.value = sw.numero_serie || "";
        switchMacInput.value = sw.mac || "";
        puntoActual.dataset.idSwitch = sw.id_switch;
    } else {
        // NO existe: campos vacíos para capturar info nueva
        switchNombreInput.value = "";
        switchUbicacionInput.value = "";
        switchSerieInput.value = "";
        switchMacInput.value = "";
        delete puntoActual.dataset.idSwitch;
    }

    tituloEditarPunto.textContent = `EDITAR SWITCH: ${codigo}`;

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

    const idSwitchBD = puntoActual.dataset.idSwitch ? Number(puntoActual.dataset.idSwitch) : null;

    const data = {
        accion: idSwitchBD ? "UPDATE" : "INSERT",
        id_switch: idSwitchBD,
        codigo_switch: puntoActual.id,          // ✅ clave para encontrarlo después
        nombre: switchNombreInput.value.trim() || "Sin asignar",
        ubicacion: switchUbicacionInput.value.trim() || "N/A",
        numero_serie: switchSerieInput.value.trim() || "N/A",
        mac: switchMacInput.value.trim() || "N/A",
        id_zona: 11
    };

    const resp = await fetch("../php/procesar_switch.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const json = await resp.json();

    if (json.success) {
        // ✅ si fue INSERT, guarda el id nuevo en el dataset
        if (!idSwitchBD && json.id_switch) {
            puntoActual.dataset.idSwitch = json.id_switch;
        }

        // recarga BD y vuelve a abrir el modal ver actualizado
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
    await cargarSwitchDesdeBD();  // ✅ espera a que llegue la data
    inicializarEventos();
});


