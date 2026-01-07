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