export function init() {
  const audios = [
    {
      title: "1. Atención y Visión Periférica",
      src: "./momento2_3/audio/L2-slide_3_factor_1.mp3",
      transcripcion: [
        { "end": 3.08, "start": 0, "text": "Manté la atención en todo lo que sucede a tu alrededor." },
        { "end": 9.38, "start": 3.86, "text": "La visión periférica es clave para reaccionar rápidamente ante cualquier imprevisto en la carretera." },
        { "end": 15.14, "start": 10.18, "text": "Además, debes estar alerta a los puntos ciegos y a los vehículos que se aproximan por detrás." }
      ]
    },
    {
      title: "2. Anticipación y Predecibilidad",
      src: "./momento2_3/audio/L2-slide_3_factor_2.mp3",
      transcripcion: [
        { "end": 3.7, "start": 0, "text": "Anticipa tus movimientos y se predecible para otros conductores." },
        { "end": 7.9, "start": 4.36, "text": "Así, podrán reaccionar mejor y evitar accidentes." }
      ]
    },
    {
      title: "3. Uso de Tecnología para la Seguridad",
      src: "./momento2_3/audio/L2-slide_3_factor_3.mp3",
      transcripcion: [
        { "end": 3.86, "start": 0, "text": "utiliza la tecnología para ayudarte a prevenir accidentes." },
        { "end": 7.16, "start": 4.2, "text": "Existen sistemas de videovigilancia y telemática," },
        { "end": 10.28, "start": 7.4, "text": "que te permiten mantenerte a salvo ante cualquier eventualidad," },
        { "end": 12.36, "start": 10.46, "text": "tanto interna como fuera del vehículo." }
      ]
    }
  ];

  let currentAudioIndex = 0;
  let isUnlocked = false; // Candado para controlar la reproducción
  const audioPlayer = document.getElementById("myAudio");
  const audioSource = document.getElementById("audioSource_sld9");
  const audioTitle = document.getElementById("audio-title");
  const startButton = document.getElementById("startButton");
  const audioControls = document.getElementById("audioControls");
  const prevButton = document.getElementById("prevAudio_sld9");
  const nextButton = document.getElementById("nextAudio_sld9");
  const audioCenter = document.querySelector(".audio-center");

  function updateAudio() {
    audioSource.src = audios[currentAudioIndex].src;
    audioTitle.textContent = audios[currentAudioIndex].title;
    audioPlayer.setAttribute('data-transcripcion', JSON.stringify(audios[currentAudioIndex].transcripcion));
    audioPlayer.load();

    // Reinicializar transcripciones después de cambiar el audio
    if (window.initTranscripciones) {
      window.initTranscripciones();
    }

    audioPlayer.play().then(() => {
      console.log("Reproducción iniciada correctamente.");
    }).catch(error => {
      console.error("Error al reproducir el audio:", error);
    });

    // Mostrar/Ocultar botones según el índice actual
    if (currentAudioIndex === 0) {
      prevButton.style.display = 'none';
      nextButton.style.display = 'inline-block';
    } else if (currentAudioIndex === audios.length - 1) {
      prevButton.style.display = 'inline-block';
      nextButton.style.display = 'none';
    } else {
      prevButton.style.display = 'inline-block';
      nextButton.style.display = 'inline-block';
    }
  }

  // Mostrar candado inicial
  audioCenter.classList.add('audio-locked');

  // Bloquear reproducción inicial con candado
  audioPlayer.addEventListener('play', (e) => {
    if (!isUnlocked) {
      e.preventDefault();
      audioPlayer.pause();
      console.log('Audio bloqueado. Presiona el botón Iniciar primero.');
    }
  });

  // Inicializar transcripciones al cargar
  if (window.initTranscripciones) {
    window.initTranscripciones();
  }

  startButton.addEventListener("click", () => {
    isUnlocked = true; // Quitar el candado
    audioCenter.classList.remove('audio-locked'); // Quitar candado visual
    startButton.style.display = 'none';
    audioControls.style.display = 'block';
    updateAudio();
  });

  prevButton.addEventListener("click", () => {
    if (currentAudioIndex > 0) {
      currentAudioIndex--;
      updateAudio();
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentAudioIndex < audios.length - 1) {
      currentAudioIndex++;
      updateAudio();
    }
  });
}