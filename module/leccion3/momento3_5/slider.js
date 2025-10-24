export function init() {
  // Orden correcto
  const correctOrder = [
    "agente_transito_sld18",
    "señales_transitorias_sld18",
    "semaforos_sld18",
    "verticales_sld18",
    "horizontales_sld18"
  ];

  // Elementos DOM
  const container = document.querySelector('.container-dadarrast');
  const sortableContainer = document.querySelector('.sortable-container-dadarrast');
  const mobileContainer = document.querySelector('.mobile-container-dadarrast');
  const validateBtn = document.getElementById('validate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const validationMessage = document.querySelector('.validation-message-dadarrast');

  // Estado de la aplicación
  let isMobile = window.innerWidth <= 768;
  let hasInteraction = false;
  let isValidated = false;
  let selectedPositions = {};
  let items = Array.from(sortableContainer.querySelectorAll('.sortable-item-dadarrast'));

  // Inicializar con el orden específico: 5, 3, 4, 1, 2
  const initialOrder = [
    "horizontales_sld18", // 5
    "semaforos_sld18",    // 3
    "verticales_sld18",   // 4
    "agente_transito_sld18", // 1
    "señales_transitorias_sld18" // 2
  ];

  setInitialOrder(initialOrder);

  if (isMobile) {
    initMobileView();
  } else {
    initDesktopView();
  }

  // Event listeners
  validateBtn.addEventListener('click', handleValidate);
  resetBtn.addEventListener('click', handleReset);
  window.addEventListener('resize', handleResize);

  // Funciones
  function setInitialOrder(order) {
    // Limpiar el contenedor
    sortableContainer.innerHTML = '';

    // Agregar elementos en el orden específico
    order.forEach(id => {
      const item = items.find(item => item.getAttribute('data-id') === id);
      if (item) {
        sortableContainer.appendChild(item);
      }
    });

    // Actualizar el array de items
    items = Array.from(sortableContainer.querySelectorAll('.sortable-item-dadarrast'));
  }

  function initDesktopView() {
    sortableContainer.style.display = 'flex';
    mobileContainer.style.display = 'none';

    // Hacer elementos arrastrables
    items.forEach(item => {
      item.setAttribute('draggable', 'true');

      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', item.getAttribute('data-id'));
        item.classList.add('dragging');
        document.body.style.overflow = 'hidden';
      });

      item.addEventListener('dragend', () => {
        items.forEach(i => i.classList.remove('dragging'));
        document.body.style.overflow = '';
        hasInteraction = true;
        validateBtn.disabled = false;

        // Si ya se validó previamente, deshabilitar el botón de validar
        if (isValidated) {
          validateBtn.disabled = true;
        }
      });
    });

    sortableContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(sortableContainer, e.clientX);
      const draggable = document.querySelector('.dragging');
      if (draggable) {
        if (afterElement == null) {
          sortableContainer.appendChild(draggable);
        } else {
          sortableContainer.insertBefore(draggable, afterElement);
        }
      }
    });
  }

  function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.sortable-item-dadarrast:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  function initMobileView() {
    sortableContainer.style.display = 'none';
    mobileContainer.style.display = 'flex';
    mobileContainer.innerHTML = '';

    // Crear elementos móviles en el orden específico: 5, 3, 4, 1, 2
    const mobileOrder = [
      "horizontales_sld18", // 5
      "semaforos_sld18",    // 3
      "verticales_sld18",   // 4
      "agente_transito_sld18", // 1
      "señales_transitorias_sld18" // 2
    ];

    mobileOrder.forEach(id => {
      const item = items.find(item => item.getAttribute('data-id') === id);
      if (item) {
        const mobileItem = document.createElement('div');
        mobileItem.className = 'mobile-item-dadarrast';
        mobileItem.setAttribute('data-id', id);
        mobileItem.innerHTML = item.innerHTML;

        const select = document.createElement('select');
        select.className = 'mobile-select-dadarrast';
        select.innerHTML = '<option value="">Seleccione...</option>' +
          '<option value="1">Paso 1</option>' +
          '<option value="2">Paso 2</option>' +
          '<option value="3">Paso 3</option>' +
          '<option value="4">Paso 4</option>' +
          '<option value="5">Paso 5</option>';

        select.addEventListener('change', (e) => {
          const position = parseInt(e.target.value);
          const previousPosition = selectedPositions[id];
          selectedPositions[id] = position;
          hasInteraction = true;

          // Habilitar la opción previamente seleccionada en otros selects
          if (previousPosition) {
            document.querySelectorAll('.mobile-select-dadarrast').forEach(otherSelect => {
              if (otherSelect !== select) {
                const option = otherSelect.querySelector(`option[value="${previousPosition}"]`);
                if (option) option.disabled = false;
              }
            });
          }

          // Deshabilitar esta opción en otros selects
          if (position) {
            document.querySelectorAll('.mobile-select-dadarrast').forEach(otherSelect => {
              if (otherSelect !== select) {
                const option = otherSelect.querySelector(`option[value="${position}"]`);
                if (option) option.disabled = true;
              }
            });
          }

          // Habilitar el botón de validar si todos tienen selección
          const allSelected = Object.keys(selectedPositions).length === items.length &&
            Object.values(selectedPositions).every(pos => pos !== undefined && pos !== "");
          validateBtn.disabled = !allSelected;

          // Si ya se validó previamente, deshabilitar el botón de validar
          if (isValidated) {
            validateBtn.disabled = true;
          }
        });

        mobileItem.appendChild(select);
        mobileContainer.appendChild(mobileItem);
      }
    });
  }

  function handleValidate() {
    isValidated = true;
    resetBtn.disabled = false;
    validateBtn.disabled = true; // Deshabilitar el botón de validar después de la validación

    let results = [];

    if (isMobile) {
      // Validar para móvil
      items.forEach(item => {
        const id = item.getAttribute('data-id');
        const position = selectedPositions[id];
        const correctPosition = correctOrder.indexOf(id) + 1;
        const isCorrect = position === correctPosition;

        results.push({ id, isCorrect, correctPosition, currentPosition: position });

        const mobileItem = document.querySelector(`.mobile-item-dadarrast[data-id="${id}"]`);
        if (mobileItem) {
          if (isCorrect) {
            mobileItem.classList.add('correct-item-dadarrast');
            mobileItem.classList.remove('incorrect-item-dadarrast');
          } else {
            mobileItem.classList.add('incorrect-item-dadarrast');
            mobileItem.classList.remove('correct-item-dadarrast');
          }

          // Agregar icono de validación
          const iconDiv = document.createElement('div');
          iconDiv.className = 'validation-icon-dadarrast';

          const icon = document.createElement('img');
          icon.src = isCorrect ? '../../assets/img/btn_validacion/checkAct.png' : '../../assets/img/btn_validacion/xmarkAct.png';
          icon.alt = isCorrect ? 'Correcto' : 'Incorrecto';

          iconDiv.appendChild(icon);
          mobileItem.appendChild(iconDiv);

          // Deshabilitar el select
          const select = mobileItem.querySelector('select');
          select.disabled = true;
        }
      });
    } else {
      // Validar para desktop - CORREGIDO
      const currentOrder = Array.from(sortableContainer.querySelectorAll('.sortable-item-dadarrast'))
        .map(item => item.getAttribute('data-id'));

      // Validar cada elemento individualmente según su posición correcta
      results = items.map((item) => {
        const id = item.getAttribute('data-id');
        const currentIndex = currentOrder.indexOf(id);
        const correctIndex = correctOrder.indexOf(id);
        const isCorrect = currentIndex === correctIndex;

        return { id, isCorrect, currentIndex, correctIndex };
      });

      // Aplicar estilos de validación
      items.forEach((item) => {
        const id = item.getAttribute('data-id');
        const result = results.find(r => r.id === id);

        if (result.isCorrect) {
          item.classList.add('correct-item-dadarrast');
          item.classList.remove('incorrect-item-dadarrast');
        } else {
          item.classList.add('incorrect-item-dadarrast');
          item.classList.remove('correct-item-dadarrast');
        }

        // Agregar icono de validación
        const iconDiv = document.createElement('div');
        iconDiv.className = 'validation-icon-dadarrast';

        const icon = document.createElement('img');
        icon.src = result.isCorrect ? '../../assets/img/btn_validacion/checkAct.png' : '../../assets/img/btn_validacion/xmarkAct.png';
        icon.alt = result.isCorrect ? 'Correcto' : 'Incorrecto';

        iconDiv.appendChild(icon);
        item.appendChild(iconDiv);

        // Hacer no arrastrable
        item.setAttribute('draggable', 'false');
      });
    }

    // Mostrar mensaje de validación
    const correctCount = results.filter(r => r.isCorrect).length;
    const totalCount = correctOrder.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    validationMessage.style.display = 'block';
    if (correctCount === totalCount) {
      validationMessage.innerHTML = `
                <p class="validation-text-dadarrast">
                    <strong>¡Muy bien! ¡Has ordenado correctamente las señales de tránsito!</strong>
                </p>
                <p class="validation-score-dadarrast">
                    <strong>Tus respuestas correctas son: ${correctCount} de ${totalCount} (${percentage}%)</strong>
                </p>
            `;
      validationMessage.style.backgroundColor = '#e8f5e9';
    } else {
      validationMessage.innerHTML = `
                <p class="validation-text-dadarrast">
                    <strong>El orden no es correcto.</strong>
                </p>
                <p class="validation-score-dadarrast">
                    <strong>Tus respuestas correctas son: ${correctCount} de ${totalCount} (${percentage}%)</strong>
                </p>
            `;
      validationMessage.style.backgroundColor = '#ffebee';
    }
  }

  function handleReset() {
    // Reiniciar estado
    hasInteraction = false;
    isValidated = false;
    selectedPositions = {};

    // Limpiar validación
    validationMessage.style.display = 'none';

    if (isMobile) {
      // Reiniciar vista móvil
      document.querySelectorAll('.mobile-item-dadarrast').forEach(item => {
        item.classList.remove('correct-item-dadarrast', 'incorrect-item-dadarrast');
        const icon = item.querySelector('.validation-icon-dadarrast');
        if (icon) icon.remove();

        const select = item.querySelector('select');
        const previousValue = select.value;
        select.value = "";

        // Habilitar todas las opciones
        Array.from(select.options).forEach(option => {
          option.disabled = false;
        });

        select.disabled = false;
      });

      validateBtn.disabled = true;
    } else {
      // Restablecer el orden inicial específico: 5, 3, 4, 1, 2
      const initialOrder = [
        "horizontales_sld18", // 5
        "semaforos_sld18",    // 3
        "verticales_sld18",   // 4
        "agente_transito_sld18", // 1
        "señales_transitorias_sld18" // 2
      ];

      setInitialOrder(initialOrder);

      document.querySelectorAll('.sortable-item-dadarrast').forEach(item => {
        item.classList.remove('correct-item-dadarrast', 'incorrect-item-dadarrast', 'dragging');
        const icon = item.querySelector('.validation-icon-dadarrast');
        if (icon) icon.remove();

        item.setAttribute('draggable', 'true');
      });

      validateBtn.disabled = true; // Deshabilitar el botón de validar al reiniciar
    }

    resetBtn.disabled = true;
  }

  function handleResize() {
    const newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== isMobile) {
      isMobile = newIsMobile;
      handleReset();

      if (isMobile) {
        initMobileView();
      } else {
        initDesktopView();
      }
    }
  }
}