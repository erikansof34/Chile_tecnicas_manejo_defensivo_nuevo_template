function observarModal(modal) {
  const modalContent = modal.querySelector('.modal-content');
  if (!modalContent) return;

  const resizeObserver = new ResizeObserver(() => {
    ajustarAltura(modal, modalContent);
  });

  resizeObserver.observe(modalContent);
}

function ajustarAltura(modal, modalContent) {
  const modalContentHeight = modalContent.scrollHeight;
  const windowHeight = window.innerHeight;
  let heightFinal = Math.max(modalContentHeight, windowHeight);

  if (Math.abs(modalContentHeight - windowHeight) < 20) {
    heightFinal += 60;
  } else if (modalContentHeight > windowHeight) {
    heightFinal += 60;
  }

  modal.style.setProperty('--modal-before-height', heightFinal + 'px');
}

function ajustarModalBefore() {
  setTimeout(() => {
    document.querySelectorAll('.modal.show').forEach(modal => {
      const modalContent = modal.querySelector('.modal-content');
      if (!modalContent) return;

      ajustarAltura(modal, modalContent);
      observarModal(modal);
    });
  }, 50);
}

document.addEventListener('shown.bs.modal', ajustarModalBefore);
window.addEventListener('resize', ajustarModalBefore);

function ajustarOpacidadNavegacion(opacidad) {
  const nav = document.querySelector('.btn-navigation-container');
  const par = document.querySelector('.btn-parallax-mobile');
  const widget = document.getElementById('accessibility-widget');
  if (nav) nav.style.opacity = opacidad;
  if (par) par.style.zIndex = (opacidad < 1) ? '1' : '1000';
  if (widget) widget.style.zIndex = (opacidad < 1) ? '1' : '1000';
}

function comportamientoAudioGlobal() {
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach(audio => {
    audio.addEventListener('play', () => {
      audioElements.forEach(otherAudio => {
        if (otherAudio !== audio) {
          otherAudio.pause();
        }
      });
    });
  });
}

// Al abrir modal
document.addEventListener('show.bs.modal', function (e) {
  const modal = e.target;

  // 1. Pausar todos los audios fuera del modal
  document.querySelectorAll('audio').forEach(audio => {
    if (!modal.contains(audio)) {
      audio.pause();
    }
  });

  // 2. Reproducir el primer audio dentro del modal (si existe)
  // const firstAudio = modal.querySelector('audio');
  // if (firstAudio) {
  //   const playPromise = firstAudio.play();
  //   if (playPromise) {
  //     playPromise.catch(() => {
  //       // Puede fallar por políticas de autoplay si no hubo interacción del usuario
  //     });
  //   }
  // }
});

document.addEventListener('shown.bs.modal', function () {
  ajustarOpacidadNavegacion(0.5);
  ajustarModalBefore();
});

// Al cerrar modal → pausar todos los audios (incluidos los del modal)
document.addEventListener('hidden.bs.modal', function () {
  ajustarOpacidadNavegacion(1);
  document.querySelectorAll('audio').forEach(audio => {
    audio.pause();
  });
});

// Inicializar control de audio global (una sola vez)
comportamientoAudioGlobal();