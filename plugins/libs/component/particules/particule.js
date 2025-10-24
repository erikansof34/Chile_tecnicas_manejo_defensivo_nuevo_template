class ParticleSystem {
    constructor() {
        this.container = null;
        this.particles = [];
        this.isRunning = false;
        this.init();
    }

    init() {
        // Crear el contenedor de partículas
        this.container = document.createElement('div');
        this.container.className = 'particles-container';
        document.body.appendChild(this.container);
        
        // Iniciar el sistema de partículas
        this.start();
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Tipos de partículas aleatorias
        const types = ['blue', 'white', 'yellow'];
        const movements = ['circular', 'infinity', 'vertical', 'horizontal'];
        
        const type = types[Math.floor(Math.random() * types.length)];
        const movement = movements[Math.floor(Math.random() * movements.length)];
        
        particle.classList.add(type);
        particle.classList.add(movement);
        
        // Tamaño aleatorio de partícula (mantengo tu rango)
        const size = Math.random() * 10 + 2; // Entre 2px y 10px
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Configuración específica según el tipo de movimiento
        switch(movement) {
            case 'circular':
                this.setupCircularMovement(particle);
                break;
            case 'infinity':
                this.setupInfinityMovement(particle);
                break;
            case 'vertical':
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = '100%';
                break;
            case 'horizontal':
                particle.style.left = '-100px';
                particle.style.top = Math.random() * 100 + '%';
                break;
        }
        
        // Duración de animación aleatoria (mantengo tu configuración)
        const duration = Math.random() * 20 + 15; // Entre 15s y 35s
        particle.style.animationDuration = duration + 's';
        
        // Retraso aleatorio
        const delay = Math.random() * 5;
        particle.style.animationDelay = delay + 's';
        
        this.container.appendChild(particle);
        this.particles.push(particle);
        
        // Remover la partícula después de la animación
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
            const index = this.particles.indexOf(particle);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        }, (duration + delay) * 1000);
    }

    setupCircularMovement(particle) {
        // Posición inicial aleatoria en el círculo
        const centerX = Math.random() * 80 + 10; // Entre 10% y 90%
        const centerY = Math.random() * 80 + 10; // Entre 10% y 90%
        const radius = Math.random() * 150 + 50; // Radio entre 50px y 200px
        
        particle.style.setProperty('--center-x', centerX + '%');
        particle.style.setProperty('--center-y', centerY + '%');
        particle.style.setProperty('--radius', radius + 'px');
        
        // Posición inicial
        particle.style.left = `calc(${centerX}% + ${radius}px)`;
        particle.style.top = centerY + '%';
    }

    setupInfinityMovement(particle) {
        // Posición inicial para el movimiento en infinito
        const centerX = Math.random() * 60 + 20; // Entre 20% y 80%
        const centerY = Math.random() * 60 + 20; // Entre 20% y 80%
        const scale = Math.random() * 100 + 80; // Escala del infinito
        
        particle.style.setProperty('--center-x', centerX + '%');
        particle.style.setProperty('--center-y', centerY + '%');
        particle.style.setProperty('--scale', scale + 'px');
        
        // Posición inicial
        particle.style.left = centerX + '%';
        particle.style.top = centerY + '%';
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        // Crear partículas iniciales
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createParticle();
            }, i * 2000);
        }
        
        // Continuar creando partículas cada cierto tiempo
        this.interval = setInterval(() => {
            if (this.particles.length < 15) { // Máximo 15 partículas
                this.createParticle();
            }
        }, 3000); // Nueva partícula cada 3 segundos
    }

    stop() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
        }
        
        // Limpiar partículas existentes
        this.particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        this.particles = [];
    }

    destroy() {
        this.stop();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Inicializar el sistema de partículas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que la página cargue completamente
    setTimeout(() => {
        window.particleSystem = new ParticleSystem();
    }, 1000);
});

// Exponer la clase globalmente para control manual si es necesario
window.ParticleSystem = ParticleSystem;