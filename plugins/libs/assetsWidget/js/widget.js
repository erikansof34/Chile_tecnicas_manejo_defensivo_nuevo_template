// widget.js
(function () {
    // Variables de estado para los botones toggle
    var isSaturationOn = false;
    var isHighContrastOn = false;
    var isLowContrastOn = false;
    var isNegativeOn = false;
    var isGrayscaleOn = false;
    var isLegibleFontOn = false;
    var areImagesHidden = false;
    var areSoundsStopped = false;
    var isFocusModeOn = false;

    // Variables para controlar el tamaño del texto
    var originalFontSizes = new Map();
    var currentFontSizeMultiplier = 1;
    var fontSizeSteps = 0;
    var increaseButton, decreaseButton;

    // Variables para navegación y lectura
    var isTextToSpeechOn = false;
    var areLinksHighlighted = false;
    var areHeadingsHighlighted = false;
    var isBigCursorOn = false;
    var isKeyboardNavOn = false;
    var isVoiceNavOn = false;

    // Elementos protegidos de los filtros visuales
    const protectedElements = [
        '#accessibility-widget',
        '#accessibility-widget *',
        '.btn-navigation-container',
        '.btn-navigation-container *',
        '.headerOpc',
        '.headerOpc *'
    ];

    // Crear el contenedor del widget
    var widgetContainer = document.createElement('div');
    widgetContainer.id = 'accessibility-widget';
    widgetContainer.style.position = 'fixed';
    widgetContainer.style.zIndex = '2147483647'; // Máximo valor posible de z-index

    // Media query para móvil
    var mobileMediaQuery = window.matchMedia('(max-width: 768px)');
    var widgetPosition = 'right'; // Cambiado a 'right' por defecto

    // Variables para control de scroll en móvil
    var scrollTimeout;
    var lastScrollPosition = 0;
    var isScrolling = false;

    function handleMobileChange(e) {
        if (e.matches) {
            // Estilos para móvil - posicionar respecto a .contentModule
            const contentModule = document.querySelector('.contentModule');
            if (contentModule) {
                const contentModuleRect = contentModule.getBoundingClientRect();

                // Posicionar en la esquina superior izquierda del contentModule
                widgetContainer.style.top = (contentModuleRect.top + window.scrollY + 10) + 'px';
                widgetContainer.style.left = (contentModuleRect.left + 10) + 'px';
                widgetContainer.style.right = 'auto';
                widgetContainer.style.bottom = 'auto';
            } else {
                // Fallback si no existe .contentModule
                widgetContainer.style.top = '20px';
                widgetContainer.style.left = '20px';
                widgetContainer.style.right = 'auto';
                widgetContainer.style.bottom = 'auto';
            }
            widgetPosition = 'left';

            // Configurar animación para móvil
            setupMobileAnimation();
        } else {
            // Estilos para desktop - parte inferior derecha (cambiado de izquierda a derecha)
            widgetContainer.style.bottom = '20px';
            widgetContainer.style.right = '20px'; // Cambiado de left a right
            widgetContainer.style.left = 'auto';
            widgetContainer.style.top = 'auto';
            widgetPosition = 'right';

            // Remover eventos de scroll si existen
            window.removeEventListener('scroll', handleScroll);
            // Asegurarse de que el widget sea visible en desktop
            widgetContainer.style.opacity = '1';
        }
    }

    // Función para configurar la animación en móvil
    function setupMobileAnimation() {
        // Mostrar widget inicialmente
        widgetContainer.style.opacity = '1';
        widgetContainer.style.transition = 'opacity 0.3s ease';

        // Configurar evento de scroll
        window.addEventListener('scroll', handleScroll);
    }

    // Manejar el scroll para la animación en móvil
    function handleScroll() {
        // Cancelar el timeout anterior si existe
        clearTimeout(scrollTimeout);

        // Mostrar el widget
        widgetContainer.style.opacity = '1';

        // Configurar timeout para ocultar después de 3 segundos sin scroll
        scrollTimeout = setTimeout(function () {
            // Solo ocultar si el menú no está abierto
            if (widgetMenu.style.display === 'none') {
                widgetContainer.style.opacity = '0.5';
            }
        }, 3000);

        // Actualizar posición del widget si es necesario
        if (mobileMediaQuery.matches) {
            handleMobileChange(mobileMediaQuery);
            positionMenu();
        }
    }

    // Ejecutar al inicio y cuando cambie el tamaño
    mobileMediaQuery.addListener(handleMobileChange);
    handleMobileChange(mobileMediaQuery);

    // Observar cambios en el DOM para reposicionar en móvil si .contentModule cambia
    const observer = new MutationObserver(function () {
        if (mobileMediaQuery.matches) {
            handleMobileChange(mobileMediaQuery);
            positionMenu();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Crear el botón del widget
    var widgetButton = document.createElement('button');
    widgetButton.innerHTML = '<i class="fas fa-universal-access"></i>';
    widgetButton.style.backgroundColor = '#007BFF';
    widgetButton.style.color = '#FFFFFF';
    widgetButton.style.border = 'none';
    widgetButton.style.padding = '4px';
    widgetButton.style.borderRadius = '50%';
    widgetButton.style.cursor = 'pointer';
    widgetButton.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
    widgetButton.style.display = 'flex';
    widgetButton.style.alignItems = 'center';
    widgetButton.style.justifyContent = 'center';
    // widgetButton.style.width = '25px';
    // widgetButton.style.height = '25px';
    widgetButton.style.transition = 'all 0.3s ease';

    // Función para ajustar el tamaño del botón según el dispositivo
    function adjustButtonSize() {
        if (mobileMediaQuery.matches) {
            // Tamaño para móvil
            widgetButton.style.width = '25px';
            widgetButton.style.height = '25px';

            // Tamaño del ícono para móvil
            var icon = widgetButton.querySelector('i');
            icon.style.fontSize = '22px';
        } else {
            // Tamaño para web
            widgetButton.style.width = '50px';
            widgetButton.style.height = '50px';

            // Tamaño del ícono para web
            var icon = widgetButton.querySelector('i');
            icon.style.fontSize = '32px';
        }
    }

    // Ajustar el tamaño inicial
    adjustButtonSize();

    // Ajustar el tamaño cuando cambie la vista
    mobileMediaQuery.addListener(function (e) {
        handleMobileChange(e);
        adjustButtonSize();
    });

    // Crear el menú de opciones
    var widgetMenu = document.createElement('div');
    widgetMenu.id = 'widget-menu';
    widgetMenu.style.display = 'none';
    widgetMenu.style.backgroundColor = '#FFFFFF';
    widgetMenu.style.border = '1px solid #DDD';
    widgetMenu.style.borderRadius = '5px';
    widgetMenu.style.padding = '4px';
    widgetMenu.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
    widgetMenu.style.maxHeight = '80vh';
    widgetMenu.style.overflowY = 'auto';
    widgetMenu.style.position = 'absolute';
    widgetMenu.style.zIndex = '2147483647'; // Máximo valor posible de z-index

    // Función para posicionar el menú correctamente
    function positionMenu() {
        if (widgetMenu.style.display === 'none') return;

        const widgetRect = widgetContainer.getBoundingClientRect();
        const menuWidth = 400;
        const menuHeight = widgetMenu.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (mobileMediaQuery.matches) {
            // Posicionamiento para móvil
            if (widgetPosition === 'left') {
                widgetMenu.style.left = '0';
                widgetMenu.style.right = 'auto';
            } else {
                widgetMenu.style.right = '0';
                widgetMenu.style.left = 'auto';
            }
            widgetMenu.style.top = '100%';
            widgetMenu.style.bottom = 'auto';
            widgetMenu.style.width = '90vw';
        } else {
            // Posicionamiento para desktop
            // Calcular espacio disponible
            const spaceRight = windowWidth - widgetRect.right;
            const spaceLeft = widgetRect.left;
            const spaceAbove = widgetRect.top;
            const spaceBelow = windowHeight - widgetRect.bottom;

            // Determinar posición horizontal
            if (spaceRight >= menuWidth || spaceRight >= spaceLeft) {
                // Hay espacio a la derecha o es mayor que a la izquierda
                widgetMenu.style.left = '100%';
                widgetMenu.style.right = 'auto';
            } else {
                // No hay espacio a la derecha, colocar a la izquierda
                widgetMenu.style.left = 'auto';
                widgetMenu.style.right = '100%';
            }

            // Determinar posición vertical
            if (spaceBelow >= menuHeight || spaceBelow >= spaceAbove) {
                // Hay espacio abajo o es mayor que arriba
                widgetMenu.style.top = '0';
                widgetMenu.style.bottom = 'auto';
            } else {
                // No hay espacio abajo, colocar arriba
                widgetMenu.style.top = 'auto';
                widgetMenu.style.bottom = '0';
            }

            // Ajustar si se sale de la pantalla
            const menuRect = widgetMenu.getBoundingClientRect();

            if (menuRect.right > windowWidth) {
                widgetMenu.style.left = 'auto';
                widgetMenu.style.right = '100%';
            }

            if (menuRect.bottom > windowHeight) {
                widgetMenu.style.top = 'auto';
                widgetMenu.style.bottom = '0';
            }

            widgetMenu.style.width = '400px';
        }
    }

    // Función para mover el widget y reposicionar el menú
    function moveWidget(newPosition) {
        widgetPosition = newPosition;

        if (mobileMediaQuery.matches) {
            if (newPosition === 'left') {
                widgetContainer.style.left = '20px';
                widgetContainer.style.right = 'auto';
            } else {
                widgetContainer.style.right = '20px';
                widgetContainer.style.left = 'auto';
            }
        } else {
            if (newPosition === 'left') {
                widgetContainer.style.left = '20px';
                widgetContainer.style.right = 'auto';
            } else {
                widgetContainer.style.right = '20px';
                widgetContainer.style.left = 'auto';
            }
        }

        positionMenu();
    }

    // Crear el encabezado del menú
    var menuHeader = document.createElement('div');
    menuHeader.style.backgroundColor = '#007BFF';
    menuHeader.style.color = '#FFFFFF';
    menuHeader.style.padding = '10px';
    menuHeader.style.borderRadius = '5px 5px 0 0';
    menuHeader.style.display = 'flex';
    menuHeader.style.alignItems = 'center';
    menuHeader.style.justifyContent = 'center';

    // Añadir ícono al encabezado
    var headerIcon = document.createElement('i');
    headerIcon.className = 'fas fa-universal-access';
    headerIcon.style.marginRight = '10px';

    // Añadir título al encabezado
    var headerTitle = document.createElement('span');
    headerTitle.innerText = 'Accesibilidad de Sofactia';
    headerTitle.style.fontSize = '16px';
    headerTitle.style.fontWeight = 'bold';

    // Añadir ícono y título al encabezado
    menuHeader.appendChild(headerIcon);
    menuHeader.appendChild(headerTitle);

    // Añadir el encabezado al menú
    widgetMenu.appendChild(menuHeader);

    // Contenedor para botones de control
    var controlButtonsContainer = document.createElement('div');
    controlButtonsContainer.className = 'control-buttons';
    controlButtonsContainer.style.display = 'flex';
    controlButtonsContainer.style.justifyContent = 'space-between';
    controlButtonsContainer.style.marginTop = '10px';
    controlButtonsContainer.style.marginBottom = '10px';
    controlButtonsContainer.style.padding = '0 10px';

    // Botón para reiniciar
    var resetButton = document.createElement('button');
    resetButton.innerHTML = '<i class="fas fa-undo"></i> Restablecer todas las configuraciones <br> de accesibilidad';
    resetButton.id = 'reset-button';
    resetButton.title = 'Reiniciar Todo';
    resetButton.style.backgroundColor = '#007BFF';
    resetButton.style.color = '#FFFFFF';
    resetButton.style.border = 'none';
    resetButton.style.padding = '10px 15px';
    resetButton.style.borderRadius = '5px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.fontSize = '14px';
    resetButton.style.display = 'flex';
    resetButton.style.alignItems = 'center';
    resetButton.style.justifyContent = 'center';
    resetButton.style.margin = '10px auto';
    resetButton.style.width = '91%';
    resetButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    resetButton.style.transition = 'all 0.3s ease';

    resetButton.addEventListener('mouseout', function () {
        this.style.backgroundColor = '#007BFF';
        this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    });

    // Añade espacio entre el icono y el texto
    var resetIcon = resetButton.querySelector('i');
    resetIcon.style.marginRight = '8px';

    // Contenedor para botones de mover
    var moveButtonsContainer = document.createElement('div');
    moveButtonsContainer.style.display = 'flex';
    moveButtonsContainer.style.gap = '5px';

    // Botones de mover (izquierda/derecha)
    var moveLeftButton = document.createElement('button');
    moveLeftButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
    moveLeftButton.title = 'Mover a la izquierda';
    moveLeftButton.style.backgroundColor = 'transparent';
    moveLeftButton.style.color = '#007BFF';
    moveLeftButton.style.border = 'none';
    moveLeftButton.style.padding = '8px';
    moveLeftButton.style.borderRadius = '5px';
    moveLeftButton.style.cursor = 'pointer';
    moveLeftButton.style.fontSize = '16px';

    var moveRightButton = document.createElement('button');
    moveRightButton.innerHTML = '<i class="fas fa-arrow-right"></i>';
    moveRightButton.title = 'Mover a la derecha';
    moveRightButton.style.backgroundColor = 'transparent';
    moveRightButton.style.color = '#007BFF';
    moveRightButton.style.border = 'none';
    moveRightButton.style.padding = '8px';
    moveRightButton.style.borderRadius = '5px';
    moveRightButton.style.cursor = 'pointer';
    moveRightButton.style.fontSize = '16px';

    // Eventos para botones de mover
    moveLeftButton.addEventListener('click', function () {
        moveWidget('left');
    });

    moveRightButton.addEventListener('click', function () {
        moveWidget('right');
    });

    // Evento para reiniciar
    resetButton.addEventListener('click', function () {
        resetAll();
        resetButton.style.transform = 'scale(0.9)';
        setTimeout(function () {
            resetButton.style.transform = 'scale(1)';
        }, 200);
    });

    // Añadir botones al contenedor
    moveButtonsContainer.appendChild(moveLeftButton);
    moveButtonsContainer.appendChild(moveRightButton);
    controlButtonsContainer.appendChild(resetButton);
    controlButtonsContainer.appendChild(moveButtonsContainer);
    widgetMenu.appendChild(controlButtonsContainer);

    // Opciones del menú (eliminada la opción "Detener Animaciones")
    var options = [
        {
            category: 'Ajustes Visuales',
            icon: 'fas fa-eye',
            options: [
                { text: 'Aumentar Texto', action: increaseTextSize, isToggle: false, icon: 'fas fa-text-height' },
                { text: 'Disminuir Texto', action: decreaseTextSize, isToggle: false, icon: 'fas fa-text-width' },
                { text: 'Aumentar Espaciado', action: increaseLineHeight, isToggle: false, icon: 'fas fa-arrows-alt-v' },
                { text: 'Saturación', action: toggleSaturation, isToggle: true, icon: 'fas fa-tint' },
                { text: 'Contraste Alto', action: toggleHighContrast, isToggle: true, icon: 'fas fa-sun' },
                { text: 'Contraste Bajo', action: toggleLowContrast, isToggle: true, icon: 'fas fa-moon' },
                { text: 'Negativo', action: toggleNegative, isToggle: true, icon: 'fas fa-adjust' },
                { text: 'Tonos de Gris', action: toggleGrayscale, isToggle: true, icon: 'fas fa-palette' },
                { text: 'Fuente Legible', action: toggleLegibleFont, isToggle: true, icon: 'fas fa-font' }
            ]
        },
        {
            category: 'Navegación y Lectura',
            icon: 'fas fa-book-reader',
            options: [
                { text: 'Lectura en Voz Alta', action: toggleTextToSpeech, isToggle: true, icon: 'fas fa-volume-up' },
                { text: 'Resaltar Enlaces', action: toggleHighlightLinks, isToggle: true, icon: 'fas fa-link' },
                { text: 'Resaltar Encabezados', action: toggleHighlightHeadings, isToggle: true, icon: 'fas fa-heading' },
                { text: 'Cursor Grande', action: toggleBigCursor, isToggle: true, icon: 'fas fa-mouse-pointer' },
                { text: 'Navegación con Teclado', action: toggleKeyboardNavigation, isToggle: true, icon: 'fas fa-keyboard' },
                { text: 'Navegación por Voz', action: toggleVoiceNavigation, isToggle: true, icon: 'fas fa-microphone' }
            ]
        },
        {
            category: 'Accesibilidad para Dislexia',
            icon: 'fas fa-book',
            options: [
                { text: 'Estilo 1: Fuente OpenDyslexic', action: setDyslexiaStyle1, isToggle: true, icon: 'fas fa-font' },
                { text: 'Estilo 2: Fuente Dyslexie', action: setDyslexiaStyle2, isToggle: true, icon: 'fas fa-font' },
                { text: 'Estilo 3: Fuente Lexie Readable', action: setDyslexiaStyle3, isToggle: true, icon: 'fas fa-font' },
                { text: 'Estilo 4: Fuente Read Regular', action: setDyslexiaStyle4, isToggle: true, icon: 'fas fa-font' }
            ]
        },
        {
            category: 'Otras Herramientas',
            icon: 'fas fa-tools',
            options: [
                { text: 'Ocultar Imágenes', action: toggleHideImages, isToggle: true, icon: 'fas fa-eye-slash' },
                { text: 'Detener Sonidos', action: toggleStopSounds, isToggle: true, icon: 'fas fa-volume-mute' },
                { text: 'Modo Enfoque', action: toggleFocusMode, isToggle: true, icon: 'fas fa-bullseye' }
            ]
        }
    ];

    // Variable para categoría abierta
    var openCategory = null;

    // Añadir las opciones al menú
    options.forEach(function (category, index) {
        var categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.style.cursor = 'pointer';
        categoryHeader.style.padding = '10px';
        categoryHeader.style.backgroundColor = '#F5F5F5';
        categoryHeader.style.borderBottom = '1px solid #DDD';
        categoryHeader.style.display = 'flex';
        categoryHeader.style.alignItems = 'center';
        categoryHeader.style.borderRadius = '5px';
        categoryHeader.style.marginBottom = '5px';

        // Añadir ícono
        var icon = document.createElement('i');
        icon.className = category.icon;
        icon.style.marginRight = '10px';
        icon.style.color = '#007BFF';
        categoryHeader.appendChild(icon);

        // Añadir título
        var title = document.createElement('span');
        title.innerText = category.category;
        title.style.color = '#333';
        title.style.fontWeight = 'bold';
        categoryHeader.appendChild(title);

        // Añadir flecha
        var arrow = document.createElement('i');
        arrow.className = 'fas fa-chevron-down';
        arrow.style.marginLeft = 'auto';
        arrow.style.color = '#007BFF';
        categoryHeader.appendChild(arrow);

        // Crear contenedor de opciones
        var categoryOptions = document.createElement('div');
        categoryOptions.className = 'category-options';
        categoryOptions.style.display = 'none';
        categoryOptions.style.padding = '10px';

        // Añadir las opciones de la categoría
        category.options.forEach(function (option) {
            var optionContainer = document.createElement('div');
            optionContainer.className = 'option-container';

            // Crear el contenedor de texto e icono
            var textContainer = document.createElement('div');
            textContainer.className = 'text-container';

            // Crear ícono
            var optionIcon = document.createElement('i');
            optionIcon.className = option.icon;
            optionIcon.style.marginRight = '10px';
            optionIcon.style.color = '#007BFF';
            textContainer.appendChild(optionIcon);

            // Añadir texto
            var text = document.createElement('span');
            text.innerText = option.text;
            text.style.color = '#333';
            textContainer.appendChild(text);

            optionContainer.appendChild(textContainer);

            // Si es una opción de toggle, crear un switch
            if (option.isToggle) {
                var switchContainer = document.createElement('label');
                switchContainer.className = 'switch';

                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';

                var slider = document.createElement('span');
                slider.className = 'slider round';

                switchContainer.appendChild(checkbox);
                switchContainer.appendChild(slider);

                optionContainer.appendChild(switchContainer);

                // Añadir evento al checkbox
                checkbox.addEventListener('change', function () {
                    option.action();

                    // Para opciones mutuamente excluyentes
                    if (option.text.includes('Contraste')) {
                        var allContrastCheckboxes = document.querySelectorAll('.category-options input[type="checkbox"]');
                        allContrastCheckboxes.forEach(function (cb) {
                            if (cb !== checkbox && cb.parentElement.parentElement.querySelector('span').textContent.includes('Contraste')) {
                                cb.checked = false;
                            }
                        });
                    } else if (option.text.includes('Estilo')) {
                        var allDyslexiaCheckboxes = document.querySelectorAll('.category-options input[type="checkbox"]');
                        allDyslexiaCheckboxes.forEach(function (cb) {
                            if (cb !== checkbox && cb.parentElement.parentElement.querySelector('span').textContent.includes('Estilo')) {
                                cb.checked = false;
                            }
                        });
                    }
                });
            } else {
                // Para opciones que no son toggle, crear un botón
                var button = document.createElement('button');
                button.className = 'action-button';
                // Cambiar el icono según el texto
                if (option.text === 'Disminuir Texto') {
                    button.innerHTML = '<i class="fas fa-minus"></i>';
                } else {
                    button.innerHTML = '<i class="fas fa-plus"></i>';
                }
                button.title = option.text;

                optionContainer.appendChild(button);

                // Añadir evento al botón
                button.addEventListener('click', function () {
                    option.action();

                    // Efecto de clic
                    this.style.transform = 'scale(0.95)';
                    setTimeout(function () {
                        button.style.transform = 'scale(1)';
                    }, 200);
                });

                // Guardar referencia a botones de texto
                if (option.text === 'Aumentar Texto') {
                    increaseButton = button;
                } else if (option.text === 'Disminuir Texto') {
                    decreaseButton = button;
                }
            }

            categoryOptions.appendChild(optionContainer);
        });

        // Evento para desplegar/contraer categoría
        categoryHeader.addEventListener('click', function () {
            // Cerrar la categoría abierta actual si es diferente a la que se está haciendo clic
            if (openCategory && openCategory !== categoryOptions) {
                openCategory.style.display = 'none';
                openCategory.previousElementSibling.querySelector('.fa-chevron-down, .fa-chevron-up').className = 'fas fa-chevron-down';
            }

            // Alternar la categoría actual
            if (categoryOptions.style.display === 'none') {
                categoryOptions.style.display = 'block';
                arrow.className = 'fas fa-chevron-up';
                openCategory = categoryOptions;
            } else {
                categoryOptions.style.display = 'none';
                arrow.className = 'fas fa-chevron-down';
                openCategory = null;
            }
        });

        widgetMenu.appendChild(categoryHeader);
        widgetMenu.appendChild(categoryOptions);

        // Desplegar primera categoría por defecto
        if (index === 0) {
            categoryOptions.style.display = 'block';
            arrow.className = 'fas fa-chevron-up';
            openCategory = categoryOptions;
        } else {
            categoryOptions.style.display = 'none';
            arrow.className = 'fas fa-chevron-down';
        }
    });

    // Añadir widget al DOM
    widgetContainer.appendChild(widgetButton);
    widgetContainer.appendChild(widgetMenu);
    document.body.appendChild(widgetContainer);

    // Mostrar/ocultar menú
    widgetButton.addEventListener('click', function () {
        widgetMenu.style.display = widgetMenu.style.display === 'none' ? 'block' : 'none';
        positionMenu(); // Reposicionar el menú cada vez que se muestra

        // En móvil, si se abre el menú, mostrar el widget completamente
        if (mobileMediaQuery.matches && widgetMenu.style.display === 'block') {
            widgetContainer.style.opacity = '1';
            // Reiniciar el timeout para ocultar
            clearTimeout(scrollTimeout);
        }
    });

    // Funciones de accesibilidad
    function storeOriginalFontSizes() {
        var elements = document.querySelectorAll('body *:not(#accessibility-widget, #accessibility-widget *)');
        elements.forEach(function (element) {
            if (!originalFontSizes.has(element)) {
                originalFontSizes.set(element, parseFloat(window.getComputedStyle(element).fontSize));
            }
        });
    }

    function increaseTextSize() {
        storeOriginalFontSizes();
        currentFontSizeMultiplier += 0.1;
        fontSizeSteps++;

        var elements = document.querySelectorAll('body *:not(#accessibility-widget, #accessibility-widget *)');
        elements.forEach(function (element) {
            var originalSize = originalFontSizes.get(element);
            if (originalSize) {
                element.style.fontSize = (originalSize * currentFontSizeMultiplier) + 'px';
            }
        });
    }

    function decreaseTextSize() {
        storeOriginalFontSizes();
        currentFontSizeMultiplier = Math.max(0.5, currentFontSizeMultiplier - 0.1);
        fontSizeSteps--;

        var elements = document.querySelectorAll('body *:not(#accessibility-widget, #accessibility-widget *)');
        elements.forEach(function (element) {
            var originalSize = originalFontSizes.get(element);
            if (originalSize) {
                element.style.fontSize = (originalSize * currentFontSizeMultiplier) + 'px';
            }
        });
    }

    function increaseLineHeight() {
        var elements = document.querySelectorAll('body *:not(#accessibility-widget, #accessibility-widget *)');
        elements.forEach(function (element) {
            var currentLineHeight = parseFloat(window.getComputedStyle(element).lineHeight);
            element.style.lineHeight = (currentLineHeight + 2) + 'px';
        });
    }

    function toggleSaturation() {
        isSaturationOn = !isSaturationOn;

        const selector = 'body *:not(#accessibility-widget, #accessibility-widget *, .btn-navigation-container, .btn-navigation-container *, .headerOpc, .headerOpc *)';
        var elements = document.querySelectorAll(selector);

        elements.forEach(function (element) {
            if (isSaturationOn) {
                if (!element.closest('.btn-navigation-container') && !element.closest('.headerOpc')) {
                    element.style.filter = 'saturate(0.5)';
                }
            } else {
                element.style.filter = '';
            }
        });

        updateSwitchState('Saturación', isSaturationOn);
    }

    function toggleHighContrast() {
        isHighContrastOn = !isHighContrastOn;
        var elements = document.querySelectorAll('body *:not(#accessibility-widget, #accessibility-widget *)');
        elements.forEach(function (element) {
            if (isHighContrastOn) {
                element.classList.add('high-contrast');
                element.classList.remove('low-contrast');
            } else {
                element.classList.remove('high-contrast');
            }
        });

        updateSwitchState('Contraste Alto', isHighContrastOn);
        if (isHighContrastOn) {
            updateSwitchState('Contraste Bajo', false);
            isLowContrastOn = false;
        }
    }

    function toggleLowContrast() {
        isLowContrastOn = !isLowContrastOn;
        var elements = document.querySelectorAll('body *:not(#accessibility-widget, #accessibility-widget *)');
        elements.forEach(function (element) {
            if (isLowContrastOn) {
                element.classList.add('low-contrast');
                element.classList.remove('high-contrast');
            } else {
                element.classList.remove('low-contrast');
            }
        });

        updateSwitchState('Contraste Bajo', isLowContrastOn);
        if (isLowContrastOn) {
            updateSwitchState('Contraste Alto', false);
            isHighContrastOn = false;
        }
    }

    function toggleNegative() {
        isNegativeOn = !isNegativeOn;

        const selector = 'body *:not(#accessibility-widget, #accessibility-widget *, .btn-navigation-container, .btn-navigation-container *, .headerOpc, .headerOpc *)';
        var elements = document.querySelectorAll(selector);

        elements.forEach(function (element) {
            if (isNegativeOn) {
                if (!element.closest('.btn-navigation-container') && !element.closest('.headerOpc')) {
                    element.style.filter = 'invert(100%)';
                }
            } else {
                element.style.filter = '';
            }
        });

        updateSwitchState('Negativo', isNegativeOn);
    }

    function toggleGrayscale() {
        isGrayscaleOn = !isGrayscaleOn;

        const selector = 'body *:not(#accessibility-widget, #accessibility-widget *, .btn-navigation-container, .btn-navigation-container *, .headerOpc, .headerOpc  #accessibility-widget *, .btn-navigation-container, .btn-navigation-container *, .headerOpc, .headerOpc *)';
        var elements = document.querySelectorAll(selector);

        elements.forEach(function (element) {
            if (isGrayscaleOn) {
                if (!element.closest('.btn-navigation-container') && !element.closest('.headerOpc')) {
                    element.style.filter = 'grayscale(100%)';
                }
            } else {
                element.style.filter = '';
            }
        });

        updateSwitchState('Tonos de Gris', isGrayscaleOn);
    }

    function toggleLegibleFont() {
        isLegibleFontOn = !isLegibleFontOn;
        var elements = document.querySelectorAll('body *:not(#accessibility-widget, #accessibility-widget *)');
        elements.forEach(function (element) {
            if (element.tagName.toLowerCase() !== 'i') {
                if (isLegibleFontOn) {
                    element.classList.add('legible-font');
                    var currentSize = parseFloat(window.getComputedStyle(element).fontSize);
                    element.style.fontSize = (currentSize * 1.1) + 'px';
                } else {
                    element.classList.remove('legible-font');
                    element.style.fontSize = '';
                }
            }
        });

        updateSwitchState('Fuente Legible', isLegibleFontOn);
    }

    function toggleTextToSpeech() {
        isTextToSpeechOn = !isTextToSpeechOn;
        if (isTextToSpeechOn) {
            let allText = document.body.innerText;

            const widget = document.getElementById('accessibility-widget');
            if (widget) {
                allText = allText.replace(widget.innerText, '');
            }

            const contentHeaders = document.querySelectorAll('.contentHeader');
            contentHeaders.forEach(header => {
                if (header && header.innerText) {
                    const headerText = header.innerText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(headerText, 'g');
                    allText = allText.replace(regex, '');
                }
            });

            var speech = new SpeechSynthesisUtterance(allText);
            speech.lang = 'es-MX';

            speech.addEventListener('end', function () {
                isTextToSpeechOn = false;
                updateSwitchState('Lectura en Voz Alta', false);
            });

            window.speechSynthesis.speak(speech);
        } else {
            window.speechSynthesis.cancel();
        }

        updateSwitchState('Lectura en Voz Alta', isTextToSpeechOn);
    }

    function toggleHighlightLinks() {
        areLinksHighlighted = !areLinksHighlighted;
        var links = document.querySelectorAll('a');
        links.forEach(function (link) {
            if (areLinksHighlighted) {
                link.classList.add('highlighted-link');
            } else {
                link.classList.remove('highlighted-link');
            }
        });

        updateSwitchState('Resaltar Enlaces', areLinksHighlighted);
    }

    function toggleHighlightHeadings() {
        areHeadingsHighlighted = !areHeadingsHighlighted;
        var headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(function (heading) {
            // Solo resaltar si no está dentro del widget de accesibilidad
            if (!heading.closest('#accessibility-widget')) {
                if (areHeadingsHighlighted) {
                    heading.classList.add('highlighted-heading');
                } else {
                    heading.classList.remove('highlighted-heading');
                }
            }
        });

        updateSwitchState('Resaltar Encabezados', areHeadingsHighlighted);
    }

    function toggleBigCursor() {
        isBigCursorOn = !isBigCursorOn;
        if (isBigCursorOn) {
            var cursorImg = document.createElement('img');
            cursorImg.src = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyOS4xODhweCIgaGVpZ2h0PSI0My42MjVweCIgdmlld0JveD0iMCAwIDI5LjE4OCA0My42MjUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI5LjE4OCA0My42MjUiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnPjxwb2x5Z29uIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iI0Q5REFEOSIgc3Ryb2tlLXdpZHRoPSIxLjE0MDYiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgcG9pbnRzPSIyLjgsNC41NDkgMjYuODQ3LDE5LjkwMiAxNi45NjQsMjIuNzAxIDI0LjIzOSwzNy43NDkgMTguMjc4LDQyLjAxNyA5Ljc0MSwzMC43MjQgMS4xMzgsMzUuODA5ICIvPjxnPjxnPjxnPjxwYXRoIGZpbGw9IiMyMTI2MjciIGQ9Ik0yOS4xNzUsMjEuMTU1YzAuMDcxLTAuNjEzLTAuMTY1LTEuMjUzLTAuNjM1LTEuNTczTDIuMTY1LDAuMjU4Yy0wLjQyNC0wLjMyLTAuOTg4LTAuMzQ2LTEuNDM1LTAuMDUzQzAuMjgyLDAuNDk3LDAsMS4wMywwLDEuNjE3djM0LjE3MWMwLDAuNjEzLDAuMzA2LDEuMTQ2LDAuNzc2LDEuNDM5YzAuNDcxLDAuMjY3LDEuMDU5LDAuMjEzLDEuNDgyLTAuMTZsNy40ODItNi4zNDRsNi44NDcsMTIuMTU1YzAuMjU5LDAuNDgsMC43MjksMC43NDYsMS4yLDAuNzQ2YzAuMjM1LDAsMC40OTQtMC4wOCwwLjcwNi0wLjIxM2w2Ljk4OC00LjU4NWMwLjMyOS0wLjIxMywwLjU2NS0wLjU4NiwwLjY1OS0xLjAxM2MwLjA5NC0wLjQyNiwwLjAyNC0wLjg4LTAuMTg4LTEuMjI2bC02LjM3Ni0xMS4zODJsOC42MTEtMi43NDVDMjguNzA1LDIyLjI3NCwyOS4xMDUsMjEuNzY4LDI5LjE3NSwyMS4xNTV6IE0xNi45NjQsMjIuNzAxYy0wLjQyNCwwLjEzMy0wLjc3NiwwLjUwNi0wLjk0MSwwLjk2Yy0wLjE2NSwwLjQ4LTAuMTE4LDEuMDEzLDAuMTE4LDEuNDM5bDYuNTg4LDExLjc4MWwtNC41NDEsMi45ODVsLTYuODk0LTEyLjMxNWMtMC4yMTItMC4zNzMtMC41NDEtMC42NC0wLjk0MS0wLjcyYy0wLjA5NC0wLjAyNy0wLjE2NS0wLjAyNy0wLjI1OS0wLjAyN2MtMC4zMDYsMC0wLjU4OCwwLjEwNy0wLjg0NywwLjMyTDIuOCwzMi41OVY0LjU0OUwyNC40LDIwLjM1NUwxNi45NjQsMjIuNzAxeiIvPjwvZz48L2c+PC9nPjwvZz48L3N2Zz4=';
            cursorImg.style.width = '50px';
            cursorImg.style.height = '50px';
            cursorImg.style.position = 'fixed';
            cursorImg.style.pointerEvents = 'none';
            cursorImg.style.zIndex = '2147483647';
            cursorImg.id = 'custom-cursor';
            document.body.appendChild(cursorImg);

            document.addEventListener('mousemove', function (e) {
                var cursor = document.getElementById('custom-cursor');
                if (cursor) {
                    cursor.style.left = (e.clientX - 20) + 'px';
                    cursor.style.top = (e.clientY - 20) + 'px';
                }
            });

            document.body.style.cursor = 'none';
        } else {
            var cursor = document.getElementById('custom-cursor');
            if (cursor) {
                cursor.remove();
            }
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', function () { });
        }

        updateSwitchState('Cursor Grande', isBigCursorOn);
    }

    function toggleKeyboardNavigation() {
        isKeyboardNavOn = !isKeyboardNavOn;
        if (isKeyboardNavOn) {
            document.addEventListener('keydown', handleKeyboardNavigation);
        } else {
            document.removeEventListener('keydown', handleKeyboardNavigation);
        }

        updateSwitchState('Navegación con Teclado', isKeyboardNavOn);
    }

    function handleKeyboardNavigation(e) {
        if (e.key === 'ArrowDown') window.scrollBy(0, 50);
        else if (e.key === 'ArrowUp') window.scrollBy(0, -50);
        else if (e.key === 'ArrowRight') window.scrollBy(50, 0);
        else if (e.key === 'ArrowLeft') window.scrollBy(-50, 0);
    }

    function toggleVoiceNavigation() {
        isVoiceNavOn = !isVoiceNavOn;
        if (isVoiceNavOn) {
            alert('Navegación por voz activada. Di "scroll down" o "scroll up" para navegar.');
        } else {
            alert('Navegación por voz desactivada');
        }

        updateSwitchState('Navegación por Voz', isVoiceNavOn);
    }

    function setDyslexiaStyle1() {
        var elements = document.querySelectorAll('body *:not(#accessibility-widget, #accessibility-widget *)');
        elements.forEach(function (element) {
            if (element.tagName.toLowerCase() !== 'i') {
                element.style.fontFamily = 'OpenDyslexic, sans-serif';
            }
        });

        updateSwitchState('Estilo 1: Fuente OpenDyslexic', true);
        updateSwitchState('Estilo 2: Fuente Comic Sans', false);
        updateSwitchState('Estilo 3: Fuente Verdana', false);
        updateSwitchState('Estilo 4: Fuente Arial', false);
    }

    function setDyslexiaStyle2() {
        var elements = document.querySelectorAll('body *:not(#accessibility-widget, #accessibility-widget *)');
        elements.forEach(function (element) {
            if (element.tagName.toLowerCase() !== 'i') {
                element.style.fontFamily = 'Comic Sans MS, cursive';
            }
        });

        updateSwitchState('Estilo 1: Fuente OpenDyslexic', false);
        updateSwitchState('Estilo 2: Fuente Comic Sans', true);
        updateSwitchState('Estilo 3: Fuente Verdana', false);
        updateSwitchState('Estilo 4: Fuente Arial', false);
    }

    function setDyslexiaStyle3() {
        var elements = document.querySelectorAll('body *:not(#accessibility-widget, #accessibility-widget *)');
        elements.forEach(function (element) {
            if (element.tagName.toLowerCase() !== 'i') {
                element.style.fontFamily = 'Verdana, sans-serif';
            }
        });

        updateSwitchState('Estilo 1: Fuente OpenDyslexic', false);
        updateSwitchState('Estilo 2: Fuente Comic Sans', false);
        updateSwitchState('Estilo 3: Fuente Verdana', true);
        updateSwitchState('Estilo 4: Fuente Arial', false);
    }

    function setDyslexiaStyle4() {
        var elements = document.querySelectorAll('body *:not(#accessibility-widget, #accessibility-widget *)');
        elements.forEach(function (element) {
            if (element.tagName.toLowerCase() !== 'i') {
                element.style.fontFamily = 'Roboto, sans-serif';
            }
        });

        updateSwitchState('Estilo 1: Fuente OpenDyslexic', false);
        updateSwitchState('Estilo 2: Fuente Comic Sans', false);
        updateSwitchState('Estilo 3: Fuente Verdana', false);
        updateSwitchState('Estilo 4: Fuente Arial', true);
    }

    function toggleHideImages() {
        areImagesHidden = !areImagesHidden;
        var images = document.querySelectorAll('img');
        images.forEach(function (image) {
            if (areImagesHidden) {
                image.style.display = 'none';
            } else {
                image.style.display = '';
            }
        });

        updateSwitchState('Ocultar Imágenes', areImagesHidden);
    }

    function toggleStopSounds() {
        areSoundsStopped = !areSoundsStopped;
        var videos = document.querySelectorAll('video, audio');
        videos.forEach(function (video) {
            if (areSoundsStopped) {
                video.pause();
            }
        });

        updateSwitchState('Detener Sonidos', areSoundsStopped);
    }

    function toggleFocusMode() {
        isFocusModeOn = !isFocusModeOn;
        var elements = document.querySelectorAll('body *:not(#accessibility-widget, #accessibility-widget *)');
        elements.forEach(function (element) {
            if (isFocusModeOn) {
                element.classList.add('focus-mode');
            } else {
                element.classList.remove('focus-mode');
            }
        });

        updateSwitchState('Modo Enfoque', isFocusModeOn);
    }

    function updateSwitchState(optionText, isChecked) {
        var optionContainers = document.querySelectorAll('.option-container');
        optionContainers.forEach(function (container) {
            var text = container.querySelector('span').textContent;
            if (text === optionText) {
                var checkbox = container.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = isChecked;
                }
            }
        });
    }

    function resetAll() {
        // Primero resetear todas las variables de estado
        isSaturationOn = false;
        isHighContrastOn = false;
        isLowContrastOn = false;
        isNegativeOn = false;
        isGrayscaleOn = false;
        isLegibleFontOn = false;
        areImagesHidden = false;
        areSoundsStopped = false;
        isFocusModeOn = false;
        isTextToSpeechOn = false;
        areLinksHighlighted = false;
        areHeadingsHighlighted = false;
        isBigCursorOn = false;
        isKeyboardNavOn = false;
        isVoiceNavOn = false;
        currentFontSizeMultiplier = 1;
        fontSizeSteps = 0;
        originalFontSizes.clear();

        // Limpiar estilos de todos los elementos excepto el widget
        var elements = document.querySelectorAll('body *:not(#accessibility-widget, #accessibility-widget *, iframe, iframe *)');
        elements.forEach(function (element) {
            element.style.fontSize = '';
            element.style.lineHeight = '';
            element.style.backgroundColor = '';
            element.style.color = '';
            element.style.filter = '';
            element.style.fontFamily = '';
            element.style.animationPlayState = 'running';
            element.style.transition = '';

            element.classList.remove(
                'high-contrast', 'low-contrast', 'legible-font',
                'focus-mode', 'highlighted-link', 'highlighted-heading'
            );
        });

        // Restaurar imágenes
        var images = document.querySelectorAll('body img:not(#accessibility-widget img)');
        images.forEach(function (image) {
            image.style.display = '';
        });

        // Remover cursor personalizado
        if (document.getElementById('custom-cursor')) {
            document.getElementById('custom-cursor').remove();
        }
        document.body.style.cursor = '';

        // Cancelar síntesis de voz
        window.speechSynthesis.cancel();

        // Resetear todos los checkboxes del widget
        var checkboxes = document.querySelectorAll('#accessibility-widget .switch input[type="checkbox"]');
        checkboxes.forEach(function (checkbox) {
            checkbox.checked = false;
        });

        // Remover event listeners si están activos
        if (isKeyboardNavOn) {
            document.removeEventListener('keydown', handleKeyboardNavigation);
        }
    }

    function injectAccessibilityToIframes() {
        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                iframe.addEventListener('load', function () {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                    const link = iframeDoc.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = './assetsWidget/css/widget.css';
                    iframeDoc.head.appendChild(link);

                    const script = iframeDoc.createElement('script');
                    script.src = './assetsWidget/js/widget.js';
                    iframeDoc.body.appendChild(script);
                });
            } catch (e) {
                console.log('No se pudo acceder al iframe:', e);
            }
        });
    }

    injectAccessibilityToIframes();

    const domObserver = new MutationObserver(injectAccessibilityToIframes);
    domObserver.observe(document.body, { childList: true, subtree: true });


})();