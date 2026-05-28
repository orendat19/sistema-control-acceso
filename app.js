// ======================================================
// SISTEMA DE CONTROL DE ACCESO - app.js
// Archivo JavaScript principal
// Aquí se controla toda la lógica y funcionamiento
// interactivo del laboratorio.
// ======================================================



// ======================================================
// VARIABLES DE ESTADO DEL SISTEMA
// ======================================================

// Cantidad actual de estudiantes dentro del laboratorio
let currentStudents = 0;

// Capacidad máxima permitida
let maxCapacity = 20;

// Contador total de entradas registradas
let totalEntradas = 0;

// Contador total de salidas registradas
let totalSalidas = 0;



// ======================================================
// LISTA DE EMOJIS PARA REPRESENTAR ESTUDIANTES
// ======================================================

const studentEmojis = [
    '👨‍🎓',
    '👩‍🎓',
    '👨‍💻',
    '👩‍💻',
    '🧑‍🎓',
    '🧑‍💻',
    '🕵️‍♂️',
    '🕵️‍♀️',
    '🦸‍♂️',
    '🦸‍♀️',
    '🥷',
    '🧑‍🔬'
];



// ======================================================
// REFERENCIAS A ELEMENTOS DEL DOM
// ======================================================

// Inputs y botones principales
const maxCapacityInput = document.getElementById('maxCapacity');
const btnEnter = document.getElementById('btnEnter');
const btnExit = document.getElementById('btnExit');
const btnReset = document.getElementById('btnReset');

// Contenedor visual de estudiantes
const studentsContainer = document.getElementById('studentsContainer');

// Indicadores de estado
const statusIndicator = document.getElementById('statusIndicator');
const statusLed = document.getElementById('statusLed');
const statusText = document.getElementById('statusText');

// Barra de ocupación
const progressBar = document.getElementById('progressBar');
const occupancyPercent = document.getElementById('occupancyPercent');

// Contadores
const countEntradas = document.getElementById('countEntradas');
const countSalidas = document.getElementById('countSalidas');
const freeSpacesText = document.getElementById('freeSpaces');

// Registro de eventos
const eventLog = document.getElementById('eventLog');



// ======================================================
// COMPUERTAS LÓGICAS
// ======================================================

const gateCapacity = document.getElementById('gateCapacity');
const gateEntry = document.getElementById('gateEntry');
const gateActivity = document.getElementById('gateActivity');
const gateAlert = document.getElementById('gateAlert');
const gateEmpty = document.getElementById('gateEmpty');
const gateIntermediate = document.getElementById('gateIntermediate');
const gateExtreme = document.getElementById('gateExtreme');



// ======================================================
// ELEMENTOS DE LOS MODALES
// ======================================================

let pendingEntryCallback = null;
let selectedStudentIdForExit = null;

// Modal de entrada
const identModal = document.getElementById('identModal');

// Modal de salida
const exitModal = document.getElementById('exitModal');

// Input del nombre
const studentNameInput = document.getElementById('studentNameInput');

// Lista de estudiantes
const studentsList = document.getElementById('studentsList');

// Botones del modal
const modalConfirm = document.getElementById('modalConfirm');
const modalCancel = document.getElementById('modalCancel');
const exitModalCancel = document.getElementById('exitModalCancel');



// ======================================================
// MOSTRAR MODAL DE IDENTIFICACIÓN
// ======================================================

function showIdentifyModal(callback) {

    // Si no existe el modal, usar prompt clásico
    if (!identModal) {

        let name = prompt(
            'Ingrese nombre o ID del estudiante'
        );

        // Si cancela, generar nombre anónimo
        if (name === null) {
            name = `Anon-${Math.floor(Math.random() * 9000) + 1000}`;
        }

        // Si está vacío, generar nombre automático
        name = name.trim() || `Anon-${Math.floor(Math.random() * 9000) + 1000}`;

        callback(name);

        return;
    }

    // Guardar función callback
    pendingEntryCallback = callback;

    // Mostrar modal
    identModal.classList.add('active');

    // Desactivar botón entrada
    btnEnter.disabled = true;

    // Dar foco al input
    setTimeout(() => {
        studentNameInput.focus();
    }, 80);
}



// ======================================================
// CERRAR MODAL DE IDENTIFICACIÓN
// ======================================================

function closeIdentifyModal() {

    identModal.classList.remove('active');

    pendingEntryCallback = null;

    btnEnter.disabled = currentStudents >= maxCapacity;
}



// ======================================================
// CONFIRMAR ENTRADA
// ======================================================

function onModalConfirm() {

    let name = studentNameInput.value.trim();

    // Si no escribe nada
    if (!name) {
        name = `Anon-${Math.floor(Math.random() * 9000) + 1000}`;
    }

    // Ejecutar callback
    if (pendingEntryCallback) {
        pendingEntryCallback(name);
    }

    closeIdentifyModal();
}



// ======================================================
// CANCELAR ENTRADA
// ======================================================

function onModalCancel() {

    logEvent('Ingreso cancelado por el operador', 'reset');

    closeIdentifyModal();
}



// ======================================================
// EVENTOS DEL MODAL
// ======================================================

modalConfirm.addEventListener('click', onModalConfirm);

modalCancel.addEventListener('click', onModalCancel);

// Detectar teclas
studentNameInput.addEventListener('keydown', (e) => {

    if (e.key === 'Enter') {
        onModalConfirm();
    }

    if (e.key === 'Escape') {
        onModalCancel();
    }
});



// ======================================================
// MOSTRAR MODAL DE SALIDA
// ======================================================

function showExitModal() {

    selectedStudentIdForExit = null;

    populateStudentsList();

    exitModal.classList.add('active');

    btnExit.disabled = true;
}



// ======================================================
// CERRAR MODAL DE SALIDA
// ======================================================

function closeExitModal() {

    exitModal.classList.remove('active');

    selectedStudentIdForExit = null;

    btnExit.disabled = currentStudents <= 0;
}



// ======================================================
// LLENAR LISTA DE ESTUDIANTES
// ======================================================

function populateStudentsList() {

    studentsList.innerHTML = '';

    // Obtener estudiantes activos
    const students = studentsContainer.querySelectorAll('.student:not(.leaving)');

    // Si no hay estudiantes
    if (students.length === 0) {

        studentsList.innerHTML = `
            <div style="text-align:center; color:#94a3b8; padding:2rem;">
                No hay estudiantes en el laboratorio
            </div>
        `;

        return;
    }

    // Crear tarjeta para cada estudiante
    students.forEach((studentEl) => {

        const name = studentEl.dataset.name || 'Estudiante';
        const id = studentEl.id;

        const avatarDiv = studentEl.querySelector('.student-avatar');

        const initials = avatarDiv?.textContent || '?';

        const gradient = avatarDiv?.style.background ||
            'linear-gradient(135deg, #818cf8, #c084fc)';

        // Crear tarjeta visual
        const itemEl = document.createElement('div');

        itemEl.className = 'student-item';

        itemEl.dataset.studentId = id;

        itemEl.innerHTML = `
            <div class="student-item-avatar" style="background:${gradient};">
                ${initials}
            </div>

            <div class="student-item-info">
                <div class="student-item-name">${name}</div>
                <div class="student-item-id">${id}</div>
            </div>

            <div class="student-item-checkbox">✓</div>
        `;

        // Seleccionar estudiante
        itemEl.addEventListener('click', () => {

            studentsList
                .querySelectorAll('.student-item')
                .forEach(s => s.classList.remove('selected'));

            itemEl.classList.add('selected');

            selectedStudentIdForExit = id;
        });

        studentsList.appendChild(itemEl);
    });

    // Botón confirmar salida
    const confirmBtn = document.createElement('button');

    confirmBtn.className = 'modal-btn confirm';

    confirmBtn.style.marginTop = '1rem';

    confirmBtn.innerHTML = '<span>✓ Confirmar Salida</span>';

    confirmBtn.addEventListener('click', () => {

        if (selectedStudentIdForExit) {

            removeStudentById(selectedStudentIdForExit);

            closeExitModal();
        }
    });

    studentsList.appendChild(confirmBtn);
}



// ======================================================
// ELIMINAR ESTUDIANTE POR ID
// ======================================================

function removeStudentById(studentId) {

    const studentEl = document.getElementById(studentId);

    if (!studentEl) return;

    const name = studentEl.dataset.name || 'Estudiante';

    // Animación salida
    studentEl.classList.add('leaving');

    setTimeout(() => {

        if (studentsContainer.contains(studentEl)) {
            studentsContainer.removeChild(studentEl);
        }

    }, 600);

    // Actualizar contadores
    currentStudents = Math.max(0, currentStudents - 1);

    totalSalidas++;

    logEvent(`Estudiante "${name}" salió del laboratorio`, 'out');

    triggerGateAnimation('exit');

    updateUI();
}



// ======================================================
// BOTÓN CANCELAR SALIDA
// ======================================================

exitModalCancel.addEventListener('click', closeExitModal);



// ======================================================
// AGREGAR ESTUDIANTE
// ======================================================

function addStudentByName(name) {

    // Validar capacidad
    if (currentStudents >= maxCapacity) {

        logEvent(
            'Intento de ingreso bloqueado: laboratorio lleno',
            'full'
        );

        return;
    }

    // Incrementar contadores
    currentStudents++;
    totalEntradas++;

    // Obtener iniciales
    const initials = name
        .split(' ')
        .map(word => word[0]?.toUpperCase() || '')
        .join('')
        .substring(0, 2) || '?';

    // Colores disponibles
    const gradients = [
        'linear-gradient(135deg, #818cf8, #c084fc)',
        'linear-gradient(135deg, #06b6d4, #3b82f6)',
        'linear-gradient(135deg, #10b981, #14b8a6)',
        'linear-gradient(135deg, #f59e0b, #ec4899)',
        'linear-gradient(135deg, #8b5cf6, #6366f1)',
        'linear-gradient(135deg, #ef4444, #f97316)',
        'linear-gradient(135deg, #14b8a6, #06b6d4)',
        'linear-gradient(135deg, #ec4899, #f43f5e)'
    ];

    const gradientIndex = (totalEntradas - 1) % gradients.length;

    const gradient = gradients[gradientIndex];

    // Crear tarjeta estudiante
    const studentEl = document.createElement('div');

    studentEl.className = 'student entering';

    studentEl.id = `student-${totalEntradas}`;

    studentEl.dataset.name = name;

    // Avatar
    const avatarDiv = document.createElement('div');

    avatarDiv.className = 'student-avatar';

    avatarDiv.textContent = initials;

    avatarDiv.style.background = gradient;

    // Nombre
    const nameDiv = document.createElement('div');

    nameDiv.className = 'student-name';

    nameDiv.textContent = name.substring(0, 14);

    nameDiv.title = name;

    // ID visual
    const idDiv = document.createElement('div');

    idDiv.className = 'student-id';

    idDiv.textContent = `#${totalEntradas}`;

    // Insertar elementos
    studentEl.appendChild(avatarDiv);
    studentEl.appendChild(nameDiv);
    studentEl.appendChild(idDiv);

    studentsContainer.appendChild(studentEl);

    // Registrar evento
    logEvent(`Estudiante "${name}" ingresó al laboratorio`, 'in');

    // Activar animación lógica
    triggerGateAnimation('entry');

    // Actualizar interfaz
    updateUI();

    // Verificar si quedó lleno
    if (currentStudents === maxCapacity) {

        logEvent('¡ALERTA: LABORATORIO LLENO!', 'full');

        triggerGateAnimation('full');
    }
}



// ======================================================
// INICIALIZACIÓN DEL SISTEMA
// ======================================================

updateUI();

logEvent('Sistema inicializado y listo', 'reset');



// ======================================================
// EVENTOS PRINCIPALES
// ======================================================

// Cambio de capacidad máxima
maxCapacityInput.addEventListener('change', (e) => {

    let val = parseInt(e.target.value);

    // Validar mínimo
    if (val < 1 || isNaN(val)) {

        val = 1;

        e.target.value = 1;
    }

    maxCapacity = val;

    // Si la nueva capacidad es menor
    if (currentStudents > maxCapacity) {

        const diff = currentStudents - maxCapacity;

        // Expulsar estudiantes sobrantes
        for (let i = 0; i < diff; i++) {

            setTimeout(() => {

                removeStudentLogic(true);

            }, i * 150);
        }

    } else {

        updateUI();
    }

    logEvent(`Capacidad máxima actualizada a ${maxCapacity}`, 'reset');
});



// ======================================================
// BOTÓN ENTRADA
// ======================================================

btnEnter.addEventListener('click', () => {

    if (currentStudents < maxCapacity) {

        studentNameInput.value = '';

        showIdentifyModal((name) => addStudentByName(name));

    } else {

        logEvent(
            'Intento de ingreso bloqueado: laboratorio lleno',
            'full'
        );
    }
});



// ======================================================
// BOTÓN SALIDA
// ======================================================

btnExit.addEventListener('click', () => {

    if (currentStudents > 0) {

        showExitModal();
    }
});



// ======================================================
// BOTÓN REINICIAR
// ======================================================

btnReset.addEventListener('click', () => {

    currentStudents = 0;
    totalEntradas = 0;
    totalSalidas = 0;

    // Obtener todos los estudiantes
    const allStudents = studentsContainer.querySelectorAll('.student');

    // Animar salida
    allStudents.forEach((student, index) => {

        setTimeout(() => {

            student.classList.add('leaving');

            setTimeout(() => {

                if (studentsContainer.contains(student)) {

                    studentsContainer.removeChild(student);
                }

            }, 400);

        }, index * 50);
    });

    logEvent('Reinicio total del laboratorio', 'reset');

    setTimeout(updateUI, allStudents.length * 50 + 100);
});



// ======================================================
// ELIMINAR ESTUDIANTE
// ======================================================

function removeStudentLogic(isSystemEviction = false) {

    const students =
        studentsContainer.querySelectorAll('.student:not(.leaving)');

    if (students.length === 0) return;

    const lastStudent = students[students.length - 1];

    const name =
        lastStudent.dataset.name ||
        lastStudent.textContent ||
        'Estudiante';

    // Animación salida
    lastStudent.classList.add('leaving');

    setTimeout(() => {

        if (studentsContainer.contains(lastStudent)) {

            studentsContainer.removeChild(lastStudent);
        }

    }, 600);

    // Actualizar contadores
    currentStudents = Math.max(0, currentStudents - 1);

    if (!isSystemEviction) {
        totalSalidas++;
    }

    // Registrar evento
    if (!isSystemEviction) {

        logEvent(`Estudiante "${name}" salió del laboratorio`, 'out');

    } else {

        logEvent(
            `Se liberó espacio: ${name} removido por ajuste de capacidad`,
            'reset'
        );
    }

    updateUI();
}



// ======================================================
// ACTUALIZAR INTERFAZ
// ======================================================

function updateUI() {

    // Actualizar contadores
    countEntradas.textContent = totalEntradas;

    countSalidas.textContent = totalSalidas;

    const free = maxCapacity - currentStudents;

    freeSpacesText.textContent = free;

    // Calcular porcentaje
    const percent = Math.round(
        (currentStudents / maxCapacity) * 100
    );

    // Barra progreso
    progressBar.style.width = `${percent}%`;

    occupancyPercent.textContent = `${percent}%`;

    // Reiniciar estados visuales
    statusLed.classList.remove('full');
    progressBar.classList.remove('full');
    statusIndicator.classList.remove('full-alert');

    // Estados del laboratorio
    if (currentStudents === 0) {

        statusText.textContent = 'Vacío';

        statusLed.style.background = '#64748b';

        statusLed.style.boxShadow = 'none';

        occupancyPercent.style.color = 'var(--text-muted)';

    } else if (currentStudents === maxCapacity) {

        statusText.textContent = 'SALÓN LLENO';

        statusLed.classList.add('full');

        progressBar.classList.add('full');

        statusIndicator.classList.add('full-alert');

        statusLed.style.background = 'var(--danger)';

        occupancyPercent.style.color = 'var(--danger)';

    } else if (percent >= 80) {

        statusText.textContent = 'Casi lleno';

        statusLed.style.background = 'var(--warning)';

        statusLed.style.boxShadow = '0 0 10px var(--warning)';

        occupancyPercent.style.color = 'var(--warning)';

    } else {

        statusText.textContent = 'Con espacio';

        statusLed.style.background = 'var(--success)';

        statusLed.style.boxShadow = '0 0 10px var(--success)';

        occupancyPercent.style.color = 'var(--success)';
    }

    // Activar/desactivar botones
    btnEnter.disabled = currentStudents >= maxCapacity;

    btnExit.disabled = currentStudents <= 0;

    // Actualizar compuertas
    updateStaticGates();
}



// ======================================================
// ACTUALIZAR COMPUERTAS LÓGICAS
// ======================================================

function updateStaticGates() {

    // NOT -> hay espacio disponible
    toggleGateLed(
        gateCapacity,
        currentStudents < maxCapacity
    );

    // NOR -> laboratorio vacío
    toggleGateLed(
        gateEmpty,
        currentStudents === 0
    );

    // FULL -> laboratorio lleno
    toggleGateLed(
        gateAlert,
        currentStudents === maxCapacity
    );
}



// ======================================================
// ENCENDER/APAGAR COMPUERTAS
// ======================================================

function toggleGateLed(gateElement, isOn) {

    if (!gateElement) return;

    const led =
        gateElement.querySelector('.gate-dot.out') ||
        gateElement.querySelector('.gate-dot') ||
        gateElement.querySelector('.legend-dot');

    gateElement.classList.toggle('active', !!isOn);

    if (!led) return;

    led.classList.toggle('on', !!isOn);
}



// ======================================================
// ACTIVAR ANIMACIÓN DE COMPUERTAS
// ======================================================

function triggerGateAnimation(type) {

    // OR actividad siempre se activa
    flashGate(gateActivity);

    // AND entrada
    if (type === 'entry') {
        flashGate(gateEntry);
    }
}



// ======================================================
// EFECTO TEMPORAL EN COMPUERTA
// ======================================================

function flashGate(gateElement) {

    toggleGateLed(gateElement, true);

    setTimeout(() => {

        toggleGateLed(gateElement, false);

        updateStaticGates();

    }, 400);
}



// ======================================================
// REGISTRO DE EVENTOS
// ======================================================

function logEvent(message, type) {

    const now = new Date();

    const timeStr = now.toLocaleTimeString(
        'es-ES',
        { hour12: false }
    );

    // Crear entrada
    const entry = document.createElement('div');

    entry.className = 'log-entry';

    // Color según tipo
    let colorClass = '';

    if (type === 'in') {
        colorClass = 'log-action-in';
    }
    else if (type === 'out') {
        colorClass = 'log-action-out';
    }
    else if (type === 'full') {
        colorClass = 'log-action-full';
    }
    else if (type === 'reset') {
        colorClass = 'log-action-reset';
    }

    // Contenido del log
    entry.innerHTML = `
        <span class="log-time">[${timeStr}]</span>
        <span class="${colorClass}">
            ${message}
        </span>
    `;

    // Insertar arriba
    eventLog.insertBefore(entry, eventLog.firstChild);
}
