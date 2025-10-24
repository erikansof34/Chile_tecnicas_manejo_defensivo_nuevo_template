# Guía de Replicación - Sistema de Empaquetado SCORM

Esta guía explica paso a paso cómo replicar el sistema de empaquetado SCORM en futuros proyectos de cursos e-learning.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Estructura Base del Proyecto](#estructura-base-del-proyecto)
3. [Archivos Esenciales](#archivos-esenciales)
4. [Creación de Nueva Lección](#creación-de-nueva-lección)
5. [Configuración de Build](#configuración-de-build)
6. [Integración SCORM](#integración-scorm)
7. [Buenas Prácticas](#buenas-prácticas)
8. [Troubleshooting](#troubleshooting)

## 🔧 Requisitos Previos

### Software Necesario
- **Node.js** (v14 o superior)
- **npm** (incluido con Node.js)
- Editor de código (VS Code recomendado)

### Conocimientos Recomendados
- HTML, CSS, JavaScript básico
- Conceptos básicos de SCORM 1.2
- Manejo de línea de comandos

## 📁 Estructura Base del Proyecto

### 1. Crear Directorio Raíz
```
mi-nuevo-curso/
├── assets/                 # Recursos globales
│   ├── audio/             # Archivos de audio
│   ├── img/               # Imágenes
│   ├── video/             # Videos
│   └── doc/               # Documentos PDF
├── plugins/               # Librerías y estilos globales
│   ├── css/               # Estilos CSS
│   ├── js/                # Scripts JavaScript
│   ├── libs/              # Librerías externas
│   └── scss/              # Archivos SASS (opcional)
├── module/                # Lecciones del curso
│   ├── leccion1/
│   ├── leccion2/
│   └── ...
├── wrappers/              # Plantillas SCORM
│   ├── scorm/             # Para lecciones individuales
│   └── unificado/         # Para curso completo
├── dist/                  # Salida de empaquetado (se genera)
├── package.json           # Configuración Node.js
└── build.js               # Script de construcción
```

## 📄 Archivos Esenciales

### 1. package.json
```json
{
  "name": "mi-curso-scorm",
  "version": "1.0.0",
  "description": "Mi Curso - Empaquetado SCORM",
  "scripts": {
    "build": "node build.js",
    "build:unificado": "node build.js unificado",
    "build:leccion1": "node build.js leccion1",
    "build:leccion2": "node build.js leccion2",
    "help": "node build.js help"
  },
  "dependencies": {
    "fs-extra": "^11.2.0",
    "archiver": "^6.0.1"
  }
}
```

### 2. Copiar Archivos Base
Desde este proyecto, copiar:
- `build.js` (script principal)
- `wrappers/` (carpeta completa)
- Estructura de `plugins/` (adaptada a tu proyecto)

## 🆕 Creación de Nueva Lección

### Paso 1: Crear Estructura de Lección
```
module/leccion_nueva/
├── index.html              # Página principal de la lección
├── lms.js                  # Biblioteca SCORM (opcional)
├── scorm-integration.js    # Integración SCORM personalizada
├── momentoX_Y/             # Momentos/slides de la lección
│   ├── index.html
│   ├── slider.css
│   └── slider.js
└── assets/                 # Recursos específicos (opcional)
    ├── audio/
    └── img/
```

### Paso 2: index.html Base de Lección
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Nueva Lección</title>
    
    <!-- Recursos globales -->
    <script src="../../plugins/libs/jquery-3.3.1.js"></script>
    <link rel="stylesheet" href="../../plugins/libs/bootstrap/css/bootstrap.css">
    <link rel="stylesheet" href="../../plugins/css/style.css">
    
    <!-- Integración SCORM (opcional) -->
    <script src="scorm-integration.js"></script>
</head>
<body>
    <!-- Contenido de la lección -->
    <div class="lesson-container">
        <h1>Mi Nueva Lección</h1>
        <!-- Tu contenido aquí -->
    </div>
    
    <script>
        // Inicialización específica de la lección
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Lección cargada');
            
            // Si tienes integración SCORM
            if (window.SCORMLeccion && typeof window.SCORMLeccion.initSCORM === 'function') {
                window.SCORMLeccion.initSCORM();
            }
        });
    </script>
</body>
</html>
```

### Paso 3: Configurar Integración SCORM (Opcional)
Si quieres comunicación con el LMS, crea `scorm-integration.js` basado en el ejemplo de la lección 2.

## ⚙️ Configuración de Build

### Paso 1: Actualizar LESSONS_INFO en build.js
```javascript
const LESSONS_INFO = {
    'leccion1': {
        title: 'Lección 1: Mi Primer Tema',
        description: 'Descripción de la primera lección'
    },
    'leccion_nueva': {
        title: 'Lección Nueva: Mi Nuevo Tema',
        description: 'Descripción de mi nueva lección'
    },
    'inicio': {
        title: 'Guía del Usuario - Mi Curso',
        description: 'Página de inicio con guía del usuario'
    }
    // ... más lecciones
};
```

### Paso 2: Agregar Script NPM (Opcional)
En `package.json`, agregar:
```json
"scripts": {
    "build:leccion_nueva": "node build.js leccion_nueva",
    "build:inicio": "node build.js inicio"
}
```

### Paso 3: Instalar Dependencias
```bash
npm install
```

## 🔗 Integración SCORM

### Niveles de Integración

#### Nivel 1: Sin Comunicación LMS
- Solo empaquetado básico
- No requiere código adicional
- Funciona como contenido estático

#### Nivel 2: Comunicación Básica
- Inicialización y finalización
- Reporte de progreso simple
- Estado completado/incompleto

#### Nivel 3: Comunicación Avanzada
- Tracking detallado de interacciones
- Puntuaciones específicas
- Suspensión y reanudación
- Tiempo de sesión

### Archivo lms.js

#### Si ya tienes lms.js (iSpring/Articulate)
```javascript
// En tu lección, solo necesitas:
// El lms.js ya maneja la comunicación SCORM
```

#### Si necesitas crear tu propio lms.js
```javascript
// Usar como base el scorm-integration.js de la lección 2
// Adaptar funciones según tus necesidades específicas
```

### Consideraciones Importantes sobre lms.js

1. **No modificar lms.js de iSpring**: Son archivos compilados y optimizados
2. **Uso de scorm-integration.js**: Para funcionalidad personalizada adicional
3. **Compatibilidad**: El wrapper SCORM es compatible con ambos enfoques
4. **Precedencia**: El lms.js tiene precedencia sobre scripts personalizados

## ✅ Buenas Prácticas

### Estructura de Archivos
- **Mantén recursos globales en `/assets` y `/plugins`**
- **Una lección = un directorio en `/module`**
- **Usa nombres descriptivos para lecciones**: `leccion1`, `evaluacion_final`, etc.
- **Estructura consistente** entre lecciones

### Nomenclatura
```
module/
├── leccion1/              ✅ Bueno
├── leccion_evaluacion/    ✅ Bueno  
├── L1/                    ❌ Evitar
└── tema-uno/              ❌ Evitar (guiones en build.js)
```

### Rutas y Referencias
- **Usa rutas relativas**: `../../assets/img/logo.png`
- **Evita rutas absolutas**: `/assets/img/logo.png`
- **Mantén consistencia** en todas las lecciones

### Recursos Compartidos
```javascript
// ✅ Bueno - Recursos en ubicación estándar
src="../../plugins/libs/jquery-3.3.1.js"
href="../../plugins/css/style.css"

// ❌ Evitar - Recursos duplicados por lección
src="assets/jquery.js"  // Cada lección tiene su copia
```

### Comunicación SCORM
- **Inicia SCORM al cargar la lección**
- **Reporta progreso de forma incremental**
- **Finaliza SCORM al completar/salir**
- **Maneja errores de comunicación**

## 🔧 Troubleshooting

### Error: "Lección no existe"
```bash
❌ Error: La lección 'nueva_leccion' no existe
```
**Solución:**
1. Verificar que existe `/module/nueva_leccion/index.html`
2. Comprobar ortografía del nombre
3. Agregar la lección a `LESSONS_INFO` en `build.js`

### Error: "No se puede crear ZIP"
```bash
❌ Error: ENOENT, open 'leccion1_scorm.zip'
```
**Solución:**
1. Cerrar archivos ZIP abiertos
2. Verificar permisos de escritura
3. Liberar espacio en disco

### Problemas en Moodle
**"Package not valid"**
- Verificar que `imsmanifest.xml` está en la raíz del ZIP
- Comprobar sintaxis XML del manifest
- Asegurar que las rutas en el manifest son correctas

**"Content not loading"**
- Verificar rutas relativas en HTML
- Comprobar que `index.html` de la lección existe
- Revisar console del navegador para errores JavaScript

### Comunicación SCORM no funciona
1. **Verificar API SCORM disponible**:
   ```javascript
   console.log('API disponible:', window.API ? 'Sí' : 'No');
   ```

2. **Comprobar inicialización**:
   ```javascript
   const result = window.API.LMSInitialize("");
   console.log('Inicialización:', result);
   ```

3. **Revisar errores**:
   ```javascript
   const error = window.API.LMSGetLastError();
   console.log('Último error:', error);
   ```

## 📞 Comandos de Desarrollo

### Empaquetado
```bash
# Lección específica
npm run build:leccion1

# Página de inicio (NUEVO)
npm run build:inicio

# Curso completo
npm run build:unificado

# Ver ayuda
npm run help
```

### Instalación en Nuevo Proyecto
```bash
# 1. Crear proyecto
mkdir mi-nuevo-curso
cd mi-nuevo-curso

# 2. Copiar archivos base
# (copiar manualmente build.js, wrappers/, package.json)

# 3. Instalar dependencias
npm install

# 4. Crear estructura básica
mkdir -p module/leccion1
mkdir -p module/inicio

# 5. Crear index.html en la raíz (para comando inicio)
# 6. Crear inicio.html en module/inicio/

# 7. Probar builds
npm run build:leccion1
npm run build:inicio
```

## 🎯 Checklist de Implementación

### ✅ Configuración Inicial
- [ ] Node.js instalado
- [ ] Estructura de directorios creada
- [ ] `package.json` configurado
- [ ] `build.js` copiado y adaptado
- [ ] `wrappers/` copiados

### ✅ Primera Lección
- [ ] Directorio `/module/leccion1/` creado
- [ ] `index.html` de lección implementado
- [ ] Recursos necesarios en `/assets/` y `/plugins/`
- [ ] Información agregada a `LESSONS_INFO`

### ✅ Pruebas
- [ ] `npm install` ejecutado exitosamente
- [ ] `npm run build:leccion1` genera ZIP
- [ ] ZIP se puede subir a Moodle sin errores
- [ ] Contenido se visualiza correctamente

### ✅ SCORM (Opcional)
- [ ] Comunicación LMS implementada
- [ ] Progreso se reporta correctamente
- [ ] Estado de completado funciona
- [ ] Errors de SCORM manejados

## 🔄 Mantenimiento

### Actualizaciones
- **Mantén actualizado Node.js** y dependencias npm
- **Versiona tu proyecto** usando Git
- **Documenta cambios** en estructura o funcionalidad
- **Prueba regularmente** en diferentes LMS

### Respaldos
- **Respalda siempre** antes de cambios importantes
- **Mantén copia** de ZIPs funcionales
- **Documenta configuraciones** específicas del proyecto

---

## 📖 Recursos Adicionales

- [Especificación SCORM 1.2](https://scorm.com/scorm-explained/technical-scorm/scorm-12/)
- [Documentación Moodle SCORM](https://docs.moodle.org/en/SCORM_package)
- [Validador SCORM](http://scorm.com/scorm-solved/scorm-testing/)

---

