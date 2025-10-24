export function init() {
  // Variables para el manejo del cuestionario
  let preguntaActual = 1;
  let respuestasUsuario = {};
  let resultados = {};
  let quizCompletado = false;
  let preguntaActualNav = 1;
  let navHandlersAdded = false;

  // Respuestas correctas para momento3_5 - Protocolos de SST
  const respuestasCorrectas = {
    1: true, // Pregunta 1: PREXOR fue creado en 2013 - VERDADERO
    2: false, // Pregunta 2: Protocolo de sílice fue para reducir TME - FALSO (fue para reducir silicosis)
    3: true, // Pregunta 3: Protocolo de riesgos psicosociales actualizado en 2022 por COVID - FALSO (fue actualizado en 2022, pero no específicamente por COVID)
    4: true, // Pregunta 4: Manejo defensivo implica técnicas para prevenir accidentes - VERDADERO
    5: false, // Pregunta 5: Revisión periódica no es necesaria - FALSO
    6: false // Pregunta 6: Conductor defensivo anticipa riesgos - VERDADERO
  };

  // Contar dinámicamente el total de preguntas
  const totalPreguntas = document.querySelectorAll('.preguntas_01[data-pregunta]').length;
  let preguntasValidadas = 0;

  // Actualiza el contador y la barra de progreso
  function actualizarProgresoPreguntas() {
    const progressText = document.getElementById('progress-text');
    if (progressText) {
      progressText.textContent = `${preguntasValidadas} de ${totalPreguntas} preguntas validadas`;
    }
    const barra = document.getElementById('progress-bar-fill');
    if (barra) {
      const porcentaje = (preguntasValidadas / totalPreguntas) * 100;
      barra.style.width = porcentaje + '%';
    }
  }

  // Llama a esta función cada vez que el usuario valida una pregunta
  function sumarPreguntaValidada() {
    preguntasValidadas++;
    actualizarProgresoPreguntas();
  }

  function validarPregunta(numeroPregunta) {
    const preguntaElement = document.querySelector(`[data-pregunta="${numeroPregunta}"]`);
    const opcionSeleccionada = preguntaElement.querySelector('.opcion-respuesta.seleccionada_alertas');

    const mensajeError = document.getElementById(`mensaje_error_${numeroPregunta}`);
    const resultadoAlertas = document.getElementById(`resultado_alertas_${numeroPregunta}`);
    const btnValidar = preguntaElement.querySelector('.btn-validar');
    const btnSiguienteContainer = preguntaElement.querySelector('.btn-siguiente-container');

    if (!opcionSeleccionada) {
      // No hay opción seleccionada
      mensajeError.classList.remove('d-none');
      mensajeError.innerHTML = '<div class="alert multi-select-feedback-warning"><i class="fas fa-info-circle me-2"></i>Debes seleccionar una opción antes de validar.</div>';
      resultadoAlertas.classList.add('d-none');
      return;
    }

    // Ocultar mensaje de error
    mensajeError.classList.add('d-none');

    // Obtener la respuesta del usuario
    const respuestaUsuario = opcionSeleccionada.getAttribute('data-valor') === 'true';
    respuestasUsuario[numeroPregunta] = respuestaUsuario;

    // Verificar si es correcta
    const esCorrecta = respuestasUsuario[numeroPregunta] === respuestasCorrectas[numeroPregunta];
    resultados[numeroPregunta] = esCorrecta;

    // Solo sumar si no se ha contado antes
    if (!preguntaElement.classList.contains('pregunta-validada')) {
      preguntaElement.classList.add('pregunta-validada');
      sumarPreguntaValidada();
    }

    // DESHABILITAR todas las opciones de esta pregunta
    preguntaElement.querySelectorAll('.opcion-respuesta').forEach((opcion) => {
      opcion.style.pointerEvents = 'none';
      opcion.classList.remove('act');
    });

    // Aplicar color según resultado a la opción seleccionada
    if (esCorrecta) {
      opcionSeleccionada.classList.add('true');
    } else {
      opcionSeleccionada.classList.add('false');
    }

    // Ocultar botón validar
    if (btnValidar) btnValidar.classList.add('d-none');

    // Si es la ÚLTIMA pregunta
    if (numeroPregunta === totalPreguntas) {
      // Mostrar resumen completo inmediatamente
      mostrarResumenFinal();
    } else {
      // Para preguntas NO finales: mostrar feedback individual + botón "Siguiente"
      if (esCorrecta) {
        resultadoAlertas.innerHTML = '<div class="alert multi-select-feedback-success"><i class="fas fa-check-circle me-2"></i>¡Correcto! Tu respuesta es acertada.</div>';
      } else {
        resultadoAlertas.innerHTML =
          '<div class="alert multi-select-feedback-error"><i class="fas fa-times-circle me-2"></i>Incorrecto. ¡Inténtalo de nuevo! La opción seleccionada no es la correcta.</div>';
      }
      resultadoAlertas.classList.remove('d-none');

      // Mostrar botón "Siguiente"
      if (btnSiguienteContainer) {
        btnSiguienteContainer.classList.remove('d-none');
        const btnSiguiente = btnSiguienteContainer.querySelector('button');
        if (btnSiguiente) {
          btnSiguiente.classList.remove('d-none');
        }
      }
    }
  }

  function mostrarPregunta(numeroPregunta) {
    // Ocultar todas las preguntas
    document.querySelectorAll('.preguntas_01').forEach((pregunta) => {
      pregunta.classList.add('d-none');
    });

    // Mostrar la pregunta actual
    const preguntaElement = document.querySelector(`[data-pregunta="${numeroPregunta}"]`);
    if (preguntaElement) {
      preguntaElement.classList.remove('d-none');

      // Solo limpiar si NO está completado el quiz
      if (!quizCompletado) {
        // Limpiar selecciones previas y habilitar opciones
        preguntaElement.querySelectorAll('.opcion-respuesta').forEach((opcion) => {
          opcion.classList.remove('seleccionada_alertas', 'act', 'true', 'false');
          opcion.style.pointerEvents = 'auto';
        });

        // Ocultar mensajes de feedback
        const mensajeError = document.getElementById(`mensaje_error_${numeroPregunta}`);
        const resultadoAlertas = document.getElementById(`resultado_alertas_${numeroPregunta}`);

        if (mensajeError) mensajeError.classList.add('d-none');
        if (resultadoAlertas) resultadoAlertas.classList.add('d-none');

        // Mostrar botón validar y ocultar botón siguiente
        const btnValidar = preguntaElement.querySelector('.btn-validar');
        const btnSiguienteContainer = preguntaElement.querySelector('.btn-siguiente-container');

        if (btnValidar) btnValidar.classList.remove('d-none');
        if (btnSiguienteContainer) {
          btnSiguienteContainer.classList.add('d-none');
          const btnSiguiente = btnSiguienteContainer.querySelector('button');
          if (btnSiguiente) btnSiguiente.classList.add('d-none');
        }
      }
    }
  }

  function mostrarResumenFinal() {
    // Calcular resultados
    const totalPreguntas = Object.keys(respuestasCorrectas).length;
    const respuestasCorrectas_count = Object.values(resultados).filter((resultado) => resultado === true).length;
    const porcentaje = Math.round((respuestasCorrectas_count / totalPreguntas) * 100);

    let feedbackClass = porcentaje >= 75 ? 'multi-select-feedback-success' : porcentaje >= 50 ? 'multi-select-feedback-warning' : 'multi-select-feedback-error';

    // Generar el detalle de cada pregunta
    const correctnessByQuestion = [];
    for (let i = 1; i <= totalPreguntas; i++) {
      const ok = resultados[i];
      correctnessByQuestion.push({ q: i, ok });
    }

    const items = correctnessByQuestion
      .map(({ q, ok }) => {
        const icon = ok ? '<i class="fa-solid fa-check ms-1" style="color:#fff"></i>' : '<i class="fa-solid fa-xmark ms-1" style="color:#fff"></i>';
        const text = ok ? 'Has contestado correctamente' : 'Has contestado incorrectamente';
        return `<li class="mb-1" style="color:#fff">Pregunta ${q}: ${text} ${icon}</li>`;
      })
      .join('');

    // Integrar el resumen en contenedor externo (único lugar)
    const feedbackExterno = document.getElementById('feedback-final-externo');
    if (feedbackExterno) {
      // Agregar el resumen al contenedor externo
      const resumenHTML = `
        <div id="resumen-final-integrado" class="resumen-final">
          <div class="text-center ${feedbackClass}">
            <div style="color:#fff"><strong>Resumen:</strong> Tus respuestas correctas fueron ${respuestasCorrectas_count} de ${totalPreguntas} (${porcentaje}%)</div>
        <ul class="mt-2 list-unstyled" style="color:#fff">${items}</ul>
          </div>
        </div>
      `;

      feedbackExterno.innerHTML = resumenHTML;
      feedbackExterno.classList.remove('d-none');
    }

    // Marcar como completado
    quizCompletado = true;
    preguntaActualNav = totalPreguntas;

    // Mostrar navegación externa
    document.getElementById('navegacion-resumen').classList.remove('d-none');

    // Actualizar contador de navegación
    document.getElementById('totalPreguntasNav').textContent = totalPreguntas;
    document.getElementById('preguntaActualNav').textContent = totalPreguntas;

    // Ocultar todos los botones "Continuar" y sus contenedores inmediatamente
    document.querySelectorAll('.btn-siguiente-container').forEach((container) => {
      container.classList.add('d-none');
      container.style.display = 'none';
    });
    document.querySelectorAll('[data-siguiente]').forEach((btn) => {
      btn.classList.add('d-none');
      btn.style.display = 'none';
    });

    // Configurar navegación
    configurarNavegacionResumen();
  }

  function siguientePregunta(proximaPregunta) {
    // Verificar si hemos completado todas las preguntas
    if (proximaPregunta > totalPreguntas) {
      mostrarResumenFinal();
      return;
    }

    preguntaActual = proximaPregunta;
    mostrarPregunta(proximaPregunta);
  }

  function reiniciarActividad() {
    // Restablecer variables
    preguntaActual = 1;
    respuestasUsuario = {};
    resultados = {};
    quizCompletado = false;
    preguntaActualNav = 1;

    // Limpiar todas las selecciones y habilitar opciones
    document.querySelectorAll('.opcion-respuesta').forEach((opcion) => {
      opcion.classList.remove('seleccionada_alertas', 'act', 'true', 'false');
      opcion.style.pointerEvents = 'auto';
      opcion.style.display = ''; // Restaurar display
    });

    // Remover clases de pregunta validada
    document.querySelectorAll('.preguntas_01').forEach((pregunta) => {
      pregunta.classList.remove('pregunta-validada');
    });

    // Ocultar todos los mensajes de feedback
    document.querySelectorAll('[id^="mensaje_error_"]').forEach((elemento) => {
      elemento.classList.add('d-none');
    });

    document.querySelectorAll('[id^="resultado_alertas_"]').forEach((elemento) => {
      elemento.classList.add('d-none');
    });

    // Limpiar feedback externo
    const feedbackExterno = document.getElementById('feedback-final-externo');
    if (feedbackExterno) {
      feedbackExterno.innerHTML = '';
      feedbackExterno.classList.add('d-none');
    }

    // Eliminar resumen integrado si existe (por si acaso)
    const resumenIntegrado = document.getElementById('resumen-final-integrado');
    if (resumenIntegrado) {
      resumenIntegrado.remove();
    }

    // Eliminar resumenes temporales
    document.querySelectorAll('#resumen-temporal').forEach((elemento) => {
      elemento.remove();
    });

    // Ocultar navegación externa
    document.getElementById('navegacion-resumen').classList.add('d-none');

    // Restablecer todos los botones "Continuar" y sus contenedores
    document.querySelectorAll('.btn-siguiente-container').forEach((container) => {
      container.classList.add('d-none');
      container.style.display = '';
    });

    document.querySelectorAll('[data-siguiente]').forEach((btn) => {
      btn.classList.add('d-none');
      btn.style.display = '';
    });

    // Restablecer botones validar
    document.querySelectorAll('.btn-validar').forEach((btn) => {
      btn.classList.remove('d-none');
      btn.style.display = '';
    });

    // Restablecer todos los elementos de feedback que pudieran estar ocultos
    document.querySelectorAll('.multi-select-feedback-success, .multi-select-feedback-error, .multi-select-feedback-warning').forEach((feedback) => {
      feedback.style.display = '';
    });

    // Reiniciar contador de preguntas validadas
    preguntasValidadas = 0;
    actualizarProgresoPreguntas();

    // Mostrar la primera pregunta
    mostrarPregunta(1);
  }

  function configurarEventListeners() {
    // Event listeners para seleccionar opciones usando delegación de eventos
    document.getElementById('preguntas-container').addEventListener('click', function (event) {
      if (event.target.classList.contains('opcion-respuesta')) {
        const preguntaContainer = event.target.closest('.preguntas_01');
        const opciones = preguntaContainer.querySelectorAll('.opcion-respuesta');

        // Quitar selección previa y clases de resultado
        opciones.forEach((opt) => {
          opt.classList.remove('seleccionada_alertas', 'act', 'true', 'false');
        });

        // Seleccionar la actual
        event.target.classList.add('seleccionada_alertas', 'act');
      }
    });

    // Event listeners para botones validar usando delegación de eventos
    document.getElementById('preguntas-container').addEventListener('click', function (event) {
      if (event.target.classList.contains('btn-validar') || event.target.closest('.btn-validar')) {
        const btn = event.target.classList.contains('btn-validar') ? event.target : event.target.closest('.btn-validar');
        const numeroPregunta = parseInt(btn.getAttribute('data-pregunta'));
        validarPregunta(numeroPregunta);
      }
    });

    // Event listener para botones continuar usando delegación de eventos
    document.getElementById('preguntas-container').addEventListener('click', function (event) {
      if (event.target.hasAttribute('data-siguiente') || event.target.closest('[data-siguiente]')) {
        if (quizCompletado) return;
        const btn = event.target.hasAttribute('data-siguiente') ? event.target : event.target.closest('[data-siguiente]');
        const siguientePregunta = parseInt(btn.getAttribute('data-siguiente'));
        preguntaActual = siguientePregunta;
        mostrarPregunta(siguientePregunta);
      }
    });

    // Event listener para botón reiniciar usando delegación de eventos
    document.getElementById('preguntas-container').addEventListener('click', function (event) {
      if (event.target.classList.contains('btn-reiniciar') || event.target.closest('.btn-reiniciar')) {
        reiniciarActividad();
      }
    });

    // Listener global para el botón reiniciar externo (navegación resumen)
    document.addEventListener('click', function (event) {
      const reiniciarBtn = event.target.closest('.btn-reiniciar');
      if (reiniciarBtn) {
        event.preventDefault();
        reiniciarActividad();
      }
    });
  }

  // Función para configurar navegación después de completar
  function configurarNavegacionResumen() {
    if (navHandlersAdded) return;
    navHandlersAdded = true;

    // Event listeners para navegación
    document.getElementById('btnAnteriorNav').addEventListener('click', () => {
      if (preguntaActualNav > 1) {
        preguntaActualNav--;
        mostrarPreguntaNavegacion(preguntaActualNav);
      }
    });

    document.getElementById('btnSiguienteNav').addEventListener('click', () => {
      if (preguntaActualNav < totalPreguntas) {
        preguntaActualNav++;
        mostrarPreguntaNavegacion(preguntaActualNav);
      }
    });

    function mostrarPreguntaNavegacion(numeroPregunta) {
      // Ocultar todas las preguntas
      document.querySelectorAll('.preguntas_01').forEach((pregunta) => {
        pregunta.classList.add('d-none');
      });

      // Mostrar pregunta específica
      const preguntaElement = document.querySelector(`[data-pregunta="${numeroPregunta}"]`);
      if (preguntaElement) {
        preguntaElement.classList.remove('d-none');

        // Si el quiz está completado, ocultar elementos de feedback individual y botones "Continuar"
        if (quizCompletado) {
          // Ocultar feedback individual de respuestas
          const feedbackIndividual = preguntaElement.querySelectorAll('.multi-select-feedback-success, .multi-select-feedback-error, .multi-select-feedback-warning');
          feedbackIndividual.forEach((feedback) => {
            if (feedback.closest('#resumen-final-integrado') === null) {
              feedback.style.display = 'none';
            }
          });

          // Ocultar botones "Continuar" individuales
          const botonesIndividuales = preguntaElement.querySelectorAll('.btn-siguiente:not(#btnSiguienteNav)');
          botonesIndividuales.forEach((btn) => {
            btn.style.display = 'none';
          });

          // Ocultar contenedores de botones "Continuar"
          const contenedoresContinuar = preguntaElement.querySelectorAll('.btn-siguiente-container');
          contenedoresContinuar.forEach((container) => {
            container.style.display = 'none';
          });

          // Ocultar botón validar también durante la navegación del resumen
          const btnValidar = preguntaElement.querySelector('.btn-validar');
          if (btnValidar) btnValidar.style.display = 'none';
        }
      }

      // Actualizar contador en navegación
      document.getElementById('preguntaActualNav').textContent = numeroPregunta;

      // Actualizar botones
      const btnAnterior = document.getElementById('btnAnteriorNav');
      const btnSiguiente = document.getElementById('btnSiguienteNav');

      btnAnterior.disabled = numeroPregunta === 1;
      btnSiguiente.disabled = numeroPregunta === totalPreguntas;
    }
  }

  // Funcionalidad del cuestionario secuencial
  function inicializarCuestionario() {
    preguntaActual = 1;
    respuestasUsuario = {};
    resultados = {};
    mostrarPregunta(1);
    configurarEventListeners();
  }

  // Inicializar el cuestionario
  inicializarCuestionario();

  // Inicializa el progreso al cargar la página
  actualizarProgresoPreguntas();
}