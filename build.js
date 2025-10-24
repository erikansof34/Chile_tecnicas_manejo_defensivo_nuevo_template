const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

// Configuración
const DIST_DIR = './dist';
const ASSETS_DIR = './assets';
const PLUGINS_DIR = './plugins';
const MODULE_DIR = './module';
const WRAPPERS_DIR = './wrappers';

// Información de las lecciones
const LESSONS_INFO = {
    'leccion1': {
        title: 'Lección 1: Fundamentos de SST',
        description: 'Fundamentos de la Seguridad y Salud en el Trabajo'
    },
    'leccion2': {
        title: 'Lección 2: Identificación de Riesgos',
        description: 'Identificación y Evaluación de Riesgos Laborales'
    },
    'leccion3': {
        title: 'Lección 3: Protocolos Preventivos',
        description: 'Protocolos y Medidas Preventivas'
    },
    'inicio': {
        title: 'Guía del Usuario - Orientación y Prevención de Riesgos DS 44',
        description: 'Página de inicio con guía del usuario, objetivos y estructura temática'
    }
};

/**
 * Genera el archivo imsmanifest.xml para SCORM 1.2
 */
function generateManifest(lessonId, isUnified = false) {
    const lessonInfo = LESSONS_INFO[lessonId] || { title: 'Curso Completo', description: 'Curso completo de SST' };
    let resourceHref;
    
    if (isUnified) {
        resourceHref = 'index.html';
    } else if (lessonId === 'inicio') {
        resourceHref = 'index.html'; // Para inicio, usamos el index.html de la raíz
    } else {
        resourceHref = `module/${lessonId}/index.html`;
    }
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST-${Date.now()}" version="1.0"
    xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
    xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                        http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
    
    <metadata>
        <schema>ADL SCORM</schema>
        <schemaversion>1.2</schemaversion>
    </metadata>
    
    <organizations default="ORG-001">
        <organization identifier="ORG-001">
            <title>${lessonInfo.title}</title>
            <item identifier="ITEM-001" identifierref="RES-001">
                <title>${lessonInfo.title}</title>
                <adlcp:masteryscore>80</adlcp:masteryscore>
            </item>
        </organization>
    </organizations>
    
    <resources>
        <resource identifier="RES-001" type="webcontent" adlcp:scormtype="sco" href="${resourceHref}">
            <file href="${resourceHref}"/>
            ${generateFileList(isUnified, lessonId)}
        </resource>
    </resources>
</manifest>`;
}

/**
 * Genera la lista de archivos para el manifest
 */
function generateFileList(isUnified, lessonId) {
    let files = [];
    
    // Archivos base - no incluir config.js para inicio ya que usa el index.html directo
    if (!isUnified && lessonId !== 'inicio') {
        files.push('<file href="config.js"/>');
    }
    
    // Para inicio, agregar archivos específicos
    if (lessonId === 'inicio') {
        files.push('<file href="module/inicio/inicio.html"/>');
    }
    
    // Archivos específicos de la lección
    if (!isUnified && lessonId !== 'inicio') {
        // Archivos principales de la lección
        files.push(`<file href="module/${lessonId}/evaluacion_leccion.html"/>`);
        files.push(`<file href="module/${lessonId}/resumen_leccion.html"/>`);
        files.push(`<file href="module/${lessonId}/lms.js"/>`);
        
        // Archivos de momentos dinámicos según la lección
        const momentPatterns = {
            'leccion1': ['momento1_1', 'momento1_2', 'momento1_3', 'momento1_4', 'momento1_5actividad', 'momento1_6actividad', 'momento1_7', 'momento1_8actividad'],
            'leccion2': ['momento2_1', 'momento2_2', 'momento2_3', 'momento2_4', 'momento2_5', 'momento2_6', 'momento2_7', 'momento2_8', 'momento2_9', 'momento2_10'],
            'leccion3': ['momento3_1', 'momento3_2', 'momento3_3', 'momento3_4', 'momento3_5', 'momento3_6', 'momento3_7', 'momento3_8', 'momento3_9', 'momento3_10', 'momento3_11']
        };
        
        const momentos = momentPatterns[lessonId] || [];
        momentos.forEach(momento => {
            files.push(`<file href="module/${lessonId}/${momento}/index.html"/>`);
            files.push(`<file href="module/${lessonId}/${momento}/slider.css"/>`);
            files.push(`<file href="module/${lessonId}/${momento}/slider.js"/>`);
        });
    }
    
    // Archivos de plugins (siempre incluidos)
    const pluginFiles = [
        'plugins/css/style.css',
        'plugins/css/sofactia.css',
        'plugins/css/inicio.css',
        'plugins/css/bg_img.css',
        'plugins/css/bars.css',
        'plugins/css/cards.css',
        'plugins/libs/bootstrap/css/bootstrap.css',
        'plugins/libs/jquery-3.3.1.js',
        'plugins/libs/bootstrap/js/bootstrap.bundle.js',
        'plugins/libs/bootstrap/js/custom-modal-handler.js',
        'plugins/libs/animate/animate.min.css',
        'plugins/libs/assetsWidget/css/widget.css',
        'plugins/libs/assetsWidget/js/widget.js',
        'plugins/libs/component/preloader/preloaders.css',
        'plugins/libs/component/transcripcion/transcripcion.css',
        'plugins/libs/component/transcripcion/transcripcion.js',
        'plugins/libs/component/parallax.js',
        'plugins/libs/component/slide_inicio.js',
        'plugins/js/config/curso-config.js',
        'plugins/js/main.js',
        'plugins/js/modal-bg.js',
        'plugins/js/getProgressActivity.js',
        'plugins/js/trackingmanager_activities.js',
        'plugins/js/trackingmanagern3.js',
        'plugins/js/touch-dnd.js'
    ];
    
    pluginFiles.forEach(file => {
        files.push(`<file href="${file}"/>`);
    });
    
    // Nota: Los archivos de assets se incluyen automáticamente al copiar la carpeta completa
    
    return files.join('\n            ');
}

/**
 * Actualiza el archivo config.js con la información de la lección
 */
function updateScormConfig(lessonId) {
    const lessonInfo = LESSONS_INFO[lessonId];
    const lessonPath = lessonId === 'inicio' ? 'module/inicio/inicio.html' : `module/${lessonId}/index.html`;
    const configContent = `// Configuración SCORM - Generado automáticamente
window.SCORM_CONFIG = {
    lessonPath: '${lessonPath}',
    courseTitle: 'Orientación y Prevención de Riesgos DS 44',
    lessonTitle: '${lessonInfo.title}',
    lessonDescription: '${lessonInfo.description}',
    version: '1.0',
    scormVersion: '1.2'
};`;
    
    return configContent;
}

/**
 * Copia directorios de forma recursiva
 */
async function copyDirectory(src, dest) {
    try {
        await fs.copy(src, dest, {
            overwrite: true,
            errorOnExist: false
        });
        console.log(`✓ Copiado: ${src} → ${dest}`);
    } catch (error) {
        console.error(`Error copiando ${src}:`, error.message);
    }
}

/**
 * Crea un archivo ZIP del directorio dist
 */
async function createZip(lessonId, isUnified = false) {
    let zipName;
    if (isUnified) {
        zipName = 'curso_completo_scorm.zip';
    } else if (lessonId === 'inicio') {
        zipName = 'inicio_scorm.zip';
    } else {
        zipName = `${lessonId}_scorm.zip`;
    }
    const zipPath = path.join('./', zipName);
    
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', () => {
            console.log(`✓ ZIP creado: ${zipName} (${archive.pointer()} bytes)`);
            resolve(zipPath);
        });
        
        archive.on('error', (err) => {
            reject(err);
        });
        
        archive.pipe(output);
        archive.directory(DIST_DIR, false);
        archive.finalize();
    });
}

/**
 * Limpia el directorio de distribución
 */
async function cleanDist() {
    try {
        await fs.remove(DIST_DIR);
        await fs.ensureDir(DIST_DIR);
        console.log('✓ Directorio dist limpiado');
    } catch (error) {
        console.error('Error limpiando dist:', error.message);
    }
}

/**
 * Valida que la lección existe
 */
async function validateLesson(lessonId) {
    // Para inicio, validar diferente estructura
    if (lessonId === 'inicio') {
        const inicioPath = path.join(MODULE_DIR, 'inicio');
        const exists = await fs.pathExists(inicioPath);
        
        if (!exists) {
            throw new Error(`El módulo 'inicio' no existe en ${inicioPath}`);
        }
        
        const inicioHtmlExists = await fs.pathExists(path.join(inicioPath, 'inicio.html'));
        if (!inicioHtmlExists) {
            throw new Error(`No se encontró inicio.html en el módulo 'inicio'`);
        }
        
        return true;
    }
    
    // Validación normal para lecciones
    const lessonPath = path.join(MODULE_DIR, lessonId);
    const exists = await fs.pathExists(lessonPath);
    
    if (!exists) {
        throw new Error(`La lección '${lessonId}' no existe en ${lessonPath}`);
    }
    
    const indexExists = await fs.pathExists(path.join(lessonPath, 'index.html'));
    if (!indexExists) {
        throw new Error(`No se encontró index.html en la lección '${lessonId}'`);
    }
    
    return true;
}

/**
 * Build para una lección específica
 */
async function buildLesson(lessonId) {
    console.log(`\n🚀 Iniciando build para: ${lessonId}`);
    console.log('='.repeat(50));
    
    try {
        // Validar lección
        await validateLesson(lessonId);
        
        // Limpiar directorio de salida
        await cleanDist();
        
        // Copiar archivos globales
        console.log('\n📁 Copiando archivos globales...');
        await copyDirectory(ASSETS_DIR, path.join(DIST_DIR, 'assets'));
        await copyDirectory(PLUGINS_DIR, path.join(DIST_DIR, 'plugins'));
        
        // Copiar la lección específica
        console.log('\n📚 Copiando lección...');
        const moduleDistDir = path.join(DIST_DIR, 'module');
        await fs.ensureDir(moduleDistDir);
        await copyDirectory(
            path.join(MODULE_DIR, lessonId), 
            path.join(moduleDistDir, lessonId)
        );
        
        // Para lecciones, usar el index.html de la lección directamente
        console.log('\n⚙️ Configurando entrada SCORM...');
        // No copiamos wrapper, usamos directamente el index.html de la lección
        
        // Generar config.js actualizado
        const configContent = updateScormConfig(lessonId);
        await fs.writeFile(path.join(DIST_DIR, 'config.js'), configContent, 'utf8');
        console.log('✓ Archivo config.js generado');
        
        // Copiar archivo de integración SCORM específico si existe
        const scormIntegrationPath = path.join(MODULE_DIR, lessonId, 'scorm-integration.js');
        if (await fs.pathExists(scormIntegrationPath)) {
            await fs.copy(scormIntegrationPath, path.join(DIST_DIR, 'scorm-integration.js'));
            console.log('✓ Archivo scorm-integration.js copiado');
        }
        
        // Generar manifest
        console.log('\n📋 Generando imsmanifest.xml...');
        const manifestContent = generateManifest(lessonId, false);
        await fs.writeFile(path.join(DIST_DIR, 'imsmanifest.xml'), manifestContent, 'utf8');
        console.log('✓ imsmanifest.xml generado');
        
        // Crear ZIP
        console.log('\n📦 Creando paquete ZIP...');
        const zipPath = await createZip(lessonId);
        
        console.log('\n✅ Build completado exitosamente!');
        console.log(`📁 Archivos en: ${path.resolve(DIST_DIR)}`);
        console.log(`📦 ZIP: ${path.resolve(zipPath)}`);
        
    } catch (error) {
        console.error('\n❌ Error durante el build:', error.message);
        process.exit(1);
    }
}

/**
 * Build para página de inicio
 */
async function buildInicio() {
    console.log('\n🚀 Iniciando build para: PÁGINA DE INICIO');
    console.log('='.repeat(50));
    
    try {
        // Validar que existe el módulo de inicio
        const inicioPath = path.join(MODULE_DIR, 'inicio');
        const exists = await fs.pathExists(inicioPath);
        
        if (!exists) {
            throw new Error(`El módulo 'inicio' no existe en ${inicioPath}`);
        }
        
        const inicioHtmlExists = await fs.pathExists(path.join(inicioPath, 'inicio.html'));
        if (!inicioHtmlExists) {
            throw new Error(`No se encontró inicio.html en el módulo 'inicio'`);
        }
        
        // Limpiar directorio de salida
        await cleanDist();
        
        // Copiar archivos globales
        console.log('\n📁 Copiando archivos globales...');
        await copyDirectory(ASSETS_DIR, path.join(DIST_DIR, 'assets'));
        await copyDirectory(PLUGINS_DIR, path.join(DIST_DIR, 'plugins'));
        
        // Copiar el index.html de la raíz
        console.log('\n📄 Copiando index.html principal...');
        await fs.copy('./index.html', path.join(DIST_DIR, 'index.html'));
        console.log('✓ Copiado: index.html → dist/index.html');
        
        // Copiar el módulo de inicio
        console.log('\n📚 Copiando módulo de inicio...');
        const moduleDistDir = path.join(DIST_DIR, 'module');
        await fs.ensureDir(moduleDistDir);
        await copyDirectory(
            path.join(MODULE_DIR, 'inicio'), 
            path.join(moduleDistDir, 'inicio')
        );
        
        // Generar manifest para inicio
        console.log('\n📋 Generando imsmanifest.xml...');
        const manifestContent = generateManifest('inicio', false);
        await fs.writeFile(path.join(DIST_DIR, 'imsmanifest.xml'), manifestContent, 'utf8');
        console.log('✓ imsmanifest.xml generado');
        
        // Crear ZIP
        console.log('\n📦 Creando paquete ZIP...');
        const zipPath = await createZip('inicio');
        
        console.log('\n✅ Build completado exitosamente!');
        console.log(`📁 Archivos en: ${path.resolve(DIST_DIR)}`);
        console.log(`📦 ZIP: ${path.resolve(zipPath)}`);
        console.log('\n📝 Contenido del paquete:');
        console.log('  - index.html (página principal con redirección)');
        console.log('  - module/inicio/inicio.html (guía del usuario)');
        console.log('  - assets/ (recursos globales)');
        console.log('  - plugins/ (librerías CSS/JS)');
        console.log('  - imsmanifest.xml (configuración SCORM)');
        
    } catch (error) {
        console.error('\n❌ Error durante el build:', error.message);
        process.exit(1);
    }
}

/**
 * Build para curso unificado
 */
async function buildUnified() {
    console.log('\n🚀 Iniciando build para: CURSO COMPLETO');
    console.log('='.repeat(50));
    
    try {
        // Limpiar directorio de salida
        await cleanDist();
        
        // Copiar archivos globales
        console.log('\n📁 Copiando archivos globales...');
        await copyDirectory(ASSETS_DIR, path.join(DIST_DIR, 'assets'));
        await copyDirectory(PLUGINS_DIR, path.join(DIST_DIR, 'plugins'));
        
        // Copiar todas las lecciones y módulos
        console.log('\n📚 Copiando todas las lecciones...');
        await copyDirectory(MODULE_DIR, path.join(DIST_DIR, 'module'));
        
        // Copiar wrapper unificado
        console.log('\n⚙️ Configurando wrapper unificado...');
        await fs.copy(
            path.join(WRAPPERS_DIR, 'unificado', 'index.html'), 
            path.join(DIST_DIR, 'index.html')
        );
        
        // Generar manifest para curso completo
        console.log('\n📋 Generando imsmanifest.xml...');
        const manifestContent = generateManifest('unificado', true);
        await fs.writeFile(path.join(DIST_DIR, 'imsmanifest.xml'), manifestContent, 'utf8');
        console.log('✓ imsmanifest.xml generado');
        
        // Crear ZIP
        console.log('\n📦 Creando paquete ZIP...');
        const zipPath = await createZip('unificado', true);
        
        console.log('\n✅ Build completado exitosamente!');
        console.log(`📁 Archivos en: ${path.resolve(DIST_DIR)}`);
        console.log(`📦 ZIP: ${path.resolve(zipPath)}`);
        
    } catch (error) {
        console.error('\n❌ Error durante el build:', error.message);
        process.exit(1);
    }
}

/**
 * Muestra ayuda de uso
 */
function showHelp() {
    console.log('\n📚 Sistema de Empaquetado SCORM');
    console.log('='.repeat(40));
    console.log('\nUso:');
    console.log('  node build.js <leccion>     # Empaquetar lección específica');
    console.log('  node build.js inicio        # Empaquetar página de inicio');
    console.log('  node build.js unificado     # Empaquetar curso completo');
    console.log('\nLecciones disponibles:');
    Object.keys(LESSONS_INFO).forEach(lesson => {
        if (lesson === 'inicio') {
            console.log(`  - ${lesson}: ${LESSONS_INFO[lesson].title} (NUEVO)`);
        } else {
            console.log(`  - ${lesson}: ${LESSONS_INFO[lesson].title}`);
        }
    });
    console.log('\nEjemplos:');
    console.log('  node build.js leccion1');
    console.log('  node build.js leccion2');
    console.log('  node build.js inicio        # Genera SCORM con index.html + module/inicio/');
    console.log('  node build.js unificado');
    console.log('\nSalida:');
    console.log('  - Archivos SCORM en ./dist/');
    console.log('  - ZIP listo para Moodle en la raíz del proyecto');
}

// Función principal
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        showHelp();
        return;
    }
    
    const target = args[0];
    
    if (target === 'help' || target === '--help' || target === '-h') {
        showHelp();
        return;
    }
    
    if (target === 'unificado') {
        await buildUnified();
    } else if (target === 'inicio') {
        await buildInicio();
    } else if (LESSONS_INFO[target]) {
        await buildLesson(target);
    } else {
        console.error(`❌ Lección '${target}' no reconocida`);
        showHelp();
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error fatal:', error.message);
        process.exit(1);
    });
}

module.exports = {
    buildLesson,
    buildUnified,
    buildInicio,
    generateManifest,
    updateScormConfig
};
