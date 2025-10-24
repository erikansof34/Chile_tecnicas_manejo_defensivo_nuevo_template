/**
 * ===================================================================
 * SLIDER COMPONENT - JAVASCRIPT
 * ===================================================================
 * 
 * Componente de slider personalizable con funcionalidades completas
 * - Navegación por bullets
 * - Navegación por flechas (opcional)
 * - Repetición automática (configurable)
 * - Transiciones suaves
 * - Responsive
 * 
 * Dependencias: FontAwesome (para las flechas)
 */

class SliderComponent {
    constructor(container, options = {}) {
        // Configuración por defecto
        this.config = {
            repeat: false,
            noArrows: false,
            noBullets: false,
            autoplay: false,
            autoplayDelay: 3000,
            ...options
        };

        // Elementos del DOM
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.slides = [];
        this.slideTotal = 0;
        this.slideCurrent = -1;
        this.autoplayTimer = null;

        // Inicializar el slider
        this.init();
    }

    /**
     * Inicializa el componente slider
     */
    init() {
        if (!this.container) {
            console.error('Slider container not found');
            return;
        }

        this.slides = this.container.querySelectorAll('.slider-single');
        this.slideTotal = this.slides.length - 1;

        if (this.slides.length === 0) {
            console.error('No slides found in container');
            return;
        }

        this.initBullets();
        this.initArrows();
        this.setupInitialState();
        
        // Comenzar el slider
        setTimeout(() => {
            this.slideRight();
            if (this.config.autoplay) {
                this.startAutoplay();
            }
        }, 500);
    }

    /**
     * Inicializa los bullets/indicadores
     */
    initBullets() {
        if (this.config.noBullets) return;

        const bulletContainer = document.createElement('div');
        bulletContainer.classList.add('bullet-container');
        
        this.slides.forEach((slide, i) => {
            const bullet = document.createElement('div');
            bullet.classList.add('bullet');
            bullet.id = `bullet-index-${i}`;
            bullet.addEventListener('click', () => this.goToIndexSlide(i));
            bulletContainer.appendChild(bullet);
            slide.classList.add('proactivede');
        });
        
        this.container.appendChild(bulletContainer);
    }

    /**
     * Inicializa las flechas de navegación
     */
    initArrows() {
        if (this.config.noArrows) return;

        // Flecha izquierda
        const leftArrow = document.createElement('a');
        const iLeft = document.createElement('i');
        iLeft.classList.add('fa', 'fa-arrow-left');
        leftArrow.classList.add('slider-left');
        leftArrow.appendChild(iLeft);
        leftArrow.addEventListener('click', () => {
            this.slideLeft();
            this.resetAutoplay();
        });

        // Flecha derecha
        const rightArrow = document.createElement('a');
        const iRight = document.createElement('i');
        iRight.classList.add('fa', 'fa-arrow-right');
        rightArrow.classList.add('slider-right');
        rightArrow.appendChild(iRight);
        rightArrow.addEventListener('click', () => {
            this.slideRight();
            this.resetAutoplay();
        });

        this.container.appendChild(leftArrow);
        this.container.appendChild(rightArrow);
    }

    /**
     * Establece el estado inicial de todos los slides
     */
    setupInitialState() {
        this.slides.forEach(slide => {
            slide.classList.add('proactivede');
        });
    }

    /**
     * Actualiza el estado activo de los bullets
     */
    updateBullet() {
        if (this.config.noBullets) return;

        const bullets = this.container.querySelectorAll('.bullet');
        bullets.forEach((bullet, i) => {
            bullet.classList.remove('active');
            if (i === this.slideCurrent) {
                bullet.classList.add('active');
            }
        });
    }

    /**
     * Verifica y maneja la lógica de repetición
     */
    checkRepeat() {
        if (this.config.repeat) return;

        const leftArrow = this.container.querySelector('.slider-left');
        const rightArrow = this.container.querySelector('.slider-right');

        if (this.slideCurrent === this.slides.length - 1) {
            this.slides[0].classList.add('not-visible');
            this.slides[this.slides.length - 1].classList.remove('not-visible');
            if (rightArrow) rightArrow.classList.add('not-visible');
            if (leftArrow) leftArrow.classList.remove('not-visible');
        } else if (this.slideCurrent === 0) {
            this.slides[this.slides.length - 1].classList.add('not-visible');
            this.slides[0].classList.remove('not-visible');
            if (leftArrow) leftArrow.classList.add('not-visible');
            if (rightArrow) rightArrow.classList.remove('not-visible');
        } else {
            this.slides[this.slides.length - 1].classList.remove('not-visible');
            this.slides[0].classList.remove('not-visible');
            if (leftArrow) leftArrow.classList.remove('not-visible');
            if (rightArrow) rightArrow.classList.remove('not-visible');
        }
    }

    /**
     * Navega al siguiente slide
     */
    slideRight() {
        if (this.slideCurrent < this.slideTotal) {
            this.slideCurrent++;
        } else {
            this.slideCurrent = 0;
        }

        this.updateSlideStates();
    }

    /**
     * Navega al slide anterior
     */
    slideLeft() {
        if (this.slideCurrent > 0) {
            this.slideCurrent--;
        } else {
            this.slideCurrent = this.slideTotal;
        }

        this.updateSlideStates();
    }

    /**
     * Actualiza los estados de todos los slides
     */
    updateSlideStates() {
        // Determinar slides adyacentes
        const preactiveSlide = this.slideCurrent > 0 ? 
            this.slides[this.slideCurrent - 1] : 
            this.slides[this.slideTotal];
        
        const activeSlide = this.slides[this.slideCurrent];
        
        const proactiveSlide = this.slideCurrent < this.slideTotal ? 
            this.slides[this.slideCurrent + 1] : 
            this.slides[0];

        // Limpiar todas las clases de estado
        this.slides.forEach(slide => {
            slide.classList.remove('preactivede', 'preactive', 'active', 'proactive', 'proactivede');
            slide.classList.add('proactivede');
        });

        // Establecer nuevos estados
        preactiveSlide.classList.remove('proactivede');
        preactiveSlide.classList.add('preactive');

        activeSlide.classList.remove('proactivede');
        activeSlide.classList.add('active');

        proactiveSlide.classList.remove('proactivede');
        proactiveSlide.classList.add('proactive');

        this.updateBullet();
        this.checkRepeat();
    }

    /**
     * Navega directamente a un slide específico
     * @param {number} index - Índice del slide objetivo
     */
    goToIndexSlide(index) {
        if (index === this.slideCurrent) return;

        const direction = this.slideCurrent > index ? 'left' : 'right';
        
        while (this.slideCurrent !== index) {
            if (direction === 'left') {
                this.slideLeft();
            } else {
                this.slideRight();
            }
        }

        this.resetAutoplay();
    }

    /**
     * Inicia el autoplay
     */
    startAutoplay() {
        if (!this.config.autoplay) return;

        this.autoplayTimer = setInterval(() => {
            this.slideRight();
        }, this.config.autoplayDelay);
    }

    /**
     * Detiene el autoplay
     */
    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }

    /**
     * Reinicia el autoplay
     */
    resetAutoplay() {
        if (this.config.autoplay) {
            this.stopAutoplay();
            this.startAutoplay();
        }
    }

    /**
     * Pausa el autoplay temporalmente
     */
    pauseAutoplay() {
        this.stopAutoplay();
    }

    /**
     * Reanuda el autoplay
     */
    resumeAutoplay() {
        if (this.config.autoplay) {
            this.startAutoplay();
        }
    }

    /**
     * Destruye el slider y limpia los event listeners
     */
    destroy() {
        this.stopAutoplay();
        
        // Remover bullets
        const bulletContainer = this.container.querySelector('.bullet-container');
        if (bulletContainer) {
            bulletContainer.remove();
        }

        // Remover flechas
        const leftArrow = this.container.querySelector('.slider-left');
        const rightArrow = this.container.querySelector('.slider-right');
        if (leftArrow) leftArrow.remove();
        if (rightArrow) rightArrow.remove();

        // Limpiar clases de los slides
        this.slides.forEach(slide => {
            slide.classList.remove('preactivede', 'preactive', 'active', 'proactive', 'proactivede', 'not-visible');
        });
    }

    /**
     * Actualiza la configuración del slider
     * @param {Object} newConfig - Nueva configuración
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (newConfig.autoplay !== undefined) {
            if (newConfig.autoplay) {
                this.startAutoplay();
            } else {
                this.stopAutoplay();
            }
        }
    }

    /**
     * Obtiene el slide actual
     * @returns {number} Índice del slide actual
     */
    getCurrentSlide() {
        return this.slideCurrent;
    }

    /**
     * Obtiene el total de slides
     * @returns {number} Total de slides
     */
    getTotalSlides() {
        return this.slides.length;
    }
}

// ===================================================================
// IMPLEMENTACIÓN PARA COMPATIBILIDAD CON EL CÓDIGO EXISTENTE
// ===================================================================

// Variables globales para compatibilidad
const repeat = false;
const noArrows = false;
const noBullets = false;

// Función de inicialización automática (DOM ready)
function initSlider() {
    const container = document.querySelector('.slider-container');
    if (container) {
        // Crear instancia global para compatibilidad
        window.sliderInstance = new SliderComponent(container, {
            repeat: repeat,
            noArrows: noArrows,
            noBullets: noBullets,
            autoplay: false
        });
    }
}

// Funciones globales para compatibilidad con código existente
function slideRight() {
    if (window.sliderInstance) {
        window.sliderInstance.slideRight();
    }
}

function slideLeft() {
    if (window.sliderInstance) {
        window.sliderInstance.slideLeft();
    }
}

function goToIndexSlide(index) {
    if (window.sliderInstance) {
        window.sliderInstance.goToIndexSlide(index);
    }
}

// Auto-inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlider);
} else {
    initSlider();
}

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SliderComponent;
}

// Exportar para uso con AMD
if (typeof define === 'function' && define.amd) {
    define([], function() {
        return SliderComponent;
    });
}
