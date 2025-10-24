/**
 * Efectos Parallax y Control de Video
 * Archivo: parallax-effects.js
 * Descripción: Contiene todos los efectos de parallax, smooth scrolling y control de video
 */

// Efecto Parallax con JavaScript para video
window.addEventListener('scroll', function () {
    const scrolled = window.pageYOffset;
    const parallaxBg = document.getElementById('parallax-bg');
    const speed = 0.5; // Velocidad del parallax (0.5 = mitad de velocidad)

    // Aplicar transformación parallax
    if (parallaxBg) {
        parallaxBg.style.transform = `translateY(${scrolled * speed}px)`;
    }
});

// Efecto parallax del mouse para video (opcional)
document.addEventListener('mousemove', function (e) {
    const video = document.querySelector('#parallax-bg video');
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;

    // Movimiento sutil con el mouse
    if (video) {
        video.style.transform = `translate(-50%, -50%) scale(1.05) translate(${(x - 50) * 0.5}px, ${(y - 50) * 0.5}px)`;
    }
});

// Smooth scrolling para los botones
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Control de reproducción del video
document.addEventListener('DOMContentLoaded', function () {
    const video = document.querySelector('#parallax-bg video');
    if (video) {
        // Pausar el video cuando no esté visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        });
        observer.observe(video);
    }
});
