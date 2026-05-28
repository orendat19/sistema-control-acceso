// =========================================
// VARIABLES DE ESTADO
// =========================================

// Cantidad actual de estudiantes dentro del laboratorio
let currentStudents = 0;

// Capacidad máxima permitida
let maxCapacity = 20;

// Total acumulado de entradas
let totalEntradas = 0;

// Total acumulado de salidas
let totalSalidas = 0;



// =========================================
// ARRAY DE EMOJIS
// =========================================

// Emojis que se usarán para representar estudiantes
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



// =========================================
// ELEMENTOS DEL DOM
// =========================================

// Input de capacidad máxima
const maxCapacityInput = document.getElementById('maxCapacity');

// Botón entrada
const btnEnter = document.getElementById('btnEnter');

// Botón salida
const btnExit = document.getElementById('btnExit');

// Botón reinicio
const btnReset = document.getElementById('btnReset');

// Contenedor de estudiantes
const studentsContainer = document.getElementById('studentsContainer');



// Indicadores visuales
const statusIndicator = document.getElementById('statusIndicator');
const statusLed = document.getElementById('statusLed');
const statusText = document.getElementById('statusText');



// Barra de progreso
const progressBar = document.getElementById('progressBar');
const occupancyPercent = document.getElementById('occupancyPercent');



// Contadores
const countEntradas = document.getElementById('countEntradas');
const countSalidas = document.getElementById('countSalidas');
const freeSpacesText = document.getElementById('freeSpaces');



// Log de eventos
const eventLog = document.getElementById('eventLog');



// =========================================
// COMPUERTAS LÓGICAS
// =========================================

// Compuerta capacidad
const gateCapacity = document.getElementById('gateCapacity');

// Compuerta entrada
const gateEntry = document.getElementById('gateEntry');

// Compuerta actividad
const gateActivity = document.getElementById('gateActivity');

// Compuerta alerta
const gateAlert = document.getElementById('gateAlert');

// Compuerta vacío
const gateEmpty = document.getElementById('gateEmpty');

// Compuerta intermedia
const gateIntermediate = document.getElementById('gateIntermediate');

// Compuerta extrema
const gateExtreme = document.getElementById('gateExtreme');



// =========================================
// MODALES
// =========================================

// Callback pendiente para registrar entrada
let pendingEntryCallback = null;

// ID del estudiante seleccionado para salida
let selectedStudentIdForExit = null;



// Modal entrada
const identModal = document.getElementById('identModal');

// Modal salida
const exitModal = document.getElementById('exitModal');



// Input del estudiante
const studentNameInput = document.getElementById('studentNameInput');



// Lista de estudiantes
const studentsList = document.getElementById('studentsList');



// Botones del modal
const modalConfirm = document.getElementById('modalConfirm');
const modalCancel = document.getElementById('modalCancel');
const exitModalCancel = document.getElementById('exitModalCancel');



// =========================================
// MOSTRAR MODAL DE ENTRADA
// =========================================

function showIdentifyModal(callback) {

    // Verifica si existe el modal
    if (!identModal) {

        // Usa prompt como respaldo
        let name = prompt(
            'Ingrese nombre o ID del estudiante'
        );

        // Si cancela
        if (name === null) {
            name = `Anon-${Math.floor(Math.random()*9000)+1000}`;
        }

        // Si está vacío
        name = name.trim() || `Anon-${Math.floor(Math.random()*9000)+1000}`;

        // Ejecuta callback
        callback(name);

        return;
    }

    // Guarda callback
    pendingEntryCallback = callback;

    // Activa modal
    identModal.classList.add('active');

    // Deshabilita botón
    btnEnter.disabled = true;

    // Focus al input
    setTimeout(() => studentNameInput.focus(), 80);
}



// =========================================
// CERRAR MODAL
// =========================================

function closeIdentifyModal() {

    // Oculta modal
    identModal.classList.remove('active');

    // Limpia callback
    pendingEntryCallback = null;

    // Reactiva botón según capacidad
    btnEnter.disabled = currentStudents >= maxCapacity;
}



// =========================================
// CONFIRMAR ENTRADA
// =========================================

function onModalConfirm() {

    // Obtiene nombre
    let name = studentNameInput.value
        ? studentNameInput.value.trim()
        : '';

    // Si está vacío crea anónimo
    if (!name) {
        name = `Anon-${Math.floor(Math.random()*9000)+1000}`;
    }

    // Ejecuta callback
    if (pendingEntryCallback) {
        pendingEntryCallback(name);
    }

    // Cierra modal
    closeIdentifyModal();
}



// =========================================
// CANCELAR MODAL
// =========================================

function onModalCancel() {

    // Registra evento
    logEvent(
        'Ingreso cancelado por el operador',
        'reset'
    );

    // Cierra modal
    closeIdentifyModal();
}



// =========================================
// EVENTOS DEL MODAL
// =========================================

// Confirmar
if (modalConfirm) {
    modalConfirm.addEventListener(
        'click',
        onModalConfirm
    );
}



// Cancelar
if (modalCancel) {
    modalCancel.addEventListener(
        'click',
        onModalCancel
    );
}



// Eventos teclado
if (studentNameInput) {

    studentNameInput.addEventListener('keydown', (e) => {

        // Enter confirma
        if (e.key === 'Enter') {
            onModalConfirm();
        }

        // Escape cancela
        if (e.key === 'Escape') {
            onModalCancel();
        }

    });
}



// =========================================
// MOSTRAR MODAL DE SALIDA
// =========================================

function showExitModal() {

    // Si no existe modal
    if (!exitModal) {

        removeStudentLogic(false);

        return;
    }

    // Limpia selección
    selectedStudentIdForExit = null;

    // Genera lista
    populateStudentsList();

    // Activa modal
    exitModal.classList.add('active');

    // Deshabilita botón
    btnExit.disabled = true;
}



// =========================================
// CERRAR MODAL DE SALIDA
// =========================================

function closeExitModal() {

    // Oculta modal
    exitModal.classList.remove('active');

    // Limpia selección
    selectedStudentIdForExit = null;

    // Reactiva botón
    btnExit.disabled = currentStudents <= 0;
}



// =========================================
// GENERAR LISTA DE ESTUDIANTES
// =========================================

function populateStudentsList() {

    // Limpia lista
    studentsList.innerHTML = '';

    // Obtiene estudiantes visibles
    const students = studentsContainer.querySelectorAll(
        '.student:not(.leaving)'
    );

    // Si no hay estudiantes
    if (students.length === 0) {

        studentsList.innerHTML = `
            <div style="text-align:center; color:#94a3b8; padding:2rem;">
                No hay estudiantes en el laboratorio
            </div>
        `;

        return;
    }

    // Recorre estudiantes
    students.forEach((studentEl) => {

        // Nombre
        const name = studentEl.dataset.name || 'Estudiante';

        // ID
        const id = studentEl.id;

        // Avatar
        const avatarDiv = studentEl.querySelector('.student-avatar');

        // Iniciales
        const initials = avatarDiv?.textContent || '?';

        // Fondo
        const gradient =
            avatarDiv?.style.background ||
            'linear-gradient(135deg, #818cf8, #c084fc)';

        // Crea item
        const itemEl = document.createElement('div');

        itemEl.className = 'student-item';

        itemEl.dataset.studentId = id;

        // HTML interno
        itemEl.innerHTML = `
            <div class="student-item-avatar"
                 style="background: ${gradient};">
                 ${initials}
            </div>

            <div class="student-item-info">

                <div class="student-item-name">
                    ${name}
                </div>

                <div class="student-item-id">
                    ${id}
                </div>

            </div>

            <div class="student-item-checkbox">
                ✓
            </div>
        `;

        // Evento selección
        itemEl.addEventListener('click', () => {

            // Quita selección previa
            studentsList
                .querySelectorAll('.student-item')
                .forEach(s => s.classList.remove('selected'));

            // Marca actual
            itemEl.classList.add('selected');

            // Guarda ID
            selectedStudentIdForExit = id;
        });

        // Agrega item
        studentsList.appendChild(itemEl);
    });
}



// =========================================
// AGREGAR ESTUDIANTE
// =========================================

function addStudentByName(name) {

    // Verifica capacidad
    if (currentStudents >= maxCapacity) {

        logEvent(
            'Intento de ingreso bloqueado: laboratorio lleno',
            'full'
        );

        return;
    }

    // Incrementa contadores
    currentStudents++;
    totalEntradas++;

    // Obtiene iniciales
    const initials = name
        .split(' ')
        .map(word => word[0]?.toUpperCase() || '')
        .join('')
        .substring(0, 2) || '?';



    // Gradientes
    const gradients = [

        'linear-gradient(135deg, #818cf8, #c084fc)',
        'linear-gradient(135deg, #06b6d4, #3b82f6)',
        'linear-gradient(135deg, #10b981, #14b8a6)',
        'linear-gradient(135deg, #f59e0b, #ec4899)'

    ];



    // Selecciona gradiente
    const gradientIndex =
        (totalEntradas - 1) % gradients.length;

    const gradient = gradients[gradientIndex];



    // Crea tarjeta estudiante
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



    // ID
    const idDiv = document.createElement('div');

    idDiv.className = 'student-id';

    idDiv.textContent = `#${totalEntradas}`;



    // Agrega elementos
    studentEl.appendChild(avatarDiv);
    studentEl.appendChild(nameDiv);
    studentEl.appendChild(idDiv);

    // Inserta estudiante
    studentsContainer.appendChild(studentEl);



    // Log
    logEvent(
        `Estudiante "${name}" ingresó al laboratorio`,
        'in'
    );



    // Activa compuerta
    triggerGateAnimation('entry');



    // Actualiza interfaz
    updateUI();



    // Verifica lleno
    if (currentStudents === maxCapacity) {

        logEvent(
            '¡ALERTA: LABORATORIO LLENO!',
            'full'
        );

        triggerGateAnimation('full');
    }
}



// =========================================
// INICIALIZACIÓN
// =========================================

// Actualiza interfaz
updateUI();

// Log inicial
logEvent(
    'Sistema inicializado y listo',
    'reset'
);



// =========================================
// EVENTOS PRINCIPALES
// =========================================

// Cambio capacidad
maxCapacityInput.addEventListener('change', (e) => {

    // Obtiene valor
    let val = parseInt(e.target.value);

    // Validación
    if (val < 1 || isNaN(val)) {

        val = 1;

        e.target.value = 1;
    }

    // Actualiza capacidad
    maxCapacity = val;

    // Actualiza interfaz
    updateUI();

    // Log
    logEvent(
        `Capacidad máxima actualizada a ${maxCapacity}`,
        'reset'
    );
});



// Botón entrada
btnEnter.addEventListener('click', () => {

    // Verifica espacio
    if (currentStudents < maxCapacity) {

        // Limpia input
        studentNameInput.value = '';

        // Muestra modal
        showIdentifyModal(
            (name) => addStudentByName(name)
        );

    } else {

        // Log lleno
        logEvent(
            'Intento de ingreso bloqueado: laboratorio lleno',
            'full'
        );
    }
});



// Botón salida
btnExit.addEventListener('click', () => {

    // Verifica estudiantes
    if (currentStudents > 0) {

        showExitModal();
    }
});



// Botón reset
btnReset.addEventListener('click', () => {

    // Reinicia contadores
    currentStudents = 0;
    totalEntradas = 0;
    totalSalidas = 0;

    // Elimina estudiantes visualmente
    const allStudents =
        studentsContainer.querySelectorAll('.student');

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

    // Log
    logEvent(
        'Reinicio total del laboratorio',
        'reset'
    );

    // Actualiza UI
    setTimeout(
        updateUI,
        allStudents.length * 50 + 100
    );
});



// =========================================
// ACTUALIZAR INTERFAZ
// =========================================

function updateUI() {

    // Actualiza números
    countEntradas.textContent = totalEntradas;
    countSalidas.textContent = totalSalidas;

    // Espacios libres
    const free = maxCapacity - currentStudents;

    freeSpacesText.textContent = free;



    // Porcentaje ocupación
    const percent = Math.round(
        (currentStudents / maxCapacity) * 100
    );



    // Barra progreso
    progressBar.style.width = `${percent}%`;

    occupancyPercent.textContent = `${percent}%`;



    // Estados visuales
    statusLed.classList.remove('full');
    progressBar.classList.remove('full');
    statusIndicator.classList.remove('full-alert');



    // Laboratorio vacío
    if (currentStudents === 0) {

        statusText.textContent = 'Vacío';

        statusLed.style.background = '#64748b';

        occupancyPercent.style.color =
            'var(--text-muted)';
    }

    // Laboratorio lleno
    else if (currentStudents === maxCapacity) {

        statusText.textContent = 'SALÓN LLENO';

        statusLed.classList.add('full');

        progressBar.classList.add('full');

        statusIndicator.classList.add('full-alert');

        occupancyPercent.style.color =
            'var(--danger)';
    }

    // Casi lleno
    else if (percent >= 80) {

        statusText.textContent = 'Casi lleno';

        statusLed.style.background =
            'var(--warning)';

        occupancyPercent.style.color =
            'var(--warning)';
    }

    // Estado normal
    else {

        statusText.textContent = 'Con espacio';

        statusLed.style.background =
            'var(--success)';

        occupancyPercent.style.color =
            'var(--success)';
    }



    // Botones
    btnEnter.disabled =
        currentStudents >= maxCapacity;

    btnExit.disabled =
        currentStudents <= 0;



    // Actualiza compuertas
    updateStaticGates();
}



// =========================================
// ACTUALIZAR COMPUERTAS
// =========================================

function updateStaticGates() {

    // NOT
    toggleGateLed(
        gateCapacity,
        currentStudents < maxCapacity
    );

    // NOR
    toggleGateLed(
        gateEmpty,
        currentStudents === 0
    );

    // FULL
    toggleGateLed(
        gateAlert,
        currentStudents === maxCapacity
    );
}



// =========================================
// ACTIVAR LED DE COMPUERTA
// =========================================

function toggleGateLed(gateElement, isOn) {

    // Verifica existencia
    if (!gateElement) return;

    // Busca LED
    const led =
        gateElement.querySelector('.gate-dot.out') ||
        gateElement.querySelector('.gate-dot');

    // Activa clase
    gateElement.classList.toggle('active', !!isOn);

    // Si no existe LED
    if (!led) return;

    // Activa luz
    led.classList.toggle('on', !!isOn);
}



// =========================================
// ANIMACIÓN COMPUERTAS
// =========================================

function triggerGateAnimation(type) {

    // Siempre activa OR
    flashGate(gateActivity);

    // Entrada activa AND
    if (type === 'entry') {

        flashGate(gateEntry);
    }
}



// =========================================
// EFECTO FLASH
// =========================================

function flashGate(gateElement) {

    // Enciende
    toggleGateLed(gateElement, true);

    // Apaga después
    setTimeout(() => {

        toggleGateLed(gateElement, false);

        updateStaticGates();

    }, 400);
}



// =========================================
// REGISTRO DE EVENTOS
// =========================================

function logEvent(message, type) {

    // Fecha actual
    const now = new Date();

    // Hora formateada
    const timeStr = now.toLocaleTimeString(
        'es-ES',
        { hour12: false }
    );

    // Crea entrada
    const entry = document.createElement('div');

    entry.className = 'log-entry';



    // Clase de color
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



    // HTML interno
    entry.innerHTML = `
        <span class="log-time">
            [${timeStr}]
        </span>

        <span class="${colorClass}">
            ${message}
        </span>
    `;



    // Inserta arriba del log
    eventLog.insertBefore(
        entry,
        eventLog.firstChild
    );
}
