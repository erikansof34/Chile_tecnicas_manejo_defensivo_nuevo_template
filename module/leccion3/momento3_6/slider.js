export function init() {

    let isUnlocked = false; // Candado para controlar la reproducción del audio inicial

    // Datos de la información
    const infoDataMom3Sld11 = {
        1: {
            text: "<strong>1.</strong>",
            audio: "./momento3_6/audio/L3-slide_6_audio1.mp3",
            transcripcion: [
                { "end": 5.7, "start": 0, "text": "1. Realice un recorrido 360º alrededor del vehículo para identificar condiciones" },
                { "end": 12.98, "start": 5.7, "text": "de riesgo tales como motocicletas, animales, niños, juguetes, vehículos, muros, etc." }
            ]
        },
        2: {
            text: "<strong>2.</strong>",
            audio: "./momento3_6/audio/L3-slide_6_audio2.mp3",
            transcripcion: [
                { "end": 7.46, "start": 0, "text": "2. Revisen niveles de líquidos en el motor, refrigerante, hidráulico, nivel aceite, líquido frenos y líquido limpia" },
                { "end": 10.22, "start": 7.52, "text": "parabrisas, como se indica en la imagen." }
            ]
        },
        3: {
            text: "<strong>3.</strong>",
            audio: "./momento3_6/audio/L3-slide_6_audio3.mp3",
            transcripcion: [
                { "end": 7.17, "start": 0, "text": "3. Abra el switch de encendido, y verifique la notificación de los testigos encendidos en el vehículo, como se observa" },
                { "end": 8.02, "start": 7.23, "text": "en la imagen." }
            ]
        },
        4: {
            text: "<strong>4.</strong>",
            audio: "./momento3_6/audio/L3-slide_6_audio4.mp3",
            transcripcion: [
                { "end": 3.56, "start": 0, "text": "4. Cuadre los espejos laterales y el espejo retrovisor." }
            ]
        },
        5: {
            text: "<strong>5.</strong>",
            audio: "./momento3_6/audio/L3-slide_6_audio5.mp3",
            transcripcion: [
                { "end": 3.16, "start": 0, "text": "5. Ubica adecuadamente la postura de la silla" }
            ]
        },
        6: {
            text: "<strong>6.</strong>",
            audio: "./momento3_6/audio/L3-slide_6_audio6.mp3",
            transcripcion: [
                { "end": 7.38, "start": 0, "text": "6. Enciende el vehículo, y espere que el sistema se lubrique y la revolución esté entre los 500 RPM y 1000 RPM." }
            ]
        },
        7: {
            text: "<strong>7.</strong>",
            audio: "./momento3_6/audio/L3-slide_6_audio7.mp3",
            transcripcion: [
                { "end": 1.86, "start": 0, "text": "7. Inicia la marcha" }
            ]
        }
    };

    // Función para cambiar la información
    function changeInfo(buttonId, autoplay = false) {
        const infoText = document.getElementById('info-text-mom3-11');
        const audioPlayer = document.getElementById('audioPlayer-mom3-11');
        const data = infoDataMom3Sld11[buttonId];

        if (infoText && data) {
            infoText.innerHTML = data.text;
        }

        if (audioPlayer && data) {
            // Pausar el audio actual
            audioPlayer.pause();

            // Limpiar transcripción activa
            const transcripcionGlobal = document.getElementById('transcripcion-global');
            if (transcripcionGlobal) {
                transcripcionGlobal.style.display = 'none';
                transcripcionGlobal.innerHTML = '';
            }

            // Cambiar la fuente del audio
            audioPlayer.src = data.audio;

            // Actualizar transcripción
            audioPlayer.setAttribute('data-transcripcion', JSON.stringify(data.transcripcion));

            // Cargar el nuevo audio
            audioPlayer.load();

            // Reproducir automáticamente si se solicita
            if (autoplay) {
                audioPlayer.addEventListener('canplaythrough', function () {
                    audioPlayer.play().catch(e => console.log('Error al reproducir:', e));
                }, { once: true });
            }

            // Limpiar eventos anteriores del botón de transcripción
            const transcriptionToggle = document.querySelector('.transcription-toggle');
            if (transcriptionToggle) {
                transcriptionToggle.replaceWith(transcriptionToggle.cloneNode(true));
            }

            // Reinicializar transcripciones inmediatamente
            if (window.initTranscripciones) {
                window.initTranscripciones();
            }
        }

        // Actualizar estado activo de los botones
        const buttons = document.querySelectorAll('.circle-button-mom3-11');

        buttons.forEach(button => {
            if (button.getAttribute('data-id') === buttonId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Añadir event listeners a los botones
    const buttons = document.querySelectorAll('.circle-button-mom3-11');

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const buttonId = this.getAttribute('data-id');

            // Desbloquear el audio al hacer clic en cualquier tooltip
            if (!isUnlocked) {
                isUnlocked = true;
                const audioCenter = document.querySelector('.audio-center');
                if (audioCenter) {
                    audioCenter.classList.remove('audio-locked');
                }
            }

            changeInfo(buttonId, true); // Activar autoplay al hacer clic
        });
    });

    // Inicializar transcripciones
    if (window.initTranscripciones) {
        window.initTranscripciones();
    }

    // Mostrar candado inicial en el audio
    const audioCenter = document.querySelector('.audio-center');
    if (audioCenter) {
        audioCenter.classList.add('audio-locked');
    }

    // Bloquear reproducción manual del audio inicial
    const audioPlayer = document.getElementById('audioPlayer-mom3-11');
    if (audioPlayer) {
        audioPlayer.addEventListener('play', (e) => {
            if (!isUnlocked) {
                e.preventDefault();
                audioPlayer.pause();
                console.log('Audio bloqueado. Haz clic en un tooltip primero.');
            }
        });
    }

    // Inicializar con el primer elemento activo (sin autoplay)
    changeInfo('1', false);
}