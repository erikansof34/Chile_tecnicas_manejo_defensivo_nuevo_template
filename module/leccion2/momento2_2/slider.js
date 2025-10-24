export function init() {
  // Configuración de URLs de videos
  const videoUrls = {
    modal: 'https://iframe.mediadelivery.net/embed/386695/f1d9bf8d-9755-4764-8d6f-08c3764a3db2?autoplay=false&loop=false&muted=false&preload=true&responsive=true'
  };

  // Elementos de la caja de cambios
  const gears = document.querySelectorAll(".gear");
  const boxes = document.querySelectorAll(".box-cambio");
  const audios = document.querySelectorAll(".audio-con-transcripcion");

  // Elementos del modal de video
  const videoModal = document.getElementById("sld22-video-vial");
  const videoContainers = {
    web: document.getElementById("Slide23Web"),
    mobile: document.getElementById("Slide23Mobile")
  };
  let currentAudio = null;

  // Función para destruir y recrear iframes de forma agresiva
  function hardRefreshIframe(container, url, className) {
    if (!container) return;

    // 1. Detener completamente el iframe existente
    const iframe = container.querySelector('iframe');
    if (iframe) {
      iframe.src = '';
      iframe.remove();
      container.innerHTML = '';
    }

    // 2. Recrear el iframe después de un breve retraso
    setTimeout(() => {
      container.innerHTML = `
        <iframe class="${className}" 
                src="${url}" 
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" 
                allowfullscreen></iframe>`;
    }, 50);
  }

  // Función para activar el botón correspondiente al audio
  function activateGearForAudio(audioId) {
    // Extraer el número del ID del audio (ej: "audio1_factor" -> "1")
    const gearNumber = audioId.replace('audio', '').replace('_factor', '');

    // Buscar el botón correspondiente
    const correspondingGear = document.querySelector(`.gear[data-gear="${gearNumber}"]`);

    if (correspondingGear) {
      // Desactivar todos los botones
      gears.forEach(g => g.classList.remove("active"));

      // Activar el botón correspondiente
      correspondingGear.classList.add("active");

      // Resaltar el box correspondiente
      boxes.forEach((box) => {
        box.classList.remove("active");
        const p = box.querySelector("p");
        if (p) p.style.color = "";
      });

      const boxToHighlight = document.getElementById(`box${gearNumber}`);
      if (boxToHighlight) {
        boxToHighlight.classList.add("active");
        const p = boxToHighlight.querySelector("p");
        if (p) p.style.color = "#000";
      }
    }
  }

  // Control de la caja de cambios
  gears.forEach((gear) => {
    gear.addEventListener("click", function () {
      const gearNumber = this.getAttribute("data-gear");
      const audioId = `audio${gearNumber}_factor`;
      const boxToHighlight = document.getElementById(`box${gearNumber}`);

      // Detener audio actual
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Reproducir nuevo audio
      currentAudio = document.getElementById(audioId);
      if (currentAudio) {
        currentAudio.currentTime = 0;
        currentAudio.play().catch(e => console.log("Error al reproducir audio:", e));
      }

      // Resaltar box
      boxes.forEach((box) => {
        box.classList.remove("active");
        const p = box.querySelector("p");
        if (p) p.style.color = "";
      });

      if (boxToHighlight) {
        boxToHighlight.classList.add("active");
        const p = boxToHighlight.querySelector("p");
        if (p) p.style.color = "#000";
      }

      // Actualizar engranaje activo
      gears.forEach(g => g.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Control para cuando se hace clic en un audio
  audios.forEach(audio => {
    audio.addEventListener('play', function () {
      // Detener cualquier audio que se esté reproduciendo
      if (currentAudio && currentAudio !== this) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Establecer este audio como el actual
      currentAudio = this;

      // Activar el botón correspondiente
      activateGearForAudio(this.id);
    });
  });

  // Eventos del modal
  if (videoModal) {
    videoModal.addEventListener("show.bs.modal", function () {
      // Pausar todos los audios
      audios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      currentAudio = null;

      // Preparar los iframes del modal (web y mobile)
      hardRefreshIframe(videoContainers.web, videoUrls.modal, 'iframe-video-horizontal-web');
      hardRefreshIframe(videoContainers.mobile, videoUrls.modal, 'iframe-video-horizontal-mobile');
    });

    videoModal.addEventListener("hidden.bs.modal", function () {
      // Reiniciar completamente los iframes al cerrar el modal
      hardRefreshIframe(videoContainers.web, videoUrls.modal, 'iframe-video-horizontal-web');
      hardRefreshIframe(videoContainers.mobile, videoUrls.modal, 'iframe-video-horizontal-mobile');
    });

    // Precargar los iframes después de un retraso
    setTimeout(() => {
      hardRefreshIframe(videoContainers.web, videoUrls.modal, 'iframe-video-horizontal-web');
      hardRefreshIframe(videoContainers.mobile, videoUrls.modal, 'iframe-video-horizontal-mobile');
    }, 500);
  }
}