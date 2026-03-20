(function () {
    // Configuration: Paths are relative to the project root 'chile_ley_karin'
    const menuLinks = [
        { label: 'Inicio', path: 'index.html', icon: 'fas fa-home' },
        { label: 'Guía de portada', path: 'module/inicio/inicio.html', icon: 'fas fa-book' },
        { label: 'Lección 1', path: 'module/leccion1/index.html', icon: 'fas fa-book-open' },
        { label: 'Lección 2', path: 'module/leccion2/index.html', icon: 'fas fa-book-open' },
        { label: 'Lección 3', path: 'module/leccion3/index.html', icon: 'fas fa-book-open' },
        { label: 'Compromiso', path: 'module/compromiso/compromiso.html', icon: 'fas fa-handshake' }
    ];

    function initMenu() {
        const currentUrl = new URL(window.location.href);
        const currentPath = currentUrl.pathname;
        const parts = currentPath.split('/');
        const isCompromisoPage = currentPath.endsWith('module/compromiso/compromiso.html');
        const isResumenLeccionPage = currentPath.includes('/module/leccion') && currentPath.includes('resumen_leccion');
        const isEvaluacionLeccionPage = currentPath.includes('/module/leccion') && currentPath.includes('evaluacion_leccion');
        const shouldUseFloatingButton = isCompromisoPage || isResumenLeccionPage || isEvaluacionLeccionPage;

        const scriptEl = document.currentScript || document.querySelector('script[src*="plugins/menu/menu.js"],script[src$="/menu.js"],script[src$="menu.js"]');
        const scriptUrl = scriptEl && scriptEl.src ? new URL(scriptEl.src, currentUrl.href) : currentUrl;
        const menuDirUrl = new URL('./', scriptUrl);
        const rootUrl = new URL('../../', menuDirUrl);

        // 2. Inject CSS
        if (!document.getElementById('menu-drawer-style')) {
            const link = document.createElement('link');
            link.id = 'menu-drawer-style';
            link.rel = 'stylesheet';
            link.href = new URL('menu.css', menuDirUrl).href;
            document.head.appendChild(link);
        }

        // 2.5. Inject Font Awesome if not present
        if (!document.querySelector('link[href*="font-awesome"]') && !document.querySelector('link[href*="all.min.css"]')) {
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
            document.head.appendChild(faLink);
        }

        // 3. Create Menu HTML
        const menuOverlay = document.createElement('div');
        menuOverlay.className = 'menu-overlay';
        menuOverlay.id = 'menuOverlay';

        const menuDrawer = document.createElement('div');
        menuDrawer.className = 'menu-drawer';
        menuDrawer.id = 'menuDrawer';

        const currentFileName = parts[parts.length - 1];
        const currentDir = parts[parts.length - 2];

        let navItemsHtml = '';
        const urlParams = currentUrl.search;
        menuLinks.forEach(link => {
            const targetUrl = new URL(link.path, rootUrl);
            targetUrl.search = urlParams;
            const fullPath = targetUrl.href;
            const isActive = currentPath === targetUrl.pathname;
            navItemsHtml += `
                <li class="nav-item">
                    <a href="${fullPath}" class="nav-link ${isActive ? 'active' : ''}">
                        <i class="${link.icon}"></i>
                        <span>${link.label}</span>
                    </a>
                </li>
            `;
        });

        const progressValue = calculateProgress(); // Simple progress simulation

        menuDrawer.innerHTML = `
            <div class="drawer-header">
                <button class="close-drawer" id="closeMenuBtn">
                    <i class="fas fa-times"></i>
                </button>
                <div class="user-info">
                    <h2>Hola! Bienvenido</h2>
                    <p>Ruta de Aprendizaje</p>
                </div>
                <div class="progress-container">
                    <div class="progress-text">
                        <span>Tu Progreso</span>
                        <span>${progressValue}%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${progressValue}%"></div>
                    </div>
                </div>
            </div>
            <nav class="drawer-nav">
                <ul class="nav-list">
                    ${navItemsHtml}
                </ul>
            </nav>
        `;

        document.body.appendChild(menuOverlay);
        document.body.appendChild(menuDrawer);

        function insertFloatingButton() {
            if (document.getElementById('openMenuBtn')) return;
            const hamburgerBtn = document.createElement('button');
            hamburgerBtn.className = 'hamburger-btn-navbar';
            hamburgerBtn.id = 'openMenuBtn';
            hamburgerBtn.setAttribute('type', 'button');
            hamburgerBtn.style.position = 'fixed';
            hamburgerBtn.style.top = '12px';
            hamburgerBtn.style.right = '12px';
            hamburgerBtn.style.zIndex = '10002';
            hamburgerBtn.style.color = '#fff';
            hamburgerBtn.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.appendChild(hamburgerBtn);
            hamburgerBtn.addEventListener('click', toggleMenu);
        }

        // 3.5. Insert Hamburger Button into Navbar
        function tryInsertButton(attempt) {
            const txPg = document.querySelector('.txPg');
            if (txPg && txPg.parentElement) {
                // Remove existing button if any (avoid duplication)
                if (document.getElementById('openMenuBtn')) return;

                const hamburgerBtn = document.createElement('button');
                hamburgerBtn.className = 'hamburger-btn-navbar';
                hamburgerBtn.id = 'openMenuBtn';
                hamburgerBtn.innerHTML = '<i class="fas fa-bars"></i>';

                txPg.parentElement.appendChild(hamburgerBtn);

                // Add event listener to the newly inserted button
                hamburgerBtn.addEventListener('click', toggleMenu);
            } else {
                // Retry if navbar is not yet available
                if (attempt >= 20) return;
                setTimeout(() => tryInsertButton(attempt + 1), 500);
            }
        }

        if (shouldUseFloatingButton) {
            insertFloatingButton();
        } else {
            tryInsertButton(0);
        }

        // 4. Event Listeners
        const closeBtn = document.getElementById('closeMenuBtn');
        const overlay = document.getElementById('menuOverlay');
        const drawer = document.getElementById('menuDrawer');

        function toggleMenu() {
            drawer.classList.toggle('active');
            overlay.classList.toggle('active');
            const openBtn = document.getElementById('openMenuBtn');
            if (openBtn) openBtn.style.display = drawer.classList.contains('active') ? 'none' : '';
        }

        closeBtn.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
    }

    function calculateProgress() {
        // Try to get progress from localStorage if it exists
        try {
            const savedProgreso = localStorage.getItem('cursoProgreso');
            if (savedProgreso) {
                const data = JSON.parse(savedProgreso);
                if (data.progress) return data.progress;
            }
        } catch (e) {
            console.warn('Could not read progress from localStorage');
        }

        // Fallback logic based on current page
        const path = window.location.pathname;
        if (path.includes('/module/evaluacion/') || path.endsWith('/module/evaluacion/quiz.html')) return 100;
        if (path.includes('compromiso')) return 100;
        if (path.includes('leccion3')) return 75;
        if (path.includes('leccion2')) return 50;
        if (path.includes('leccion1')) return 25;
        if (path.includes('inicio')) return 10;
        return 0;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMenu);
    } else {
        initMenu();
    }
})();
