// =====================================
// VARIABLES GLOBALES DEL SISTEMA
// =====================================

// Cantidad actual de estudiantes
let currentStudents = 0;

// Capacidad máxima del laboratorio
let maxCapacity = 20;

// Total histórico de entradas
let totalEntradas = 0;

// Total histórico de salidas
let totalSalidas = 0;


// =====================================
// ELEMENTOS DEL DOM
// =====================================

// Botones principales
const btnEnter =
    document.getElementById('btnEnter');

const btnExit =
    document.getElementById('btnExit');

const btnReset =
    document.getElementById('btnReset');


// Contenedor visual estudiantes
const studentsContainer =
    document.getElementById('studentsContainer');


// Contadores visuales
const countEntradas =
    document.getElementById('countEntradas');

const countSalidas =
    document.getElementById('countSalidas');


// Espacios disponibles
const freeSpaces =
    document.getElementById('freeSpaces');


// Barra de ocupación
const progressBar =
    document.getElementById('progressBar');

const occupancyPercent =
    document.getElementById('occupancyPercent');


// Indicadores estado
const statusText =
    document.getElementById('statusText');

const statusLed =
    document.getElementById('statusLed');


// Input capacidad
const maxCapacityInput =
    document.getElementById('maxCapacity');


// =====================================
// ELEMENTOS MODAL
// =====================================

// Modal identificación
const identModal =
    document.getElementById('identModal');


// Input nombre estudiante
const studentNameInput =
    document.getElementById('studentNameInput');


// Botones modal
const modalConfirm =
    document.getElementById('modalConfirm');

const modalCancel =
    document.getElementById('modalCancel');


// =====================================
// MOSTRAR MODAL
// =====================================

/**
 * Abre el modal de identificación
 */
function showIdentifyModal() {

    identModal.classList.add('active');

    // Enfoca automáticamente el input
    studentNameInput.focus();
}


// =====================================
// CERRAR MODAL
// =====================================

/**
 * Cierra el modal y limpia el input
 */
function closeIdentifyModal() {

    identModal.classList.remove('active');

    studentNameInput.value = '';
}


// =====================================
// GENERAR COLOR ALEATORIO
// =====================================

/**
 * Genera colores aleatorios para
 * diferenciar visualmente estudiantes
 */
function generateRandomColor() {

    const colors = [

        '#6366f1',
        '#8b5cf6',
        '#06b6d4',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#ec4899'

    ];

    return colors[
        Math.floor(
            Math.random() * colors.length
        )
    ];
}


// =====================================
// AGREGAR ESTUDIANTE
// =====================================

/**
 * Agrega estudiante al laboratorio
 */
function addStudentByName(name) {

    // Verificar capacidad máxima
    if (currentStudents >= maxCapacity) {

        alert('El laboratorio está lleno');

        return;
    }

    // Incrementar contadores
    currentStudents++;

    totalEntradas++;

    // Crear elemento estudiante
    const studentEl =
        document.createElement('div');

    // Clase CSS estudiante
    studentEl.className = 'student';

    // ID único estudiante
    studentEl.id =
        `student-${Date.now()}`;

    // Obtener iniciales
    const initials = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    // Generar color avatar
    const randomColor =
        generateRandomColor();

    // Estructura visual estudiante
    studentEl.innerHTML = `

        <div
            class="student-avatar"
            style="background:${randomColor}"
        >
            ${initials}
        </div>

        <div class="student-name">
            ${name.substring(0, 14)}
        </div>

    `;

    // Posición aleatoria en laboratorio
    studentEl.style.position =
        'absolute';

    studentEl.style.left =
        Math.random() * 75 + '%';

    studentEl.style.top =
        Math.random() * 70 + '%';

    // Insertar estudiante
    studentsContainer.appendChild(
        studentEl
    );

    // Activar efecto visual
    flashGate();

    // Actualizar interfaz
    updateUI();

    // Registrar evento
    logEvent(
        `${name} ingresó al laboratorio`
    );
}


// =====================================
// ELIMINAR ESTUDIANTE
// =====================================

/**
 * Elimina el último estudiante
 * agregado al laboratorio
 */
function removeStudent() {

    // Obtener todos los estudiantes
    const students =
        document.querySelectorAll(
            '.student'
        );

    // Validar existencia
    if (students.length === 0) {

        return;
    }

    // Eliminar último estudiante
    students[
        students.length - 1
    ].remove();

    // Actualizar contadores
    currentStudents--;

    totalSalidas++;

    // Activar efecto visual
    flashGate();

    // Actualizar interfaz
    updateUI();

    // Registrar evento
    logEvent(
        'Un estudiante salió del laboratorio'
    );
}


// =====================================
// ACTUALIZAR INTERFAZ
// =====================================

/**
 * Actualiza todos los elementos
 * visuales del sistema
 */
function updateUI() {

    // Actualizar contadores
    countEntradas.textContent =
        totalEntradas;

    countSalidas.textContent =
        totalSalidas;

    // Calcular espacios libres
    const libres =
        maxCapacity - currentStudents;

    freeSpaces.textContent =
        libres;

    // Calcular ocupación
    const percent = Math.round(

        (
            currentStudents /
            maxCapacity
        ) * 100

    );

    // Actualizar barra progreso
    progressBar.style.width =
        `${percent}%`;

    // Actualizar porcentaje
    occupancyPercent.textContent =
        `${percent}%`;

    // Desactivar salida si vacío
    btnExit.disabled =
        currentStudents <= 0;

    // Desactivar entrada si lleno
    btnEnter.disabled =
        currentStudents >= maxCapacity;

    // =================================
    // ACTUALIZAR ESTADO VISUAL
    // =================================

    // Laboratorio vacío
    if (currentStudents === 0) {

        statusText.textContent =
            'Vacío';

        statusLed.style.background =
            '#64748b';

    }

    // Laboratorio lleno
    else if (
        currentStudents >= maxCapacity
    ) {

        statusText.textContent =
            'Lleno';

        statusLed.style.background =
            '#ef4444';

    }

    // Laboratorio activo
    else {

        statusText.textContent =
            'Activo';

        statusLed.style.background =
            '#10b981';
    }
}


// =====================================
// REGISTRO DE EVENTOS
// =====================================

/**
 * Muestra logs del sistema
 * en consola
 */
function logEvent(message) {

    console.log(

        `[LOG ${new Date()
            .toLocaleTimeString()}]
            ${message}`

    );
}


// =====================================
// EFECTO VISUAL LABORATORIO
// =====================================

/**
 * Genera efecto visual al
 * entrar o salir estudiante
 */
function flashGate() {

    // Obtener laboratorio
    const labView =
        document.getElementById(
            'labView'
        );

    // Activar brillo temporal
    labView.style.boxShadow =
        '0 0 25px rgba(99,102,241,0.8)';

    // Eliminar brillo después
    setTimeout(() => {

        labView.style.boxShadow =
            'none';

    }, 300);
}


// =====================================
// CAMBIO CAPACIDAD
// =====================================

/**
 * Detecta cambios en la
 * capacidad máxima
 */
maxCapacityInput.addEventListener(

    'change',

    () => {

        // Obtener valor input
        let val = parseInt(
            maxCapacityInput.value
        );

        // Limitar rango permitido
        val = Math.min(

            Math.max(val, 1),

            100

        );

        // Actualizar capacidad
        maxCapacity = val;

        // Actualizar input visual
        maxCapacityInput.value =
            val;

        // Actualizar interfaz
        updateUI();

        // Registrar cambio
        logEvent(

            `Capacidad modificada a ${val}`

        );
    }
);


// =====================================
// EVENTOS BOTONES
// =====================================


// BOTÓN ENTRADA
btnEnter.addEventListener(

    'click',

    () => {

        showIdentifyModal();

    }
);


// CONFIRMAR ENTRADA
modalConfirm.addEventListener(

    'click',

    () => {

        // Obtener nombre
        let name =
            studentNameInput
                .value
                .trim();

        // Nombre automático vacío
        if (!name) {

            name =
                `Anon-${Date.now()}`;
        }

        // Agregar estudiante
        addStudentByName(name);

        // Cerrar modal
        closeIdentifyModal();
    }
);


// CANCELAR MODAL
modalCancel.addEventListener(

    'click',

    () => {

        closeIdentifyModal();

    }
);


// BOTÓN SALIDA
btnExit.addEventListener(

    'click',

    () => {

        removeStudent();

    }
);


// BOTÓN REINICIO
btnReset.addEventListener(

    'click',

    () => {

        // Confirmar reinicio
        const confirmReset =
            confirm(
                '¿Desea reiniciar el sistema?'
            );

        // Cancelar si usuario niega
        if (!confirmReset) {

            return;
        }

        // Reiniciar variables
        currentStudents = 0;

        totalEntradas = 0;

        totalSalidas = 0;

        // Limpiar laboratorio
        studentsContainer.innerHTML =
            '';

        // Actualizar interfaz
        updateUI();

        // Registrar evento
        logEvent(
            'Sistema reiniciado'
        );
    }
);


// =====================================
// TECLA ENTER EN MODAL
// =====================================

/**
 * Permite confirmar entrada
 * presionando ENTER
 */
studentNameInput.addEventListener(

    'keydown',

    (e) => {

        if (e.key === 'Enter') {

            modalConfirm.click();
        }
    }
);


// =====================================
// INICIALIZACIÓN SISTEMA
// =====================================

// Actualizar interfaz inicial
updateUI();

// Registrar inicio sistema
logEvent(
    'Sistema iniciado correctamente'
);
