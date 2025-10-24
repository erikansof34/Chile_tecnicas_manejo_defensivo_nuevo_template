/*
 * Preloader JavaScript Library for Canvas Framework
 * 
 * Provides functionality for various preloader types
 * Includes automatic page load detection and manual control
 * 
 * Version: 1.0.0
 */

class CanvasPreloader {
    constructor(options = {}) {
        this.options = {
            // Configuración por defecto
            selector: '.preloader',
            autoHide: true,
            hideDelay: 500,
            fadeOutDuration: 500,
            minimumLoadTime: 1000,
            showProgress: false,
            progressCallback: null,
            onStart: null,
            onComplete: null,
            debug: false,
            ...options
        };

        this.preloader = null;
        this.startTime = Date.now();
        this.isComplete = false;
        this.progressValue = 0;

        this.init();
    }

    init() {
        this.preloader = document.querySelector(this.options.selector);
        
        if (!this.preloader) {
            this.log('Preloader element not found');
            return;
        }

        this.log('Preloader initialized');

        // Ejecutar callback de inicio
        if (typeof this.options.onStart === 'function') {
            this.options.onStart();
        }

        // Si está habilitado el auto-hide, configurar eventos
        if (this.options.autoHide) {
            this.setupAutoHide();
        }

        // Si se debe mostrar progreso, inicializar
        if (this.options.showProgress) {
            this.initProgress();
        }
    }

    setupAutoHide() {
        // Verificar si la página ya está cargada
        if (document.readyState === 'complete') {
            this.handlePageLoad();
        } else {
            // Escuchar evento de carga de la página
            window.addEventListener('load', () => {
                this.handlePageLoad();
            });
        }

        // También escuchar el evento DOMContentLoaded como fallback
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                if (!this.isComplete) {
                    this.handlePageLoad();
                }
            });
        }
    }

    handlePageLoad() {
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.options.minimumLoadTime - elapsedTime);

        this.log(`Page loaded in ${elapsedTime}ms, waiting ${remainingTime}ms more`);

        setTimeout(() => {
            this.hide();
        }, remainingTime + this.options.hideDelay);
    }

    initProgress() {
        // Simular progreso de carga
        this.progressValue = 0;
        const progressBar = this.preloader.querySelector('.progress-fill');
        const progressText = this.preloader.querySelector('.progress-text');

        if (progressBar || progressText) {
            this.updateProgress(0);
            this.simulateProgress();
        }
    }

    simulateProgress() {
        const progressInterval = setInterval(() => {
            // Incrementar progreso de forma realista
            if (this.progressValue < 70) {
                this.progressValue += Math.random() * 15;
            } else if (this.progressValue < 90) {
                this.progressValue += Math.random() * 5;
            } else if (this.progressValue < 95) {
                this.progressValue += Math.random() * 2;
            }

            this.progressValue = Math.min(this.progressValue, 95);
            this.updateProgress(this.progressValue);

            // Si la página está cargada, completar el progreso
            if (document.readyState === 'complete' && this.progressValue >= 95) {
                this.progressValue = 100;
                this.updateProgress(100);
                clearInterval(progressInterval);
            }
        }, 100);
    }

    updateProgress(value) {
        const progressBar = this.preloader.querySelector('.progress-fill');
        const progressText = this.preloader.querySelector('.progress-text');

        if (progressBar) {
            progressBar.style.width = `${value}%`;
        }

        if (progressText) {
            progressText.textContent = `${Math.round(value)}%`;
        }

        // Ejecutar callback de progreso si existe
        if (typeof this.options.progressCallback === 'function') {
            this.options.progressCallback(value);
        }

        this.log(`Progress: ${Math.round(value)}%`);
    }

    show() {
        if (!this.preloader) return;

        this.preloader.classList.remove('fade-out');
        this.preloader.style.display = 'flex';
        this.log('Preloader shown');
    }

    hide() {
        if (!this.preloader || this.isComplete) return;

        this.isComplete = true;
        this.log('Hiding preloader');

        // Aplicar clase de fade out
        this.preloader.classList.add('fade-out');

        // Remover del DOM después de la animación
        setTimeout(() => {
            if (this.preloader) {
                this.preloader.style.display = 'none';
                
                // Ejecutar callback de completado
                if (typeof this.options.onComplete === 'function') {
                    this.options.onComplete();
                }
                
                this.log('Preloader hidden');
            }
        }, this.options.fadeOutDuration);
    }

    destroy() {
        if (this.preloader) {
            this.preloader.remove();
            this.preloader = null;
        }
        this.log('Preloader destroyed');
    }

    // Métodos públicos para control manual
    setProgress(value) {
        this.progressValue = Math.max(0, Math.min(100, value));
        this.updateProgress(this.progressValue);
    }

    log(message) {
        if (this.options.debug) {
            console.log(`[CanvasPreloader] ${message}`);
        }
    }
}

// Función de utilidad para crear preloaders rápidamente
window.createPreloader = function(type = 'dots', options = {}) {
    const preloaderHTML = getPreloaderHTML(type, options);
    
    // Insertar en el DOM si no existe
    let existingPreloader = document.querySelector('.preloader');
    if (!existingPreloader) {
        document.body.insertAdjacentHTML('afterbegin', preloaderHTML);
    }

    // Crear instancia del preloader
    return new CanvasPreloader(options);
};

// Función para generar HTML de preloaders
function getPreloaderHTML(type, options = {}) {
    const isDark = options.dark || false;
    const hasText = options.text || false;
    const hasProgress = options.progress || false;
    const customText = options.customText || 'Cargando...';
    const color = options.color || 'primary';

    let spinnerHTML = '';
    let extraContent = '';

    // Generar HTML del spinner según el tipo
    switch (type) {
        case 'dots':
            spinnerHTML = `
                <div class="spinner-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            `;
            break;

        case 'ring':
            spinnerHTML = `
                <div class="spinner-ring">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            `;
            break;

        case 'pulse':
            spinnerHTML = `<div class="spinner-pulse"></div>`;
            break;

        case 'wave':
            spinnerHTML = `
                <div class="spinner-wave">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            `;
            break;

        case 'bounce':
            spinnerHTML = `
                <div class="spinner-bounce">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            `;
            break;

        case 'logo':
            spinnerHTML = `<div class="spinner-logo"></div>`;
            break;

        case 'dual-ring':
            spinnerHTML = `<div class="spinner-dual-ring"></div>`;
            break;

        case 'heart':
            spinnerHTML = `
                <div class="spinner-heart">
                    <div></div>
                </div>
            `;
            break;

        default:
            spinnerHTML = `
                <div class="spinner-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            `;
    }

    // Agregar texto si se solicita
    if (hasText) {
        extraContent += `<div class="loading-text">${customText}</div>`;
    }

    // Agregar barra de progreso si se solicita
    if (hasProgress) {
        extraContent += `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">0%</div>
        `;
    }

    // Determinar clases CSS
    const darkClass = isDark ? ' dark' : '';
    const colorClass = ` color-${color}`;
    const containerClass = (hasText || hasProgress) ? ' spinner-with-text' : '';
    const progressClass = hasProgress ? ' spinner-progress' : '';

    return `
        <div class="preloader${darkClass}${colorClass}${containerClass}${progressClass}">
            <div class="spinner-container">
                ${spinnerHTML}
                ${extraContent}
            </div>
        </div>
    `;
}

// Auto-inicialización si existe un preloader en el DOM
document.addEventListener('DOMContentLoaded', function() {
    const existingPreloader = document.querySelector('.preloader');
    if (existingPreloader && !window.canvasPreloaderInstance) {
        window.canvasPreloaderInstance = new CanvasPreloader({
            debug: false
        });
    }
});

// Exportar para uso como módulo si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CanvasPreloader;
}
