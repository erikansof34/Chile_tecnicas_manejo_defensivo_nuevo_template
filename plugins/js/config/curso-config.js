// Configuración global del curso
const CURSO_CONFIG = {
  // Configuración de lecciones del curso
  lecciones: {
    leccion1: {
      nombre: '1° Teoría del Manejo Defensivo',
      sliders: [
        { router: 'momento1_1', momento: 1 },
        { router: 'momento1_2', momento: 1 },
        { router: 'momento1_3', momento: 1 },
        { router: 'momento1_4', momento: 1 },
        { router: 'momento1_5', momento: 1 },
      ],
      navegacion: {
        paginaAnterior: '../inicio/inicio.html',
        paginaSiguiente: './resumen_leccion.html',
        mostrarConfirmacion: false
      }
    },
    leccion2: {
      nombre: '2° Buenos hábitos de Manejo Defensivo',
      sliders: [
        { router: 'momento2_1', momento: 2 },
        { router: 'momento2_2', momento: 2 },
        { router: 'momento2_3a', momento: 2 },
        { router: 'momento2_3', momento: 2 },
        { router: 'momento2_4', momento: 2 },
        { router: 'momento2_5a', momento: 2 },
        { router: 'momento2_5', momento: 2 },
        { router: 'momento2_6', momento: 2 },
      ],
      navegacion: {
        paginaAnterior: '../leccion1/evaluacion_leccion.html',
        paginaSiguiente: './resumen_leccion.html',
        mostrarConfirmacion: false
      }
    },
    leccion3: {
      nombre: '3° Factores para evitar Accidentes de Tránsito',
      sliders: [
        { router: 'momento3_1', momento: 3 },
        { router: 'momento3_2', momento: 3 },
        { router: 'momento3_3', momento: 3 },
        { router: 'momento3_4', momento: 3 },
        { router: 'momento3_5', momento: 3 },
        { router: 'momento3_6', momento: 3 },
        { router: 'momento3_7', momento: 3 },
      ],
      navegacion: {
        paginaAnterior: '../leccion2/evaluacion_leccion.html',
        paginaSiguiente: './resumen_leccion.html',
        mostrarConfirmacion: false
      }
    },
  },

  // Función para obtener información de una lección específica
  getLeccion(leccionId) {
    return this.lecciones[leccionId] || null;
  },

  // Función para obtener todos los sliders de una lección
  getSliders(leccionId) {
    const leccion = this.getLeccion(leccionId);
    return leccion ? leccion.sliders : [];
  },

  // Función para obtener todos los momentos de una lección
  getMomentos(leccionId) {
    const leccion = this.getLeccion(leccionId);
    if (!leccion) return {};

    // Si la lección tiene momentos definidos, retornarlos
    if (leccion.momentos) {
      return leccion.momentos;
    }

    // Si no tiene momentos, crear uno usando el nombre de la lección
    // Obtener todos los momentos únicos de los sliders
    const momentosUnicos = [...new Set(leccion.sliders.map(slider => slider.momento))];
    const momentosGenerados = {};

    momentosUnicos.forEach(momentoId => {
      momentosGenerados[momentoId] = leccion.nombre;
    });

    return momentosGenerados;
  },

  // Función para obtener la configuración de navegación de una lección
  getNavegacion(leccionId) {
    const leccion = this.getLeccion(leccionId);
    if (leccion && leccion.navegacion) {
      return leccion.navegacion;
    }

    // Navegación por defecto si no está definida
    return {
      paginaAnterior: '../inicio/inicio.html',
      paginaSiguiente: './resumen_leccion.html',
      mostrarConfirmacion: false
    };
  },

  // Función para calcular el total de slides del curso
  getTotalSlidesCurso() {
    let total = 0;
    for (const leccionId in this.lecciones) {
      total += this.lecciones[leccionId].sliders.length;
    }
    return total;
  },

  // Función para obtener el total de slides de una lección específica
  getTotalSlidesLeccion(leccionId) {
    const leccion = this.getLeccion(leccionId);
    return leccion ? leccion.sliders.length : 0;
  },

  // Función para obtener todas las lecciones disponibles
  getAllLecciones() {
    return Object.keys(this.lecciones);
  },

  // Función para detectar la lección actual basada en la URL o contexto
  getLeccionActual() {
    // Detectar automáticamente basado en la URL
    const currentPath = window.location.pathname;

    if (currentPath.includes('leccion1')) return 'leccion1';
    if (currentPath.includes('leccion2')) return 'leccion2';
    if (currentPath.includes('leccion3')) return 'leccion3';

    // Por defecto, retornar leccion1
    return 'leccion1';
  }
};

// Exportar la configuración para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CURSO_CONFIG;
} else {
  window.CURSO_CONFIG = CURSO_CONFIG;
}
