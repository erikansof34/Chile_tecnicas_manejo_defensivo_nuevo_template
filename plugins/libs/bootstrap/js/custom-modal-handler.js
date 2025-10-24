/**
 * Manejador personalizado para modales con pseudo-elementos
 * Maneja clics en el pseudo-elemento ::before para cerrar modales
 */

(function() {
    'use strict';

    // Función para detectar si el clic fue en el área del pseudo-elemento
    function isClickOnPseudoElement(event, modalElement) {
        const rect = modalElement.getBoundingClientRect();
        const clickX = event.clientX;
        const clickY = event.clientY;
        
        // Verificar si el clic está dentro del área del modal
        const isInModalArea = clickX >= rect.left && 
                             clickX <= rect.right && 
                             clickY >= rect.top && 
                             clickY <= rect.bottom;
        
        if (!isInModalArea) return false;
        
        // Verificar si NO está en el modal-dialog (contenido)
        const modalDialog = modalElement.querySelector('.modal-dialog');
        if (modalDialog) {
            const dialogRect = modalDialog.getBoundingClientRect();
            const isInDialogArea = clickX >= dialogRect.left && 
                                  clickX <= dialogRect.right && 
                                  clickY >= dialogRect.top && 
                                  clickY <= dialogRect.bottom;
            
            // Si está en el modal pero NO en el diálogo, entonces está en el pseudo-elemento
            return !isInDialogArea;
        }
        
        return true;
    }

    // Función para manejar clics en modales Bootstrap
    function handleModalClick(event) {
        const modal = event.currentTarget;
        const modalInstance = bootstrap.Modal.getInstance(modal);
        
        if (!modalInstance) return;
        
        // Si el clic fue en el pseudo-elemento o área de backdrop
        if (isClickOnPseudoElement(event, modal) || event.target === modal) {
            event.preventDefault();
            event.stopPropagation();
            modalInstance.hide();
        }
    }

    // Función para inicializar los manejadores de eventos
    function initializeCustomModalHandlers() {
        // Buscar todos los modales Bootstrap
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(function(modal) {
            // Remover listeners existentes si los hay
            modal.removeEventListener('click', handleModalClick);
            // Agregar el nuevo listener
            modal.addEventListener('click', handleModalClick);
        });
    }

    // Función para manejar modales dinámicos
    function handleDynamicModals() {
        // Observer para detectar nuevos modales agregados al DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Si el nodo agregado es un modal
                            if (node.classList && node.classList.contains('modal')) {
                                node.addEventListener('click', handleModalClick);
                            }
                            // Si el nodo contiene modales
                            const childModals = node.querySelectorAll && node.querySelectorAll('.modal');
                            if (childModals) {
                                childModals.forEach(function(modal) {
                                    modal.addEventListener('click', handleModalClick);
                                });
                            }
                        }
                    });
                }
            });
        });

        // Observar cambios en el body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initializeCustomModalHandlers();
            handleDynamicModals();
        });
    } else {
        initializeCustomModalHandlers();
        handleDynamicModals();
    }

    // Reinicializar cuando se muestren nuevos modales
    document.addEventListener('shown.bs.modal', function(event) {
        const modal = event.target;
        modal.removeEventListener('click', handleModalClick);
        modal.addEventListener('click', handleModalClick);
    });

    // Exportar funciones para uso global si es necesario
    window.CustomModalHandler = {
        init: initializeCustomModalHandlers,
        handleClick: handleModalClick
    };

})();
