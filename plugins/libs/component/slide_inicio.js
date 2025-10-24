const visitedTabs = new Set();
const STORAGE_KEY = 'curso_tabs_progress';

// Función para cargar el progreso desde localStorage
function loadProgress() {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        // Restaurar tabs visitados
        progressData.visitedTabs.forEach(tabNumber => {
            visitedTabs.add(tabNumber);
            const checkIcon = document.getElementById(`check${tabNumber}`);
            checkIcon.innerHTML = `<i class="fas fa-check-circle"></i>`;
            checkIcon.classList.add("active");
            checkIcon.classList.remove("inactive");
        });
        
        // Actualizar barra de progreso
        updateProgressBar();
        
        // Verificar si debe habilitar el botón
        checkAllTabsCompleted();
        
        console.log('Progreso cargado desde localStorage:', progressData);
    }
}

// Función para guardar el progreso en localStorage
function saveProgress() {
    const progressData = {
        visitedTabs: Array.from(visitedTabs),
        completedAt: visitedTabs.size === 4 ? new Date().toISOString() : null
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    console.log('Progreso guardado:', progressData);
}

// Función para actualizar la barra de progreso
function updateProgressBar() {
    const progressPercent = (visitedTabs.size / 4) * 100;
    document.getElementById("progress-bar").style.width = progressPercent + "%";
}

// Función para verificar si todos los tabs están completados
function checkAllTabsCompleted() {
    if (visitedTabs.size === 4) {
        console.log("Todos los tabs han sido visitados. Habilitando el botón de inicio.");
        
        document.getElementById("start-btn").disabled = false;
        document.getElementById("start-btn").classList.add("sf-btn-purple");
        document.getElementById("start-btn").classList.remove("sf-disabled");
        document.getElementById('warning-msg').classList.add('hidden');
        document.getElementById('success-msg').classList.remove('hidden');
        
        // Guardar que se completó todo
        saveProgress();
    }
}

function changeTab(tabNumber) {
    // Oculta todos los contenidos
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`content${i}`).style.display = "none";
        document.getElementById(`tab${i}`).classList.remove("active");
    }

    // Muestra el contenido del tab seleccionado
    document.getElementById(`content${tabNumber}`).style.display = "block";
    document.getElementById(`tab${tabNumber}`).classList.add("active");

    // Marca como visitado si no lo ha sido antes
    if (!visitedTabs.has(tabNumber)) {
        visitedTabs.add(tabNumber);
        const checkIcon = document.getElementById(`check${tabNumber}`);
        checkIcon.innerHTML = `<i class="fas fa-check-circle"></i>`;
        checkIcon.classList.add("active");
        checkIcon.classList.remove("inactive");
        
        // Guardar progreso inmediatamente
        saveProgress();
    }

    // Actualiza la barra de progreso
    updateProgressBar();

    // Verifica si todos los tabs están completados
    checkAllTabsCompleted();
}

// Función para resetear el progreso (opcional, para testing)
function resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
    visitedTabs.clear();
    
    // Resetear UI
    for (let i = 1; i <= 4; i++) {
        const checkIcon = document.getElementById(`check${i}`);
        checkIcon.innerHTML = '';
        checkIcon.classList.remove("active");
        checkIcon.classList.add("inactive");
    }
    
    document.getElementById("progress-bar").style.width = "0%";
    document.getElementById("start-btn").disabled = true;
    document.getElementById("start-btn").classList.remove("sf-btn-purple");
    document.getElementById("start-btn").classList.add("sf-disabled");
    document.getElementById('warning-msg').classList.remove('hidden');
    document.getElementById('success-msg').classList.add('hidden');
    
    console.log('Progreso reseteado');
}

// Al cargar la página
window.onload = () => {
    // Configuración inicial
    document.getElementById("content1").style.display = "block";
    for (let i = 2; i <= 4; i++) {
        document.getElementById(`content${i}`).style.display = "none";
    }
    
    // Inicializar checks como inactivos
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`check${i}`).classList.add("inactive");
        document.getElementById(`check${i}`).classList.remove("active");
    }
    
    // Configuración inicial del botón
    document.getElementById("start-btn").disabled = true;
    document.getElementById("start-btn").classList.add("sf-disabled");
    document.getElementById("start-btn").classList.remove("sf-btn-purple");
    document.getElementById('warning-msg').classList.remove('hidden');
    document.getElementById('success-msg').classList.add('hidden');
    
    // Cargar progreso guardado
    loadProgress();
    
    // Activar el primer tab
    document.getElementById("tab1").classList.add("active");
    
    console.log('Página cargada, progreso restaurado');
};

// Exponer funciones globalmente para debugging
window.resetProgress = resetProgress;
window.saveProgress = saveProgress;
window.loadProgress = loadProgress;
