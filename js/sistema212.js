 // ===================================
// 1. VARIABLES FIJAS (NO CAMBIAN POR SWITCH)
// ===================================
const NUM_PUERTOS = 30; 
const empty = 'N/A';

// Switch seleccionado actualmente (para que los botones del modal trabajen sobre el switch correcto)
let currentSwitchId = null;

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

/**
 * Rellena el Modal de Vista con los datos actuales, usando una TABLA para puertos.
 * ESTA ES LA FUNCIÓN MODIFICADA PARA MOSTRAR TABLA.
 */
function actualizarVista(data) {
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

    // 2. Generar la TABLA para la VISTA de Puertos
    puertosVistaContenedor.innerHTML = ''; // Limpiar el contenedor

    // Contenedor para aplicar estilos de scroll
    const tablaContenedor = document.createElement('div');
    tablaContenedor.className = 'tabla-contenedor'; 

    const tabla = document.createElement('table');
    tabla.id = 'tablaPuertos';
    tabla.innerHTML = `
        <thead>
            <tr>
                <th>Puerto</th>
                <th>NOMBRE</th>
                <th>LOCALIZACIÓN</th>
                <th>Observaciones</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    
    const tbody = tabla.querySelector('tbody');

    // Rellenar la tabla con los 30 puertos
    for (let i = 1; i <= NUM_PUERTOS; i++) {
        const pData = data.puertos[`puerto${i}`];
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>Punto ${i}</td>
            <td>${pData.nombre || empty}</td>
            <td>${pData.localizacion || empty}</td>
            <td>${pData.obs || empty}</td>
        `;
        tbody.appendChild(fila);
    }
    
    tablaContenedor.appendChild(tabla);
    puertosVistaContenedor.appendChild(tablaContenedor);
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

    // Datos de los 30 puertos (Rellenar los campos existentes en el HTML)
    for (let i = 1; i <= NUM_PUERTOS; i++) {
        const pData = data.puertos[`puerto${i}`];
        
        // Se buscan los IDs que están fijos en el HTML
        const inputNombre = document.getElementById(`nombre-${i}`);
        const inputLocalizacion = document.getElementById(`localizacion-${i}`);
        const textareaObs = document.getElementById(`obs-${i}`);

        // Los IDs están garantizados porque los pusimos en el HTML
        if (inputNombre) inputNombre.value = pData.nombre === 'N/A' ? '' : pData.nombre;
        if (inputLocalizacion) inputLocalizacion.value = pData.localizacion === 'N/A' ? '' : pData.localizacion;
        if (textareaObs) textareaObs.value = pData.obs === 'N/A' ? '' : pData.obs;
    }
}


// ===================================
// FUNCIONALIDAD DE DETALLE DE PUERTO 
// ===================================



// Función para cerrar el Modal de Vista y restaurar la vista completa (la tabla)
function cerrarModalVista(switchId) {
    if (switchId) {
         // Llama a actualizarVista para restaurar la vista completa (con la tabla)
         actualizarVista(cargarDatos(switchId));
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
    const switchId = iconoServidor.dataset.switchId;

    // Abrir Modal de Vista (clic en el ícono del servidor)
    iconoServidor.addEventListener('click', () => {
        currentSwitchId = switchId;
        actualizarVista(cargarDatos(currentSwitchId));
        modalFondo.style.display = 'flex';
    });
}


// ===================================
// 4. INICIALIZACIÓN
// ===================================

// Cierres de Modal de Edición
cerrarEditarBtn.addEventListener('click', () => modalEditar.style.display = 'none');
cerrarEditarX.addEventListener('click', () => modalEditar.style.display = 'none');


document.addEventListener("DOMContentLoaded", () => {
    // 🚀 Configurar CADA SWITCH EN LA PÁGINA
    // Importante: Asegúrate de que tus iconos de switch tienen la clase .fa-server y el atributo data-switch-id="[ID_UNICO]"
    const todosLosIconos = document.querySelectorAll('.fa-server[data-switch-id]');

    if (todosLosIconos.length === 0) {
        console.warn("No se encontraron elementos con la clase '.fa-server' y el atributo 'data-switch-id'. Asegúrate de tener switches definidos en tu HTML.");
    }

    todosLosIconos.forEach(icono => {
        // Inicializar el manejo de eventos para cada switch
        setupSwitch(icono); 
    });

    // ✅ Los botones del modal SON ÚNICOS, así que sus eventos deben asignarse UNA sola vez
    editarBtn.addEventListener('click', () => {
        if (!currentSwitchId) return;
        cargarDatosEditar(currentSwitchId);
        modalFondo.style.display = 'none';
        modalEditar.style.display = 'flex';
    });

    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentSwitchId) return;

        // 1. Guardar datos generales
        const dataToSave = {
            switchNombre: switchNombre.value.trim() || 'Sin Asignar',
            switchUbicacion: switchUbicacion.value.trim() || 'N/A',
            serie: serie.value.trim() || 'N/A',
            mac: mac.value.trim() || 'N/A',
            puertos: {}
        };

        // 2. Guardar datos de los 30 puertos (leyendo los campos fijos)
        for (let i = 1; i <= NUM_PUERTOS; i++) {
            dataToSave.puertos[`puerto${i}`] = {
                nombre: document.getElementById(`nombre-${i}`).value.trim() || 'N/A',
                localizacion: document.getElementById(`localizacion-${i}`).value.trim() || 'N/A',
                obs: document.getElementById(`obs-${i}`).value.trim() || 'N/A'
            };
        }

        localStorage.setItem(currentSwitchId, JSON.stringify(dataToSave));

        // ✅ Guardar también en Base de Datos
        try {
            await guardarSwitchEnBD({
                codigo_switch: currentSwitchId,
                nombre: dataToSave.switchNombre || 'Sin Asignar',
                ubicacion: dataToSave.switchUbicacion || 'N/A',
                numero_serie: dataToSave.serie || 'N/A',
                mac: dataToSave.mac || 'N/A',
                id_zona: (typeof ID_ZONA !== 'undefined') ? ID_ZONA : null
            });
        } catch (e) {
            console.error('Error guardando switch en BD:', e);
        }

        actualizarVista(dataToSave);

        modalEditar.style.display = 'none';
        modalFondo.style.display = 'flex';
        alert(`¡Información del Switch ${dataToSave.switchNombre} guardada con éxito!`);
    });

    eliminarBtn.addEventListener('click', () => {
        if (!currentSwitchId) return;

        const data = cargarDatos(currentSwitchId);
        const confirmar = confirm(`¿Estás seguro de que quieres ELIMINAR toda la información del Switch: ${data.switchNombre || 'N/A'}?`);

        if (confirmar) {
            localStorage.removeItem(currentSwitchId);
            const emptyData = getDefaultData();

            actualizarVista(emptyData);
            cargarDatosEditar(currentSwitchId);

            modalEditar.style.display = 'none';
            modalFondo.style.display = 'flex';

            alert("¡Información del Switch eliminada y restablecida!");
        }
    });

    cerrarBtn.addEventListener('click', () => cerrarModalVista(currentSwitchId));
    cerrarX.addEventListener('click', () => cerrarModalVista(currentSwitchId));

});