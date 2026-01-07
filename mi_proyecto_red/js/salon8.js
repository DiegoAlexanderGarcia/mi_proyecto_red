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
        id_zona: 22 // ZONA = SALA 8
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
