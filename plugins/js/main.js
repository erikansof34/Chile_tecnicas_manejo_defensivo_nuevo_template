// Configuración del curso - Ahora usa configuración global
// Detectar lección actual automáticamente
const leccionActual = CURSO_CONFIG.getLeccionActual();

// Obtener configuración de la lección actual
const momentosCurso = CURSO_CONFIG.getMomentos(leccionActual);
const sliders = CURSO_CONFIG.getSliders(leccionActual);

// Estado actual del curso
let currentIndex = 0;
let slideActualEnMomento = 1;

// Configuración de navegación entre páginas - Ahora desde configuración centralizada
const configuracionNavegacion = CURSO_CONFIG.getNavegacion(leccionActual);

function obtenerNombreMomento(momentoId) {
  const nombre = momentosCurso[momentoId]; // versión escritorio
  const nombreMobile = `Lección ${momentoId}`; // versión móvil

  return { nombre, nombreMobile };
}

// Función para obtener el momento actual
function obtenerMomentoActual() {
  if (currentIndex >= 0 && currentIndex < sliders.length) {
    const momentoId = sliders[currentIndex].momento;
    const { nombre, nombreMobile } = obtenerNombreMomento(momentoId);

    // Calcular slide actual en el momento
    const indexEnMomento = sliders
      .slice(0, currentIndex + 1)
      .filter(s => s.momento === momentoId).length;
    slideActualEnMomento = indexEnMomento;

    return { id: momentoId, nombre, nombreMobile };
  }
  return { id: 1, nombre: momentosCurso[1], nombreMobile: "Lección 1" };
}

// Función para detectar cambio de momento
function detectarCambioMomento(indexAnterior, indexActual) {
  const momentoAnterior = obtenerMomentoEnIndex(indexAnterior);
  const momentoActual = obtenerMomentoEnIndex(indexActual);

  return momentoAnterior && momentoActual && momentoAnterior.id !== momentoActual.id;
}

// Función auxiliar para obtener momento en un índice específico
function obtenerMomentoEnIndex(index) {
  if (index >= 0 && index < sliders.length) {
    const momentoId = sliders[index].momento;
    const nombreMomento = momentosCurso[momentoId];
    return { id: momentoId, nombre: nombreMomento };
  }
  return null;
}


// Función para calcular el progreso total del curso
function calcularProgresoTotal() {
  const progreso = JSON.parse(localStorage.getItem('cursoProgreso') || '{}');
  let slidesCompletadosTotal = 0;

  // Obtener todas las lecciones disponibles desde la configuración
  const leccionesDisponibles = CURSO_CONFIG.getAllLecciones();

  // Calcular total de slides del curso completo
  const totalSlidesDelCurso = CURSO_CONFIG.getTotalSlidesCurso();

  // Recorrer todas las lecciones y calcular progreso
  leccionesDisponibles.forEach(leccionId => {
    if (progreso[leccionId]) {
      const momentosLeccion = CURSO_CONFIG.getMomentos(leccionId);
      const slidersLeccion = CURSO_CONFIG.getSliders(leccionId);

      // Contar slides completados por momento en esta lección
      for (const momentoId in momentosLeccion) {
        const slidesDelMomento = slidersLeccion.filter(s => s.momento == momentoId).length;
        const slideAlcanzado = progreso[leccionId][momentoId] || 0;
        slidesCompletadosTotal += Math.min(slideAlcanzado, slidesDelMomento);
      }
    }
  });

  // Calcular porcentaje del curso completo
  return Math.round((slidesCompletadosTotal / totalSlidesDelCurso) * 100);
}

// Función para actualizar la interfaz de progreso
function actualizarInterfazProgreso(slideActual) {
  const momentoActual = obtenerMomentoActual();
  if (!momentoActual) return;

  const slideNumero = slideActual || (currentIndex + 1);

  // Actualizar contadores
  updateElement('textProg', slideNumero);
  updateElement('nSlider', sliders.length);

  // Guardar progreso
  guardarProgreso(momentoActual.id, slideActualEnMomento);

  // Calcular y actualizar progreso total
  const progresoTotal = calcularProgresoTotal();
  updateElement('porcentajeProgreso', progresoTotal);

  // Actualizar barra de progreso
  const progBar = document.querySelector(".progBar > div");
  if (progBar) progBar.style.width = progresoTotal + "%";

  // Actualizar círculos y breadcrumb
  actualizarCirculosProgreso();
  actualizarDropdownSliderMenuActivo();
  actualizarBreadcrumb(momentoActual.nombre, momentoActual.nombreMobile);
}

// Función auxiliar para actualizar elementos
function updateElement(id, content) {
  const element = document.getElementById(id);
  if (element) element.textContent = content;
}

// Función para actualizar el breadcrumb
function actualizarBreadcrumb(nombreMomento, nombreMobile) {
  const breadcrumb = document.getElementById('breadcrumb');
  const breadcrumbMovil = document.getElementById('breadcrumb_movil');

  if (breadcrumb) {
    breadcrumb.textContent = nombreMomento;
  }
  if (breadcrumbMovil) {
    breadcrumbMovil.textContent = nombreMobile;
  }
}

// Función para guardar progreso en localStorage
function guardarProgreso(momentoId, slide) {
  const progreso = JSON.parse(localStorage.getItem('cursoProgreso') || '{}');

  // Usar la lección detectada automáticamente
  const leccionId = leccionActual;

  // Inicializar la estructura de la lección si no existe
  if (!progreso[leccionId]) {
    progreso[leccionId] = {};
  }

  // Actualizar el progreso del momento actual dentro de la lección
  progreso[leccionId][momentoId] = Math.max(progreso[leccionId][momentoId] || 0, slide);
  progreso[leccionId].currentIndex = currentIndex;
  progreso[leccionId].timestamp = new Date().toISOString();

  localStorage.setItem('cursoProgreso', JSON.stringify(progreso));
}

// Función para cargar progreso guardado
function cargarProgresoGuardado() {
  try {
    const progreso = JSON.parse(localStorage.getItem('cursoProgreso') || '{}');
    const leccionId = leccionActual;

    // Verificar si existe progreso para esta lección
    if (progreso[leccionId]) {
      currentIndex = Math.min(progreso[leccionId].currentIndex || 0, sliders.length - 1);
    } else {
      currentIndex = 0;
    }

    return currentIndex > 0;
  } catch (error) {
    console.error('Error al cargar progreso:', error);
    currentIndex = 0;
    return false;
  }
}

async function loadSlider(index) {
  const slider = sliders[index];
  const router = slider.router;
  const container = document.getElementById('slider-container');
  container.innerHTML = '';

  try {
    const html = await fetch(`../../module/${leccionActual}/${router}/index.html`).then(res => res.text());
    container.innerHTML = html;

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = `../../module/${leccionActual}/${router}/slider.css`;
    document.head.appendChild(cssLink);

    const module = await import(`../../module/${leccionActual}/${router}/slider.js`);
    module.init?.();

    window.initTranscripciones?.(document.getElementById('slider-container'));
    
    // Actualizar interfaz de progreso después de cargar el slider
    actualizarInterfazProgreso();
    actualizarPosicionNavegacion();

  } catch (error) {
    console.error('Error al cargar slider:', error);
    container.innerHTML = '<div class="error">Error al cargar el contenido</div>';
  }
}

window.prevSlide = () => {
  if (currentIndex > 0) {
    const indexAnterior = currentIndex;
    currentIndex--;

    // Detectar cambio de momento
    detectarCambioMomento(indexAnterior, currentIndex);

    loadSlider(currentIndex);
  } else {
    // Estamos en el primer slide, ir a página anterior
    navegarAPaginaAnterior();
  }
};

window.nextSlide = () => {
  if (currentIndex < sliders.length - 1) {
    const indexAnterior = currentIndex;
    currentIndex++;

    // Detectar cambio de momento
    detectarCambioMomento(indexAnterior, currentIndex);

    loadSlider(currentIndex);
  } else {
    // Estamos en el último slide, ir a página siguiente
    navegarAPaginaSiguiente();
  }
};

// Función para pausar elementos multimedia
function pausarElementosMultimedia() {
  document.querySelectorAll('audio, video').forEach(element => {
    if (!element.paused) element.pause();
  });
}

// Función para ir al inicio (botón home) y navegación por círculos
window.progCircle = (slideNumber, plataforma = 0) => {
  pausarElementosMultimedia();

  const targetIndex = slideNumber - 1;

  if (targetIndex >= 0 && targetIndex < sliders.length) {
    currentIndex = targetIndex;
    loadSlider(currentIndex);
    actualizarCirculosProgreso();
    actualizarDropdownSliderMenuActivo();
  } else {
    console.error('targetIndex fuera de rango:', targetIndex);
  }
};

// Función para generar círculos de progreso
function createProgCircle() {
  const contCircleBar = document.querySelector('.contCircleBar');
  const contCircleBarMovil = document.querySelector('.contCircleBarMovil');

  // Limpiar contenedores
  if (contCircleBar) contCircleBar.innerHTML = '';
  if (contCircleBarMovil) contCircleBarMovil.innerHTML = '';

  for (let i = 1; i <= sliders.length; i++) {
    // Crear círculo para desktop
    if (contCircleBar) {
      const span = document.createElement('span');
      span.style.cursor = 'pointer';
      span.addEventListener('click', () => progCircle(i, 0));
      if (i === 1) span.classList.add('current');
      contCircleBar.appendChild(span);
    }

    // Crear círculo para móvil
    if (contCircleBarMovil) {
      const spanMovil = document.createElement('span');
      spanMovil.style.cursor = 'pointer';
      spanMovil.addEventListener('click', () => progCircle(i, 1));
      if (i === 1) spanMovil.classList.add('current');
      contCircleBarMovil.appendChild(spanMovil);
    }
  }
}

// Función para actualizar círculos de progreso
function actualizarCirculosProgreso() {
  const slideNumber = currentIndex + 1;
  const allCircles = document.querySelectorAll('.contCircleBar span, .contCircleBarMovil span');

  allCircles.forEach((span, index) => {
    span.classList.remove('current', 'current2');
    const circleNumber = index < sliders.length ? index + 1 : (index - sliders.length) + 1;

    if (circleNumber < slideNumber) {
      span.classList.add('current2');
    } else if (circleNumber === slideNumber) {
      span.classList.add('current');
    }
  });
}

// Inicialización del curso
function initializeApp() {
  createProgCircle();
  cargarProgresoGuardado();
  loadSlider(currentIndex);

  // Asignar evento al gripBtn SOLO UNA VEZ
  const gripBtn = document.getElementById('dropdownGripBtn');
  const dropdown = document.getElementById('dropdownSliderMenu');
  if (gripBtn && dropdown) {
    gripBtn.onclick = (e) => {
      e.stopPropagation();
      crearDropdownSliderMovil();
      actualizarDropdownSliderMenuActivo();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    };
    // Ocultar menú al hacer click fuera
    document.addEventListener('click', function hideDropdown(e) {
      if (!dropdown.contains(e.target) && e.target !== gripBtn) {
        dropdown.style.display = 'none';
      }
    });
  }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}


// Función para navegar a página anterior
function navegarAPaginaAnterior() {
  if (configuracionNavegacion.mostrarConfirmacion) {
    const confirmar = confirm('Has llegado al inicio del contenido. ¿Deseas ir a la página anterior?');
    if (confirmar) {
      window.location.href = configuracionNavegacion.paginaAnterior;
    }
  } else {
    window.location.href = configuracionNavegacion.paginaAnterior;
  }
}

// Función para navegar a página siguiente
function navegarAPaginaSiguiente() {
  if (configuracionNavegacion.mostrarConfirmacion) {
    const confirmar = confirm('¡Has completado todo el contenido! ¿Deseas continuar a la siguiente sección?');
    if (confirmar) {
      window.location.href = configuracionNavegacion.paginaSiguiente;
    }
  } else {
    window.location.href = configuracionNavegacion.paginaSiguiente;
  }
}

function loadIframe({ id, src, srcMobile, className = '', style = '', styleMobile = '' }) {
  const container = document.getElementById(id);
  if (!container) return;

  const isMobile = window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const finalSrc = isMobile && srcMobile ? srcMobile : src;
  const finalStyle = isMobile && styleMobile ? styleMobile : style;

  const loader = container.querySelector(".loader");
  const existingIframe = container.querySelector("iframe");

  if (loader) loader.style.display = "block";

  function adjustIframeHeight(iframe) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDoc) {
        const contentHeight = iframeDoc.documentElement.scrollHeight;
        const minHeight = 350;
        const maxHeight = 680;
        const finalHeight = Math.max(minHeight, Math.min(contentHeight, maxHeight));
        iframe.style.height = finalHeight + 'px';
      }
    } catch (e) {
      iframe.style.height = '600px auto';
    }
  }

  if (existingIframe) {
    existingIframe.style.opacity = "0";
    existingIframe.src = finalSrc;
    existingIframe.addEventListener("load", function () {
      if (loader) loader.style.display = "none";
      existingIframe.style.opacity = "1";
      setTimeout(() => adjustIframeHeight(existingIframe), 500);
    }, { once: true });
  } else {
    const iframe = document.createElement("iframe");
    iframe.src = finalSrc;
    iframe.className = className;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "allowfullscreen");
    iframe.setAttribute("allow", "geolocation *; microphone *; camera *; midi *; encrypted-media *");
    iframe.setAttribute("scrolling", "no");
    iframe.loading = "lazy";
    iframe.style = `opacity: 0; transition: opacity 0.5s; min-width: 300px; ${finalStyle}`;
    iframe.addEventListener("load", function () {
      if (loader) loader.style.display = "none";
      iframe.style.opacity = "1";
      setTimeout(() => adjustIframeHeight(iframe), 500);
    });
    container.appendChild(iframe);
  }
}

// === CONTROL DINÁMICO DE VISIBILIDAD DEL BOTÓN FINAL ===
function sliderActualTieneScroll() {
  const container = document.getElementById('slider-container');
  if (!container) return false;
  // Si el contenido del slider es más alto que el área visible, hay scroll
  return container.scrollHeight > container.clientHeight;
}

function controlarVisibilidadBotonesNavegacion() {
  const btnPrev = document.getElementById('pagIndex');
  const btnNext = document.getElementById('next');

  const btnAbajo = document.getElementById('btnParallaxMobile');

  const container = document.getElementById('slider-container');
  if (!btnPrev || !btnNext || !container || !btnAbajo) return;

  if (!sliderActualTieneScroll()) {
    btnPrev.classList.remove('ocultar');
    btnNext.classList.remove('ocultar');
    btnAbajo.classList.remove('ocultar');
    return;
  }

  // Si hay scroll, mostrar solo al llegar al final del slider-container
  if (container.scrollTop + container.clientHeight >= container.scrollHeight - 2) {
    btnPrev.classList.remove('ocultar');
    btnNext.classList.remove('ocultar');
    btnAbajo.classList.add('ocultar');
  } else {
    btnPrev.classList.add('ocultar');
    btnNext.classList.add('ocultar');
    btnAbajo.classList.remove('ocultar');
  }
}

function actualizarBotonesNavegacion() {
  controlarVisibilidadBotonesNavegacion();

  const container = document.getElementById('slider-container');
  // Scroll en contenedor (escritorio)
  if (container) {
    container.removeEventListener('scroll', controlarVisibilidadBotonesNavegacion);
    container.addEventListener('scroll', controlarVisibilidadBotonesNavegacion);
  }
  // Scroll global (móvil)
  window.removeEventListener('scroll', controlarVisibilidadHaciaAbajo);
  window.addEventListener('scroll', controlarVisibilidadHaciaAbajo);

  // También actualizar al cambiar el tamaño de la ventana
  window.removeEventListener('resize', controlarVisibilidadBotonesNavegacion);
  window.addEventListener('resize', controlarVisibilidadBotonesNavegacion);
}

const originalLoadSlider = loadSlider;
window.loadSlider = async function (index) {
  await originalLoadSlider(index);
  const btnPrev = document.getElementById('pagIndex');
  const btnNext = document.getElementById('next');
  if (btnPrev) btnPrev.classList.add('ocultar');
  if (btnNext) btnNext.classList.add('ocultar');
  setTimeout(actualizarBotonesNavegacion, 5);
};

function actualizarDropdownSliderMenuActivo() {
  const slideNumber = currentIndex + 1;
  const dots = document.querySelectorAll('#dropdownSliderMenu .dropdown-oval-dot');

  dots.forEach((dot, index) => {
    dot.classList.remove('current', 'current2', 'active');

    const circleNumber = index < sliders.length ? index + 1 : (index - sliders.length) + 1;

    if (circleNumber < slideNumber) {
      dot.classList.add('current2');
    } else if (circleNumber === slideNumber) {
      dot.classList.add('active');
    }
  });
}


function controlarVisibilidadHaciaAbajo() {
  const btnAbajo = document.getElementById('btnParallaxMobile');
  if (!btnAbajo) return;

  let scrollTop = document.documentElement.scrollTop;
  let clientHeight = window.innerHeight;
  let scrollHeight = document.documentElement.scrollHeight;

  // Distancia al final
  let distanciaFinal = scrollHeight - (scrollTop + clientHeight);

  // No hay scroll (contenido <= alto de la ventana)
  const sinScroll = scrollHeight <= clientHeight;

  if (sinScroll || distanciaFinal <= 50) {
    btnAbajo.classList.add('ocultar');
  } else {
    btnAbajo.classList.remove('ocultar');
  }
}

document.getElementById('btnParallaxMobile')?.addEventListener('click', function () {
  const section = document.querySelector('section');
  if (!section) return;
  const btnAbajo = document.getElementById('btnParallaxMobile');
  if (!btnAbajo) return;


  // Busca todos los divs con clase que contiene "col-" dentro del section
  const divsCol = Array.from(section.querySelectorAll('div[class*="col-"]'));

  // Encuentra el primer div "col-" que está más abajo del viewport
  const nextDiv = divsCol.find(div => {
    const rect = div.getBoundingClientRect();
    return rect.top > 10;
  });

  if (nextDiv) {
    const rect = nextDiv.getBoundingClientRect();

    // Condicional para cuando está muy cerca (menos de 50px)
    if (rect.top <= 50) {
      btnAbajo.classList.add('ocultar');
      return;
    }

    // Scroll hasta el siguiente div "col-"
    const top = rect.top + window.scrollY;
    window.scrollTo({
      top: top,
      behavior: 'smooth'
    });
  } else {
    // Si no hay más divs "col-", baja hasta el final de la página
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  }
});

function actualizarPosicionNavegacion() {
  // Solo ejecutar en pantallas menores a 992px de ancho
  if (window.innerWidth >= 992) {
    const nav = document.querySelector('.btn-navigation-container');
    if (nav) nav.classList.remove('btn-navigation-fixed-bottom');
    return;
  }

  const nav = document.querySelector('.btn-navigation-container');
  const divider = document.querySelector('.dividerImg');
  if (!nav) return;

  if (!divider) {
    // Si no existe dividerImg, quita la clase
    nav.classList.remove('btn-navigation-fixed-bottom');
    return;
  }

  const btnAbajo = document.getElementById('btnParallaxMobile');
  setTimeout(() => {
    btnAbajo.classList.add('ocultar');
  }, 7);

  const rect = divider.getBoundingClientRect();
  const visible = rect.top < window.innerHeight && rect.bottom > 0;

  if (visible) {
    nav.classList.add('btn-navigation-fixed-bottom');
  } else {
    nav.classList.remove('btn-navigation-fixed-bottom');
  }
}

// Ejecuta al hacer scroll, resize y cuando se cargue el contenido dinámico
window.addEventListener('scroll', actualizarPosicionNavegacion);
window.addEventListener('resize', actualizarPosicionNavegacion);
document.addEventListener('DOMContentLoaded', actualizarPosicionNavegacion);

// Dropdown para sliders en móvil
function crearDropdownSliderMovil() {
  const dropdown = document.getElementById('dropdownSliderMenu');
  if (!dropdown) return;

  // Limpiar menú
  dropdown.innerHTML = '';
  // Crear lista de sliders
  const ul = document.createElement('ul');
  ul.className = 'list-group d-flex flex-row flex-wrap justify-content-start px-2 py-2';
  sliders.forEach((slider, idx) => {
    const li = document.createElement('li');
    li.className = 'list-group-item border-0 bg-transparent p-0 m-0';
    // Punto ovalado
    const punto = document.createElement('span');
    punto.className = 'dropdown-oval-dot';
    if (idx === currentIndex) punto.classList.add('active');
    li.appendChild(punto);
    li.onclick = () => {
      dropdown.style.display = 'none';
      progCircle(idx + 1, 1);
    };
    ul.appendChild(li);
  });
  dropdown.appendChild(ul);
}


// Función similar a loadIframe pero para modales
/**
 * Función principal para crear modales dinámicos con iframes
 * Se usa en los sliders para cargar actividades interactivas
 * Ejemplo de uso:
 * loadModalIframe({
 *   id: "Slide25WebActivity",
 *   src: "../../actividades/actividad_dragandrop_ordenar_nom035/index.html",
 *   title: "Protocolo de Atención ATS",
 *   titleMobile: "Protocolo ATS",
 *   mobileHeight: '69vh',
 *   desktopHeight: '76vh',
 *   modalSize: 'large'
 * });
 */
function loadModalIframe({ id, src, title, titleMobile, mobileHeight = '69vh', desktopHeight = '76vh', modalSize = 'large', buttonId, mobileSrc, desktopSrc }) {
  // Usar src para ambos si no se especifican mobileSrc/desktopSrc
  const finalMobileSrc = mobileSrc || src;
  const finalDesktopSrc = desktopSrc || src;
  const finalTitle = title || 'Actividad Interactiva';
  const finalButtonId = buttonId || `modalButton_${id}`;

  // Configuración del modal (local, no global)
  const config = {
    buttonId: finalButtonId,
    title: finalTitle,
    titleMobile: titleMobile || finalTitle,
    mobileSrc: finalMobileSrc,
    desktopSrc: finalDesktopSrc,
    mobileHeight,
    desktopHeight,
    modalSize
  };

  // Buscar el contenedor donde debería estar el botón
  const container = document.getElementById(id);
  if (!container) {
    return;
  }

  // Crear botón si no existe
  let button = document.getElementById(finalButtonId);
  if (!button) {
    button = document.createElement('button');
    button.id = finalButtonId;
    button.className = 'btn btn-primary btn-lg sf-btn-primary';
    button.innerHTML = `<i class="fas fa-play-circle me-2"></i>${finalTitle}`;

    // Limpiar contenedor y agregar botón
    container.innerHTML = '';
    container.appendChild(button);

    // Crear contenedor del modal
    const modalContainer = document.createElement('div');
    modalContainer.id = `modalContainer${id.charAt(0).toUpperCase() + id.slice(1)}`;
    container.appendChild(modalContainer);
  }

  // Asignar evento al botón solo si no lo tiene ya
  if (!button.hasAttribute('data-modal-initialized')) {
    button.addEventListener("click", () => openModal(id, config));
    button.setAttribute('data-modal-initialized', 'true');
  } else {
  }
}

// Exportar función principal globalmente para uso en sliders
window.loadModalIframe = loadModalIframe;

// ========================= SISTEMA DE MODALES DINÁMICOS =========================

/**
 * Detecta si el dispositivo es móvil basado en el ancho de pantalla y user agent
 * @returns {boolean} true si es dispositivo móvil
 */
function isMobile() {
  return (
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
}

/**
 * Crea el elemento modal dinámicamente (función interna)
 * @param {string} slideId - ID del slide
 * @param {Object} config - Configuración del modal
 * @returns {HTMLElement|null} El modal creado o null si hay error
 */
function createModal(slideId, config) {
  const modalContainer = document.getElementById(
    `modalContainer${slideId.charAt(0).toUpperCase() + slideId.slice(1)}`
  );

  if (!modalContainer) {
    return null;
  }

  const modal = document.createElement("div");
  modal.className = `modal-common modal-${config.modalSize}`;

  modal.innerHTML = `
        <div class="modal-content-common">
            <div class="modal-content-header sf-bg-dark">
                <div class="modal-title">
                    <h2 class="sf-text-white"></h2>
                </div>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="loader spinner-pulse"></div>
                <div class="iframe-container"></div>
            </div>
        </div>
    `;

  modalContainer.appendChild(modal);
  return modal;
}

/**
 * Abre un modal configurado previamente (función interna)
 * @param {string} slideId - ID del slide
 * @param {Object} config - Configuración del modal
 */
function openModal(slideId, config) {
  // Ocultar navegación inmediatamente
  const navContainer = document.querySelector('.btn-navigation-container-2');
  if (navContainer) {
    navContainer.style.display = 'none';
  }

  // Agregar clase al body
  document.body.classList.add('modal-active');

  const modal = createModal(slideId, config);
  if (!modal) return;

  const title = modal.querySelector(".modal-title h2");
  const loader = modal.querySelector(".loader");
  const iframeContainer = modal.querySelector(".iframe-container");
  const closeBtn = modal.querySelector(".close");

  // Configurar título según dispositivo
  title.textContent = isMobile() && config.titleMobile ? config.titleMobile : config.title;

  // Mostrar loader
  loader.classList.remove('hidden');

  // Crear iframe
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = isMobile() ? config.mobileHeight : config.desktopHeight;
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.transition = "opacity 0.3s";
  iframe.setAttribute("allowfullscreen", "true");
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("frameborder", "0");

  // Variable para controlar el estado del loader
  let loaderHidden = false;

  // Función para ocultar loader (solo una vez)
  const hideLoader = () => {
    if (!loaderHidden) {
      loaderHidden = true;
      loader.classList.add('hidden');
      iframe.style.opacity = "1";
    }
  };

  // Agregar iframe al contenedor PRIMERO
  iframeContainer.appendChild(iframe);

  // DESPUÉS configurar el evento load y el src
  iframe.addEventListener("load", function () {
    hideLoader();
  });

  // También escuchar cuando el iframe esté completamente listo
  iframe.addEventListener("DOMContentLoaded", function () {
    hideLoader();
  });

  // Delay de 8 segundos antes de empezar a cargar el iframe
  setTimeout(() => {
    // Configurar src después del delay para que se dispare el load
    iframe.src = isMobile() ? config.mobileSrc : config.desktopSrc;
  }, 3000); // Delay de 8 segundos

  // Timeout de seguridad (pero que no interfiera con el evento load normal)
  setTimeout(() => {
    if (!loaderHidden) {
      loaderHidden = true;
      loader.classList.add('hidden');
      // Solo mostrar mensaje de error si realmente no se cargó
      if (iframe.style.opacity === "0") {
        iframeContainer.innerHTML = "<p>El contenido está tardando demasiado en cargar...</p>";
      }
    }
  }, 23000); // Aumentado a 23 segundos (8 segundos de delay + 15 segundos de timeout)

  // Función de cierre mejorada
  const customCloseModal = () => {
    closeModal(modal);
    // Mostrar navegación al cerrar
    if (navContainer) {
      navContainer.style.display = 'flex';
    }
    // Remover clase del body
    document.body.classList.remove('modal-active');
  };

  // Eventos de cierre (sin duplicados)
  closeBtn.addEventListener("click", customCloseModal, { once: true });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) customCloseModal();
  }, { once: true });

  // Animación de entrada
  modal.classList.add("fade-in");
}

/**
 * Cierra un modal con animación (función interna)
 * @param {HTMLElement} modal - El elemento modal a cerrar
 */
function closeModal(modal) {
  modal.classList.remove("fade-in");
  modal.classList.add("fade-out");
  setTimeout(() => {
    modal.remove();
  }, 300);
}