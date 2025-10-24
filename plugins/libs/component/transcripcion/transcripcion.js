// transcripciones.js

function initTranscripciones(container = document) {
  console.log('⚡ Inicializando transcripciones en container:', container);

  const audios = container.querySelectorAll('.audio-con-transcripcion');
  const transcripcionGlobal = container.querySelector('#transcripcion-global') || document.querySelector('#transcripcion-global');

  console.log('🔹 Audios encontrados:', audios.length);
  console.log('🔹 Contenedor de transcripción:', transcripcionGlobal);

  if (!transcripcionGlobal || audios.length === 0) {
    console.warn('❌ No hay audios o transcripcion-global');
    return;
  }

  function updateTranscripcion(audio, textos, toggleBtn) {
    const tiempoActual = audio.currentTime;
    const textoActual = textos.find(item => tiempoActual >= item.start && tiempoActual <= item.end);

    if (toggleBtn?.classList.contains('active')) {
      if (textoActual) {
        transcripcionGlobal.textContent = textoActual.text;
        transcripcionGlobal.style.display = 'block';
        console.log(`⏱ Tiempo ${tiempoActual.toFixed(2)}s - Texto mostrado: "${textoActual.text}"`);
      } else {
        transcripcionGlobal.style.display = 'none';
        console.log(`⏱ Tiempo ${tiempoActual.toFixed(2)}s - No hay texto`);
      }
    } else {
      transcripcionGlobal.style.display = 'none';
    }

    if (!audio.paused && !audio.ended) {
      requestAnimationFrame(() => updateTranscripcion(audio, textos, toggleBtn));
    }
  }

  audios.forEach((audio, index) => {
    console.log('🎧 Configurando audio', index, audio);

    const toggleBtn = audio.parentElement.querySelector('.transcription-toggle');
    let textos = [];

    try {
      textos = JSON.parse(audio.getAttribute('data-transcripcion'));
      console.log('📄 Textos cargados:', textos);
    } catch (e) {
      console.error('❌ Error al parsear data-transcripcion:', e);
      return;
    }

    if (toggleBtn) {
      toggleBtn.setAttribute('title', 'Activar subtítulos');

      toggleBtn.addEventListener('click', function () {
        this.classList.toggle('active');
        this.style.color = this.classList.contains('active') ? '#2a7fba' : '#666';
        console.log(`🔘 Botón toggle ${this.classList.contains('active') ? 'activado' : 'desactivado'}`);

        if (this.classList.contains('active') && !audio.paused) {
          updateTranscripcion(audio, textos, toggleBtn);
        } else {
          transcripcionGlobal.style.display = 'none';
        }
      });
    }

    audio.addEventListener('play', () => {
      console.log('▶ Reproduciendo audio', index);
      audios.forEach(a => { if (a !== audio && !a.paused) { a.pause(); console.log('⏸ Pausando otro audio'); } });

      if (toggleBtn?.classList.contains('active')) {
        updateTranscripcion(audio, textos, toggleBtn);
      }
    });

    audio.addEventListener('pause', () => {
      console.log('⏸ Audio pausado', index);
      transcripcionGlobal.style.display = 'none';
      if (toggleBtn) {
        toggleBtn.classList.remove('active');
        toggleBtn.style.color = '#666';
        toggleBtn.setAttribute('title', 'Activar subtítulos');
      }
    });

    audio.addEventListener('ended', () => {
      console.log('⏹ Audio terminado', index);
      transcripcionGlobal.style.display = 'none';
      if (toggleBtn) {
        toggleBtn.classList.remove('active');
        toggleBtn.style.color = '#666';
        toggleBtn.setAttribute('title', 'Activar subtítulos');
      }
    });
  });
}

// 🔹 Exponer globalmente para poder usarlo desde main.js
window.initTranscripciones = initTranscripciones;