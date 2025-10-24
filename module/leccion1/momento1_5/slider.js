// JavaScript
export function init() {
  // Elementos del DOM
  const items = document.querySelectorAll('.image-item');
  const explanationContainer = document.getElementById('explanation-container');
  const explanationText = document.querySelector('.explanation-text');
  const resetButton = document.getElementById('reset-button');
  const progressContainer = document.getElementById('progress-container');
  const progressText = document.querySelector('.progress-text');

  // Estado de la actividad
  let selectedImages = [];
  let results = {};

  // Imágenes correctas (las primeras 4)
  const correctImages = [
    'estado_ebriedad',
    'no_mantener_distancia',
    'conducir_distraido',
    'respetar_limite_velocidad'
  ];

  // Explicaciones para cada imagen
  const explanationsMap = {
    'estado_ebriedad': 'Estado de ebriedad: Correcto! Conducir ebrio NUNCA es manejo defensivo. ¡Peligro extremo!',
    'no_mantener_distancia': 'No mantener distancia segura: Correcto! No mantener distancia es un error grave. ¡Sin espacio, no hay reacción!',
    'conducir_distraido': 'Conducir distraído: Correcto! Las distracciones al volante invalidan el manejo defensivo.',
    'respetar_limite_velocidad': 'No respetar límites de velocidad: Correcto! Exceder el límite de velocidad es INSEGURO y anti-defensivo.',
    'vehiculo_buen_estado': 'Vehículo en buen estado: Incorrecto!: Esto SÍ es manejo defensivo. Un vehículo en buen estado previene fallas.',
    'respetar_señales': 'Respetar señales de tránsito: Incorrecto!: Esto SÍ es manejo defensivo. Respetar señales salva vidas.'
  };

  // Función para manejar la selección de imágenes
  function actSelectImg(image) {
    const isSelected = selectedImages.includes(image);
    let newSelectedImages = [...selectedImages];

    if (isSelected) {
      // Deseleccionar
      newSelectedImages = newSelectedImages.filter(img => img !== image);
      explanationContainer.classList.add('hidden');
    } else if (newSelectedImages.length < 6) {
      // Seleccionar
      newSelectedImages.push(image);

      // Mostrar explicación
      const isCorrect = correctImages.includes(image);
      explanationText.textContent = explanationsMap[image];
      explanationText.className = `explanation-text ${isCorrect ? 'explanation-correct' : 'explanation-incorrect'}`;
      explanationContainer.classList.remove('hidden');
    }

    selectedImages = newSelectedImages;

    // Actualizar resultados
    const isCorrect = correctImages.includes(image);
    results[image] = isSelected ? undefined : isCorrect;

    // Actualizar UI
    updateUI();
    updateValidationMessage();
  }

  // Función para actualizar la interfaz
  function updateUI() {
    items.forEach(item => {
      const image = item.getAttribute('data-image');
      const isSelected = selectedImages.includes(image);

      // Actualizar clase de selección
      if (isSelected) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }

      // Actualizar icono de resultado
      const existingResult = item.querySelector('.result-icon');
      if (existingResult) {
        existingResult.remove();
      }

      if (isSelected && results[image] !== undefined) {
        const resultImg = document.createElement('img');
        resultImg.className = 'result-icon';
        resultImg.src = results[image] === true
          ? '../../assets/img/botones/checkAct.png'
          : '../../assets/img/botones/xmarkAct.png';
        resultImg.alt = results[image] === true ? 'Correcto' : 'Incorrecto';
        item.appendChild(resultImg);
      }
    });
  }

  // Función para actualizar el mensaje de validación
  function updateValidationMessage() {
    if (selectedImages.length === 0) {
      progressContainer.classList.add('hidden');
      return;
    }

    const totalCorrect = selectedImages.filter(img => correctImages.includes(img)).length;
    const percentage = Math.round((totalCorrect / 4) * 100);

    // Mostrar contador de progreso
    progressText.textContent = `Tus respuestas correctas son: ${totalCorrect} de 4 (${percentage}%)`;
    progressContainer.classList.remove('hidden');
  }

  // Función para reiniciar la actividad
  function resetActivity() {
    selectedImages = [];
    results = {};
    explanationContainer.classList.add('hidden');
    progressContainer.classList.add('hidden');
    updateUI();
  }

  // Event Listeners
  items.forEach(item => {
    item.addEventListener('click', () => {
      const image = item.getAttribute('data-image');
      actSelectImg(image);
    });
  });

  resetButton.addEventListener('click', resetActivity);
}