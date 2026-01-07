document.addEventListener('DOMContentLoaded', () => {
            // --- SELECCIÓN DE ELEMENTOS ---
            const edificios = document.querySelectorAll(".edificio");
            const modal = document.getElementById("modal");
            const modalTitulo = document.getElementById("modalTitulo");
            const modalBodyContent = document.getElementById("modal-body-content");
            const cerrarBtn = document.querySelector(".cerrar");
            // --- LÓGICA DE CLICS EN LOS EDIFICIOS ---
            edificios.forEach(edificio => {
                edificio.addEventListener("click", () => {
                    const nombreEdificio = edificio.dataset.nombre;
                    console.log(nombreEdificio)

                    if (nombreEdificio === "Edificio Administrativo") {
                        window.location.href = "../html/admin.html";
                    } else {
                        const datosEdificio = datosOficinas[nombreEdificio] || { 
                            tipo: 'mensaje', 
                            contenido: 'No hay información disponible para este edificio.' 
                        };
                        
                        modalTitulo.textContent = nombreEdificio;
                        modalBodyContent.innerHTML = '';

                        if (datosEdificio.tipo === 'diagrama') {
                            const img = document.createElement('img');
                            img.src = datosEdificio.archivo;
                            img.alt = `Diagrama de ${nombreEdificio}`;
                            img.style.maxWidth = '100%';
                            img.style.height = 'auto';
                            modalBodyContent.appendChild(img);
                        } else {
                            const p = document.createElement('p');
                            p.textContent = datosEdificio.contenido;
                            modalBodyContent.appendChild(p);
                        }
                        
                        modal.style.display = "flex";
                    }
                });
            });

            // --- LÓGICA PARA CERRAR EL MODAL ---
            cerrarBtn.addEventListener("click", () => {
                modal.style.display = "none";
            });

            window.addEventListener("click", (e) => {
                if (e.target === modal) {
                    modal.style.display = "none";
                }
            });
        });