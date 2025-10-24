export function init() {
  //----------------------------------------------//
  //LECCION 1 SLIDER 3
  let currentIndex_sld3_lec1 = 0;
  const slides_sld3_lec1 = document.querySelectorAll('.slide-sld3_lec1');

  // Verificar que tenemos slides
  if (slides_sld3_lec1.length === 0) {
    console.error('No se encontraron slides con la clase .slide-sld3_lec1');
    return;
  }

  // Asegurarse de que solo el slide activo tenga la clase active
  function showNextSlide_sld3_lec1() {
    // Remover la clase active de todos los slides
    slides_sld3_lec1.forEach(slide => {
      slide.classList.remove('active-sld3_lec1');
    });

    // Avanzar al siguiente slide
    currentIndex_sld3_lec1 = (currentIndex_sld3_lec1 + 1) % slides_sld3_lec1.length;

    // Agregar la clase active al slide actual
    slides_sld3_lec1[currentIndex_sld3_lec1].classList.add('active-sld3_lec1');
  }

  // Iniciar el intervalo para cambiar slides
  setInterval(showNextSlide_sld3_lec1, 3000); // cambia cada 3 segundos
}