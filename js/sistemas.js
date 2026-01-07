// ===================================
// 1. VARIABLES FIJAS (NO CAMBIAN POR SWITCH)
// ===================================
const NUM_PUERTOS = 30;
const empty = 'N/A';

let switchSeleccionado = null; // switchId actual (switch-1-data o switch-2-data)
window.SWITCHES_DB = [];

// Elementos DOM de los modales (solo se buscan una vez)
const modalFondo = document.getElementById('modalFondo');
const modalEditar = document.getElementById('modalEditar');
const cerrarBtn = document.getElementById('cerrarBtn');
const cerrarX = document.getElementById('cerrarX');
const editarBtn = document.getElementById('editarBtn');
const cerrarEditarBtn = document.getElementById('cerrarEditarBtn');
const cerrarEditarX = document.getElementById('cerrarEditarX');
const formEditar = document.getElementById('formEditar');
const eliminarBtn = document.getElementById('eliminarBtn');

// Elementos de información en el modal de vista (se rellenan dinámicamente)
const tituloModal = document.getElementById('titulo');
const switchNombreInfo = document.getElementById('switchNombreInfo');
const switchUbicacionInfo = document.getElementById('switchUbicacionInfo');
const serieInfo = document.getElementById('serieInfo');
const macInfo = document.getElementById('macInfo');
const contenedorPuertos = document.getElementById('contenedorPuertos'); // Contenedor en Modal EDITAR
const puertosVistaContenedor = document.getElementById('puertos-vista-contenedor');

// Campos generales del formulario de edición (se rellenan dinámicamente)
const switchNombre = document.getElementById('switchNombre');
const switchUbicacion = document.getElementById('switchUbicacion');
const serie = document.getElementById('serie');
const mac = document.getElementById('mac');

// ===================================
// 2. FUNCIONES DE LÓGICA (USAN switchId)
// ===================================

// Devuelve un objeto de datos por defecto (con 30 puertos vacíos)
function getDefaultData() {
    const puertos = {};
    for (let i = 1; i <= NUM_PUERTOS; i++) {
        puertos[`puerto${i}`] = { nombre: 'N/A', localizacion: 'N/A', obs: 'N/A' };
    }
    return {
        switchNombre: 'Sin Asignar',
        switchUbicacion: 'N/A',
        serie: 'N/A',
        mac: 'N/A',
        puertos: puertos
    };
}

// Carga los datos desde localStorage usando la clave única (switchId)
function cargarDatos(switchId) {
    const savedData = localStorage.getItem(switchId);
    return savedData ? JSON.parse(savedData) : getDefaultData();
}

async function cargarSwitchesDesdeBD(idZona) {
    try {
        const resp = await fetch(`../php/obtener_switch.php?id_zona=${idZona}`);
        const json = await resp.json();

        if (!json?.success) {
            console.error("Error al cargar switches:", json?.message || "desconocido");
            window.SWITCHES_DB = [];
            return;
        }

        window.SWITCHES_DB = json.data || [];
    } catch (e) {
        console.error("Error al cargar switches:", e);
        window.SWITCHES_DB = [];
    }
}

function getSwitchBD(codigoSwitch) {
    return (window.SWITCHES_DB || []).find(x => x.codigo_switch === codigoSwitch) || null;
}

/**
 * Rellena el Modal de Vista con los datos actuales, usando una TABLA para puertos.
 * ESTA ES LA FUNCIÓN MODIFICADA PARA MOSTRAR TABLA.
 */
function actualizarVista(switchId, data) {

    if (!data) {
        console.warn("actualizarVista recibió data undefined. switchId:", switchId);
        data = getDefaultData();
    }

    // 1. Datos Generales del Switch
    tituloModal.textContent = `Información del Switch: ${data.switchNombre || empty}`;

    // Rellenar las filas de información general
    switchNombreInfo.innerHTML = `<i class="fa-solid fa-tag icon-blue"></i> Nombre: <strong>${data.switchNombre || 'Sin Asignar'}</strong>`;
    switchUbicacionInfo.innerHTML = `<i class="fa-solid fa-location-dot icon-blue"></i> Ubicación: <strong>${data.switchUbicacion || empty}</strong>`;
    serieInfo.innerHTML = `<i class="fa-solid fa-barcode icon-blue"></i> No. de Serie: <strong>${data.serie || empty}</strong>`;
    macInfo.innerHTML = `<i class="fa-solid fa-wifi icon-blue"></i> MAC: <strong>${data.mac || empty}</strong>`;

    // Asegurarse de que las filas de info general estén visibles
    switchNombreInfo.style.display = 'flex';
    switchUbicacionInfo.style.display = 'flex';
    serieInfo.style.display = 'flex';
    macInfo.style.display = 'flex';

    // 2) NO mostrar tabla de puertos en el modal de vista
    if (puertosVistaContenedor) {
        puertosVistaContenedor.innerHTML = ""; // deja limpio
        puertosVistaContenedor.style.display = "none"; // opcional: oculta el espacio
    }
}

/**
 * Rellena el Modal de Edición con los datos para editar
 */
function cargarDatosEditar(switchId) {
    const data = cargarDatos(switchId);

    // Título del modal de edición
    const tituloEditar = document.querySelector('#modalEditar h2');
    tituloEditar.textContent = `EDITAR SWITCH: ${data.switchNombre || 'N/A'}`;

    // Datos generales
    switchNombre.value = data.switchNombre === 'Sin Asignar' ? '' : data.switchNombre;
    switchUbicacion.value = data.switchUbicacion === 'N/A' ? '' : data.switchUbicacion;
    serie.value = data.serie === 'N/A' ? '' : data.serie;
    mac.value = data.mac === 'N/A' ? '' : data.mac;
}

// ===================================
// FUNCIONALIDAD DE DETALLE DE PUERTO 
// ===================================

// Función para cerrar el Modal de Vista y restaurar la vista completa (la tabla)
function cerrarModalVista(switchId) {
    if (switchId) {
        // Llama a actualizarVista para restaurar la vista completa (con la tabla)
        actualizarVista(switchId, cargarDatos(switchId));
    }

    modalFondo.style.display = 'none';
}

// ===================================
// 3. FUNCIÓN PRINCIPAL DE CONFIGURACIÓN
// ===================================

/**
 * Configura los eventos para un icono de switch específico.
 */
function setupSwitch(iconoServidor) {

    editarBtn.onclick = () => {
        if (!switchSeleccionado) return alert("Abre un switch primero.");
        cargarDatosEditar(switchSeleccionado);
        modalFondo.style.display = 'none';
        modalEditar.style.display = 'flex';
    };

    eliminarBtn.onclick = async () => {
        if (!switchSeleccionado) return alert("Abre un switch primero.");

        const data = cargarDatos(switchSeleccionado);
        if (!confirm(`¿Eliminar el switch "${data.switchNombre || 'N/A'}"?`)) return;

        const ID_ZONA = 18; // o el que corresponda en esa página
        const DB_ID_KEY = `${switchSeleccionado}-dbid`;
        const dbid = localStorage.getItem(DB_ID_KEY);

        // 1) borrar en BD si existe
        if (dbid) {
            const json = await eliminarSwitchBD(Number(dbid));
            if (!json.success) return alert("Error eliminando en BD");
        }

        // 2) borrar localStorage
        localStorage.removeItem(switchSeleccionado);
        localStorage.removeItem(DB_ID_KEY);

        // 3) refrescar el modal con datos vacíos
        actualizarVista(switchSeleccionado, getDefaultData());

        // opcional: cerrar modal
        modalFondo.style.display = 'none';

        alert("✅ Switch eliminado.");
    };

    // Asignar el cierre con el switchId para restaurar la vista completa
    cerrarBtn.addEventListener('click', () => cerrarModalVista(switchId));
    cerrarX.addEventListener('click', () => cerrarModalVista(switchId));

    const switchId = iconoServidor.dataset.switchId;
    actualizarVista(switchId, cargarDatos(switchId));

    const ID_ZONA = 18; // SISTEMAS
    const DB_ID_KEY = `${switchId}-dbid`; // guarda el id_switch de la BD
    const swBDInit = getSwitchBD(switchId);
    if (swBDInit?.id_switch) {
        localStorage.setItem(DB_ID_KEY, String(swBDInit.id_switch));
    } else {
        localStorage.removeItem(DB_ID_KEY);
    }

    // Abrir Modal de Vista (clic en el ícono del servidor)
    iconoServidor.addEventListener("click", () => {
        switchSeleccionado = switchId;

        const swBD = getSwitchBD(switchId);

        // si existe en BD, úsalo; si no, usa localStorage
        const data = swBD
            ? {
                switchNombre: swBD.nombre,
                switchUbicacion: swBD.ubicacion,
                serie: swBD.numero_serie,   // ojo nombre de columna
                mac: swBD.mac
            }
            : cargarDatos(switchId);

        actualizarVista(switchId, data);
        modalFondo.style.display = "flex";
    });

    // Abrir Modal de Edición (Desde el modal de vista)
    editarBtn.onclick = () => {
        cargarDatosEditar(switchId);
        modalFondo.style.display = 'none';
        modalEditar.style.display = 'flex';
    };

    // Guardar datos (Submit del formulario)
    formEditar.onsubmit = async (e) => {
        e.preventDefault();

        // 1) Datos generales
        const dataToSave = {
            switchNombre: switchNombre.value.trim() || 'Sin Asignar',
            switchUbicacion: switchUbicacion.value.trim() || 'N/A',
            serie: serie.value.trim() || 'N/A',
            mac: mac.value.trim() || 'N/A'
        };

        // 2) Puertos (30)

        // 3) Guardar en BD
        const id_switch_bd = localStorage.getItem(DB_ID_KEY);
        const payload = {
            id_switch: id_switch_bd ? Number(id_switch_bd) : null,
            nombre: dataToSave.switchNombre,
            ubicacion: dataToSave.switchUbicacion,
            numero_serie: dataToSave.serie,
            mac: dataToSave.mac,
            id_zona: ID_ZONA,
            codigo_switch: switchId
        };

        const json = await guardarSwitchEnBD(payload);

        if (!json.success) {
            alert("Error al guardar en BD: " + (json.message || "desconocido"));
            return;
        }

        // 4) Guardar también en localStorage (Req.1)
        localStorage.setItem(switchId, JSON.stringify(dataToSave));
        localStorage.setItem(DB_ID_KEY, String(json.id_switch));

        // 5) Refrescar UI
        actualizarVista(switchId, cargarDatos(switchId));

        modalEditar.style.display = 'none';
        modalFondo.style.display = 'flex';
        alert(`✅ Switch guardado (BD id=${json.id_switch})`);
    };

    // Eliminar datos (Botón ELIMINAR SWITCH)
    eliminarBtn.onclick = async () => {
        const data = cargarDatos(switchId);
        const confirmar = confirm(`¿Eliminar el switch "${data.switchNombre || 'N/A'}"?`);
        if (!confirmar) return;

        const DB_ID_KEY = `${switchId}-dbid`;
        const dbid = localStorage.getItem(DB_ID_KEY);

        // borrar en BD
        if (dbid) {
            const json = await eliminarSwitchBD(Number(dbid));
            if (!json.success) {
                alert("Error eliminando en BD");
                return;
            }
        }

        // borrar localStorage
        localStorage.removeItem(switchId);
        localStorage.removeItem(DB_ID_KEY);

        actualizarVista(switchId, getDefaultData());

        modalEditar.style.display = 'none';
        modalFondo.style.display = 'none';

        alert("✅ Switch eliminado.");
    };
}

// ===================================
// 4. INICIALIZACIÓN
// ===================================

// Cierres de Modal de Edición
if (cerrarEditarBtn) {
    cerrarEditarBtn.addEventListener('click', () => modalEditar.style.display = 'none');
}

cerrarEditarX.addEventListener('click', () => modalEditar.style.display = 'none');

document.addEventListener("DOMContentLoaded", () => {
    // Configurar CADA SWITCH EN LA PÁGINA
    // Importante: Asegúrate de que tus iconos de switch tienen la clase .fa-server y el atributo data-switch-id="[ID_UNICO]"
    const todosLosIconos = document.querySelectorAll('.fa-server[data-switch-id]');

    if (todosLosIconos.length === 0) {
        console.warn("No se encontraron elementos con la clase '.fa-server' y el atributo 'data-switch-id'. Asegúrate de tener switches definidos en tu HTML.");
    }

    (async () => {
        await cargarSwitchesDesdeBD(18);
        todosLosIconos.forEach(icono => {
            setupSwitch(icono);
        });
    })();
});

// =============================
// VARIABLES GENERALES
// =============================

const modalVerPunto = document.getElementById("modal-ver-punto");
const modalEditarPunto = document.getElementById("modal-editar-punto");

const cerrarVerBtn = document.getElementById("cerrar-ver");
const cerrarVerBtn2 = document.getElementById("cerrar-ver-btn");
const cerrarPuntoBtn = document.getElementById("cerrar-punto");
const cerrarPuntoBtn2 = document.getElementById("cerrar-punto-btn");

const btnEditarInfo = document.getElementById("btn-editar-info");
const guardarPuntoBtn = document.getElementById("guardar-punto");
const eliminarPuntoBtn = document.getElementById("eliminar-punto");

// Campos Ver
const verUsuarioPuesto = document.getElementById("ver-Usuario-Puesto");
const verNombrePuesto = document.getElementById("ver-nombre-puesto");
const verEstadoPunto = document.getElementById("ver-estado-punto");
const verEquiposConectados = document.getElementById("ver-equipos-conectados");
const verIdPunto = document.getElementById("ver-id-punto");
const verPatchPanel = document.getElementById("ver-patch-panel");
const verSwitch = document.getElementById("ver-switch");
const verCentroCableado = document.getElementById("ver-centro-cableado");
const verObservaciones = document.getElementById("ver-observaciones");

// Campos Editar
const usuarioPuestoInput = document.getElementById("ver-Usuario-Puesto-input");
const nombrePuestoInput = document.getElementById("nombre-puesto");
const estadoPuntoSelect = document.getElementById("estado-punto");
const idPuntoInput = document.getElementById("id-punto");
const patchPanelInput = document.getElementById("patch-panel");
const switchInput = document.getElementById("switch");
const centroCableadoInput = document.getElementById("centro-cableado");
const observacionesTextarea = document.getElementById("observaciones");

// Campo oculto del ID REAL
const idPuntoRealInput = document.createElement("input");
idPuntoRealInput.type = "hidden";
idPuntoRealInput.id = "id-punto-real";
document.body.appendChild(idPuntoRealInput);

// Multiselect
const multiselectButton = document.getElementById("multiselect-button");
const multiselectDropdown = document.getElementById("multiselect-dropdown");
const multiselectCheckboxes = multiselectDropdown.querySelectorAll('input[type="checkbox"]');

let puntoActual = null;
window.PUNTOS_DB = [];


// =============================
// CARGAR BD DESDE PHP
// =============================
async function cargarDatosDesdeBD() {
    try {
        const response = await fetch("../php/obtener_puntos.php");
        const json = await response.json();

        if (json.success) {
            window.PUNTOS_DB = json.data;
        } else {
            console.error("Error al cargar puntos:", json.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
cargarDatosDesdeBD();


// =============================
// MULTISELECT
// =============================
function updateMultiselectText() {
    const checked = Array.from(multiselectCheckboxes).filter(cb => cb.checked);
    if (checked.length === 0) multiselectButton.textContent = "Seleccionar Equipos...";
    else if (checked.length === 1) multiselectButton.textContent = checked[0].value;
    else multiselectButton.textContent = `${checked.length} Equipos Seleccionados`;
}

multiselectButton.addEventListener("click", (e) => {
    e.stopPropagation();
    multiselectDropdown.style.display = multiselectDropdown.style.display === "block" ? "none" : "block";
});
window.addEventListener("click", () => {
    multiselectDropdown.style.display = "none";
});
multiselectDropdown.addEventListener("change", updateMultiselectText);


// =============================
// CARGAR ESTADO INICIAL (LOCALSTORAGE)
// =============================
function cargarEstadoInicial() {
    const puntos = document.querySelectorAll(".punto");
    puntos.forEach(p => {
        const datos = JSON.parse(localStorage.getItem(p.id));
        if (datos?.estado) {
            p.classList.remove("activo", "inactivo");
            p.classList.add(datos.estado);
        }
    });
}


// =============================
// CLICK EN UN PUNTO
// =============================
document.querySelectorAll(".punto").forEach(punto => {
    punto.addEventListener("click", () => {
        puntoActual = punto;


        // Intentar obtener info desde BD
        const dbItem = window.PUNTOS_DB.find(x => x.id_punto_codigo === punto.id);

        if (dbItem) {
            idPuntoRealInput.value = dbItem.id_punto;
            verUsuarioPuesto.textContent = dbItem.usuario || "Sin Usuario";
            verNombrePuesto.textContent = dbItem.puesto || "Sin puesto";
            verEstadoPunto.textContent = dbItem.estado || "N/A";
            verEquiposConectados.textContent = dbItem.equipos_conectados || "N/A";
            verIdPunto.textContent = dbItem.id_punto_codigo || "N/A";
            verPatchPanel.textContent = dbItem.patch_panel || "N/A";
            verSwitch.textContent = dbItem.switch_asociado || "N/A";
            verCentroCableado.textContent = dbItem.centro_cableado || "N/A";
            verObservaciones.textContent = dbItem.observaciones || "N/A";
        }

        modalVerPunto.style.display = "flex";
    });
});


// =============================
// EDITAR PUNTO
// =============================
btnEditarInfo.addEventListener("click", () => {

    const dbItem = window.PUNTOS_DB.find(x => x.id_punto === Number(idPuntoRealInput.value));

    usuarioPuestoInput.value = dbItem?.usuario || "";
    nombrePuestoInput.value = dbItem?.puesto || "";
    estadoPuntoSelect.value = dbItem?.estado || "activo";
    idPuntoInput.value = dbItem?.id_punto_codigo || "";
    patchPanelInput.value = dbItem?.patch_panel || "";
    switchInput.value = dbItem?.switch_asociado || "";
    centroCableadoInput.value = dbItem?.centro_cableado || "";
    observacionesTextarea.value = dbItem?.observaciones || "";

    // Equipos
    const equipos = dbItem?.equipos_conectados?.split(", ") || [];
    multiselectCheckboxes.forEach(cb => cb.checked = equipos.includes(cb.value));
    updateMultiselectText();

    modalVerPunto.style.display = "none";
    modalEditarPunto.style.display = "flex";
});


// =============================
// GUARDAR (INSERT / UPDATE)
// =============================
guardarPuntoBtn.addEventListener("click", async () => {

    const equiposSeleccionados = Array.from(multiselectCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value)
        .join(", ");

    const idReal = idPuntoRealInput.value;

    const datos = {
        accion: idReal ? "UPDATE" : "INSERT",
        id_punto: idReal || null,
        id_punto_codigo: puntoActual.id,
        usuario: usuarioPuestoInput.value,
        puesto: nombrePuestoInput.value,
        estado: estadoPuntoSelect.value,
        equipos_conectados: equiposSeleccionados,
        patch_panel: patchPanelInput.value,
        switch_asociado: switchInput.value,
        centro_cableado: centroCableadoInput.value,
        observaciones: observacionesTextarea.value,
        id_zona: 18 // ZONA = SISTEMA
    };

    const resp = await fetch("../php/procesar_datos.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([datos])
    });

    const json = await resp.json();

    if (json.success) {
        alert("Guardado correctamente en BD");
        modalEditarPunto.style.display = "none";
        cargarDatosDesdeBD();
    } else {
        alert("Error: " + json.message);
    }
});


// =============================
// ELIMINAR
// =============================
eliminarPuntoBtn.addEventListener("click", async () => {
    const idReal = idPuntoRealInput.value;

    if (!idReal) {
        alert("Este punto aún no está en la BD.");
        return;
    }

    if (!confirm("¿Eliminar este punto permanentemente?")) return;

    const data = [{ accion: "DELETE", id_punto: idReal }];

    const resp = await fetch("../php/procesar_datos.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const json = await resp.json();

    if (json.success) {
        alert("Punto eliminado correctamente");

        // 1. Resetear datos visibles en el modal
        verUsuarioPuesto.textContent = "";
        verNombrePuesto.textContent = "";
        verEstadoPunto.textContent = "";
        verEquiposConectados.textContent = "";
        verIdPunto.textContent = "";
        verPatchPanel.textContent = "";
        verSwitch.textContent = "";
        verCentroCableado.textContent = "";
        verObservaciones.textContent = "";

        // 2. Resetear el icono visual a estado por defecto
        puntoActual.classList.remove("activo", "inactivo");
        puntoActual.classList.add("activo");

        // 3. Borrar referencia interna del punto editado
        puntoActual = null;

        // 4. Cerrar el modal
        modalEditarPunto.style.display = "none";

        cargarDatosDesdeBD();
    } else {
        alert("Error: " + json.message);
    }
});


// =============================
// CERRAR MODALES
// =============================
cerrarVerBtn.onclick = () => modalVerPunto.style.display = "none";
cerrarVerBtn2.onclick = () => modalVerPunto.style.display = "none";
cerrarPuntoBtn.onclick = () => modalEditarPunto.style.display = "none";
cerrarPuntoBtn2.onclick = () => modalEditarPunto.style.display = "none";


// =============================
// INICIO
// =============================
document.addEventListener("DOMContentLoaded", cargarEstadoInicial);
