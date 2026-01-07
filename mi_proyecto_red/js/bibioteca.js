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

// Campo oculto del ID REAL (Lo hacemos let para reasignar si es necesario)
let idPuntoRealInput = document.getElementById("id-punto-real");
if (!idPuntoRealInput) {
    // Si no existía en el HTML, lo creamos y agregamos al body
    idPuntoRealInput = document.createElement("input");
    idPuntoRealInput.type = "hidden";
    idPuntoRealInput.id = "id-punto-real";
    document.body.appendChild(idPuntoRealInput);
}

// Multiselect
const multiselectButton = document.getElementById("multiselect-button");
const multiselectDropdown = document.getElementById("multiselect-dropdown");
const multiselectCheckboxes = multiselectDropdown ? multiselectDropdown.querySelectorAll('input[type="checkbox"]') : [];

let puntoActual = null;
window.PUNTOS_DB = [];


// =============================
// LÓGICA DE PINTADO DEL MAPA
// =============================

/**
 * Pinta el estado de todos los iconos en el mapa usando los datos de la BD.
 */
function pintarMapaSegunDB() {
    const puntosDOM = document.querySelectorAll(".punto");
    puntosDOM.forEach(punto => {
        const dbItem = window.PUNTOS_DB.find(x => x.id_punto_codigo === punto.id);
        
        // 1. Limpiamos las clases de estado existentes
        punto.classList.remove("activo", "inactivo");

        if (dbItem && dbItem.estado) {
            // 2. Si tiene datos en la BD, usa el estado guardado
            punto.classList.add(dbItem.estado.toLowerCase());
        } else {
            // 3. Si no tiene datos en la BD (aún no se ha guardado), lo dejamos como 'activo' por defecto
            // Esto le da una apariencia inicial, pero al hacer clic se sabrá que no está en la BD.
            punto.classList.add("activo");
        }
    });
}


// =============================
// CARGAR BD DESDE PHP
// =============================
async function cargarDatosDesdeBD() {
    try {
        const response = await fetch("../php/obtener_puntos.php");
        const json = await response.json();

        if (json.success) {
            window.PUNTOS_DB = json.data;
            // Después de cargar los datos, pintamos el mapa
            pintarMapaSegunDB(); 
        } else {
            console.error("Error al cargar puntos:", json.message);
        }
    } catch (error) {
        console.error("Error al conectar con la BD:", error);
    }
}


// =============================
// MULTISELECT
// =============================
function updateMultiselectText() {
    const checked = Array.from(multiselectCheckboxes).filter(cb => cb.checked);
    if (checked.length === 0) multiselectButton.textContent = "Seleccionar Equipos...";
    else if (checked.length === 1) multiselectButton.textContent = checked[0].value;
    else multiselectButton.textContent = `${checked.length} Equipos Seleccionados`;
}

if (multiselectButton && multiselectDropdown) {
    multiselectButton.addEventListener("click", (e) => {
        e.stopPropagation();
        multiselectDropdown.style.display = multiselectDropdown.style.display === "block" ? "none" : "block";
    });
    window.addEventListener("click", (e) => {
        if (multiselectDropdown.style.display === "block" && !multiselectButton.contains(e.target) && !multiselectDropdown.contains(e.target)) {
            multiselectDropdown.style.display = "none";
        }
    });
    multiselectDropdown.addEventListener("change", updateMultiselectText);
}


// =============================
// CLICK EN UN PUNTO (Lógica de Ver)
// =============================
document.querySelectorAll(".punto").forEach(punto => {
    punto.addEventListener("click", () => {
        puntoActual = punto;
        
        // 1. Limpiamos y establecemos valores por defecto
        idPuntoRealInput.value = ""; // Limpiamos el ID real primero
        verUsuarioPuesto.textContent = "N/A (Sin registrar)";
        verNombrePuesto.textContent = "N/A";
        verEstadoPunto.textContent = "N/A";
        verEquiposConectados.textContent = "N/A";
        verIdPunto.textContent = punto.id;
        verPatchPanel.textContent = "N/A";
        verSwitch.textContent = "N/A";
        verCentroCableado.textContent = "N/A";
        verObservaciones.textContent = "N/A";
        
        // 2. Intentar obtener info desde BD
        const dbItem = window.PUNTOS_DB.find(x => x.id_punto_codigo === punto.id);

        if (dbItem) {
            // Si el punto existe en la BD, rellenamos con sus datos
            idPuntoRealInput.value = dbItem.id_punto; // ¡ESTO ES CLAVE para saber si existe!
            verUsuarioPuesto.textContent = dbItem.usuario || "Sin Usuario";
            verNombrePuesto.textContent = dbItem.puesto || "Sin Puesto";
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
// EDITAR PUNTO (Lógica de Inicialización de Formulario)
// =============================
btnEditarInfo.addEventListener("click", () => {
    if (!puntoActual) return;
    
    // Buscar el punto en la BD usando el ID REAL que se cargó en el modal VER
    const idReal = idPuntoRealInput.value;
    const dbItem = window.PUNTOS_DB.find(x => x.id_punto === Number(idReal));
    
    // Rellenamos el formulario de edición
    usuarioPuestoInput.value = dbItem?.usuario || "";
    nombrePuestoInput.value = dbItem?.puesto || "";
    estadoPuntoSelect.value = dbItem?.estado || "activo"; // Valor por defecto si no existe
    idPuntoInput.value = dbItem?.id_punto_codigo || puntoActual.id; // Usar el ID del elemento del mapa si no está en la BD
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

    if (!puntoActual || !idPuntoInput.value.trim()) {
        alert("Seleccione un punto y asegure que el ID del punto no esté vacío.");
        return;
    }

    const equiposSeleccionados = Array.from(multiselectCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value)
        .join(", ");

    const idReal = idPuntoRealInput.value || null; // ID real (PRIMARY KEY)
    const accion = idReal ? "UPDATE" : "INSERT";
    const nuevoEstado = estadoPuntoSelect.value;
    
    const datos = {
        accion: accion,
        id_punto: idReal,
        id_punto_codigo: idPuntoInput.value.trim(), // ID del mapa (BIBLIOTECA-1)
        usuario: usuarioPuestoInput.value.trim(),
        puesto: nombrePuestoInput.value.trim(),
        estado: nuevoEstado,
        equipos_conectados: equiposSeleccionados,
        patch_panel: patchPanelInput.value.trim(),
        switch_asociado: switchInput.value.trim(),
        centro_cableado: centroCableadoInput.value.trim(),
        observaciones: observacionesTextarea.value.trim(),
        id_zona: 13 // ZONA = BIBLIOTECA
    };

    try {
        const resp = await fetch("../php/procesar_datos.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([datos])
        });

        const json = await resp.json();

        if (json.success) {
            alert("Guardado correctamente en BD: " + datos.id_punto_codigo);
            
            // 1. Cerrar modal
            modalEditarPunto.style.display = "none";
            
            // 2. Actualizar el mapa
            await cargarDatosDesdeBD(); 
            
        } else {
            alert("Error: " + json.message);
        }
    } catch (error) {
        alert("Error de comunicación: " + error.message);
    }
});


// =============================
// ELIMINAR
// =============================
eliminarPuntoBtn.addEventListener("click", async () => {
    const idReal = idPuntoRealInput.value;
    const idCodigo = puntoActual?.id || "Punto Desconocido";

    if (!idReal) {
        alert("Este punto (" + idCodigo + ") aún no está en la BD. No hay nada que eliminar.");
        return;
    }

    if (!confirm(`¿Seguro que desea eliminar el punto ${idCodigo} permanentemente de la base de datos?`)) return;

    const data = [{ accion: "DELETE", id_punto: idReal }];

    try {
        const resp = await fetch("../php/procesar_datos.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const json = await resp.json();

        if (json.success) {
            alert("Punto eliminado correctamente: " + idCodigo);

            // 1. Resetear el ID real
            idPuntoRealInput.value = "";
            
            // 2. Cerrar el modal
            modalEditarPunto.style.display = "none";
            modalVerPunto.style.display = "none";
            
            // 3. Borrar referencia interna (opcional, pero ayuda)
            puntoActual = null;
            
            // 4. Recargar datos y repintar el mapa. El punto se repintará por defecto como 'activo'.
            await cargarDatosDesdeBD();
            
        } else {
            alert("Error: " + json.message);
        }
    } catch (error) {
        alert("Error de comunicación: " + error.message);
    }
});


// =============================
// CERRAR MODALES
// =============================
cerrarVerBtn.onclick = () => modalVerPunto.style.display = "none";
cerrarVerBtn2.onclick = () => modalVerPunto.style.display = "none";
cerrarPuntoBtn.onclick = () => modalEditarPunto.style.display = "none";
cerrarPuntoBtn2.onclick = () => modalEditarPunto.style.display = "none";

window.onclick = e => {
    if (e.target === modalVerPunto) modalVerPunto.style.display = "none";
    if (e.target === modalEditarPunto) modalEditarPunto.style.display = "none";
};


// =============================
// INICIO
// =============================
document.addEventListener("DOMContentLoaded", () => {
    // Ya no necesitamos cargarEstadoInicial() basado en localStorage.
    // cargarDatosDesdeBD() se encarga de cargar datos Y pintar el mapa.
    cargarDatosDesdeBD(); 
});