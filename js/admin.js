  document.addEventListener('DOMContentLoaded', () => {
            const oficinas = document.querySelectorAll(".oficina");
            const modal = document.getElementById("modal");
            const modalTitulo = document.getElementById("modalTitulo");
            const modalBodyContent = document.getElementById("modal-body-content");
            const cerrarBtn = document.querySelector(".cerrar");

            cerrarBtn.addEventListener("click", () => {
                modal.style.display = "none";
                modal.classList.remove('diagrama-modal');
                modalTitulo.style.display = 'block';
            });

            window.addEventListener("click", (e) => {
                if (e.target === modal) {
                    modal.style.display = "none";
                    modal.classList.remove('diagrama-modal');
                    modalTitulo.style.display = 'block';
                }
            });
        });