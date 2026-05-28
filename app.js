// =======================================
// VARIABLES GLOBALES DEL SISTEMA
// =======================================

// Número actual de estudiantes dentro del laboratorio
let currentStudents = 0;

// Capacidad máxima permitida
let maxCapacity = 20;

// Total de entradas registradas
let totalEntradas = 0;

// Total de salidas registradas
let totalSalidas = 0;


// =======================================
// ELEMENTOS DEL DOM
// =======================================

// Botones principales
const btnEnter = document.getElementById('btnEnter');
const btnExit = document.getElementById('btnExit');
const btnReset = document.getElementById('btnReset');

// Contenedor visual de estudiantes
const studentsContainer = document.getElementById('studentsContainer');

// Contadores
const countEntradas = document.getElementById('countEntradas');
const countSalidas = document.getElementById('countSalidas');

// Espacios libres
const freeSpaces = document.getElementById('freeSpaces');

// Barra de progreso
const progressBar = document.getElementById('progressBar');
const occupancyPercent = document.getElementById('occupancyPercent');

// Indicadores de estado
const statusText = document.getElementById('statusText');
const statusLed = document.getElementById('statusLed');

// Input capacidad máxima
const maxCapacityInput = document.getElementById('maxCapacity');


// =======================================
// MODAL DE IDENTIFICACIÓN
// =======================================

const identModal = document.getElementById('identModal');

const studentNameInput =
    document.getElementById('studentNameInput');

const modalConfirm =
    document.getElementById('modalConfirm');

const modalCancel =
    document.getElementById('modalCancel');


// =======================================
// MOSTRAR MODAL
// =======================================

/**
 * Muestra el modal para ingresar estudiante
 */
function showIdentifyModal() {

    identModal.classList.add('active');

    // Coloca el cursor automáticamente
    studentNameInput.focus();
}


// =======================================
// CERRAR MODAL
// =======================================

/**
 * Cierra el modal de identificación
 */
function closeIdentifyModal() {

    identModal.classList.remove('active');

    // Limpia el input
    studentNameInput.value = '';
}


// =======================================
// GENERAR COLOR ALEATORIO
// =======================================

/**
 * Genera un color aleatorio para estudiantes
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
        Math.floor(Math.random() * colors.length)
    ];
}


// =======================================
// CREAR ESTUDIANTE
// =======================================

/**
 * Agrega un estudiante al laboratorio
 */
function addStudentByName(name) {

    // Validar capacidad máxima
    if (currentStudents >= maxCapacity) {

        alert('El laboratorio está lleno');

        return;
    }

    // Aumentar contadores
    currentStudents++;
    totalEntradas++;

    // Crear elemento estudiante
    const studentEl = document.createElement('div');

    studentEl.className = 'student';

    // ID único
    studentEl.id = `student-${Date.now()}`;

    // Generar iniciales
    const initials = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    // Color aleatorio
    const randomColor = generateRandomColor();

    // Construcción visual
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

    // Posición aleatoria
    studentEl.style.position = 'absolute';

    studentEl.style.left =
        Math.random() * 75 + '%';

    studentEl.style.top =
        Math.random() * 70 + '%';

    // Insertar en laboratorio
    studentsContainer.appendChild(studentEl);

    // Animación entrada
    flashGate();

    // Actualizar interfaz
    updateUI();

    // Registrar evento
    logEvent(`${name} ingresó al laboratorio`);
}


// =======================================
// ELIMINAR ESTUDIANTE
// =======================================

/**
 * Elimina el último estudiante ingresado
 */
function removeStudent() {

    const students =
        document.querySelectorAll('.student');

    // Verificar existencia
    if (students.length === 0) return;

    // Eliminar último estudiante
    students[students.length - 1].remove();

    // Actualizar contadores
    currentStudents--;
    totalSalidas++;

    // Animación salida
    flashGate();

    // Actualizar interfaz
    updateUI();

    // Registrar evento
    logEvent(
        'Un estudiante salió del laboratorio'
    );
}


// =======================================
// ACTUALIZAR INTERFAZ
// =======================================

/**
 * Actualiza toda la interfaz visual
 */
function updateUI() {

    // Actualizar contadores
    countEntradas.textContent = totalEntradas;

    countSalidas.textContent = totalSalidas;

    // Calcular espacios libres
    const libres =
        maxCapacity - currentStudents;

    freeSpaces.textContent = libres;

    // Calcular porcentaje ocupación
    const percent = Math.round(
        (currentStudents / maxCapacity) * 100
    );

    // Actualizar barra progreso
    progressBar.style.width = `${percent}%`;

    // Actualizar porcentaje
    occupancyPercent.textContent =
        `${percent}%`;

    // Activar/desactivar botones
    btnExit.disabled = currentStudents <= 0;

    btnEnter.disabled =
        currentStudents >= maxCapacity;

    // Actualizar estado visual
    if (currentStudents === 0) {

        statusText.textContent = 'Vacío';

        statusLed.style.background = '#64748b';

    } else if (
        currentStudents >= maxCapacity
    ) {

        statusText.textContent = 'Lleno';

        statusLed.style.background = '#ef4444';

    } else {

        statusText.textContent = 'Activo';

        statusLed.style.background = '#10b981';
    }
}


// =======================================
// REGISTRO DE EVENTOS
// =======================================

/**
 * Registra eventos del sistema
 */
function logEvent(message) {

    console.log(
        `[LOG ${new Date().toLocaleTimeString()}] ${message}`
    );
}


// =======================================
// EFECTO VISUAL DE PUERTA
// =======================================

/**
 * Genera efecto visual al entrar/salir
 */
function flashGate() {

    const labView =
        document.getElementById('labView');

    labView.style.boxShadow =
        '0 0 25px rgba(99,102,241,0.8)';

    setTimeout(() => {

        labView.style.boxShadow = 'none';

    }, 300);
}


// =======================================
// CAMBIO DE CAPACIDAD
// =======================================

/**
 * Detecta cambios en la capacidad máxima
 */
maxCapacityInput.addEventListener(
    'change',
    () => {

        let val =
            parseInt(maxCapacityInput.value);

        // Limitar rango válido
        val = Math.min(
            Math.max(val, 1),
            100
        );

        maxCapacity = val;

        maxCapacityInput.value = val;

        updateUI();

        logEvent(
            `Capacidad modificada a ${val}`
        );
    }
);


// =======================================
// EVENTOS DE BOTONES
// =======================================

// BOTÓN ENTRADA
btnEnter.addEventListener('click', () => {

    showIdentifyModal();
});


// CONFIRMAR ENTRADA
modalConfirm.addEventListener('click', () => {

    let name =
        studentNameInput.value.trim();

    // Nombre automático
    if (!name) {

        name = `Anon-${Date.now()}`;
    }

    addStudentByName(name);

    closeIdentifyModal();
});


// CANCELAR ENTRADA
modalCancel.addEventListener('click', () => {

    closeIdentifyModal();
});


// BOTÓN SALIDA
btnExit.addEventListener('click', () => {

    removeStudent();
});


// BOTÓN RESET
btnReset.addEventListener('click', () => {

    // Confirmación
    const confirmReset = confirm(
        '¿Desea reiniciar el sistema?'
    );

    if (!confirmReset) return;

    // Reiniciar variables
    currentStudents = 0;

    totalEntradas = 0;

    totalSalidas = 0;

    // Limpiar laboratorio
    studentsContainer.innerHTML = '';

    // Actualizar interfaz
    updateUI();

    // Registrar reinicio
    logEvent('Sistema reiniciado');
});


// =======================================
// EVENTO TECLA ENTER
// =======================================

/**
 * Permite confirmar con ENTER
 */
studentNameInput.addEventListener(
    'keydown',
    (e) => {

        if (e.key === 'Enter') {

            modalConfirm.click();
        }
    }
);


// =======================================
// INICIALIZACIÓN DEL SISTEMA
// =======================================

// Ejecutar actualización inicial
updateUI();

// Mensaje inicial
logEvent('Sistema iniciado correctamente');
