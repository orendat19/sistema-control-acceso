 // State Management
        let currentStudents = 0;
        let maxCapacity = 20;
        let totalEntradas = 0;
        let totalSalidas = 0;

        // Rich Array of Emojis for diversity
        const studentEmojis = ['👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻', '🧑‍🎓', '🧑‍💻', '🕵️‍♂️', '🕵️‍♀️', '🦸‍♂️', '🦸‍♀️', '🥷', '🧑‍🔬'];

        // DOM Elements
        const maxCapacityInput = document.getElementById('maxCapacity');
        const btnEnter = document.getElementById('btnEnter');
        const btnExit = document.getElementById('btnExit');
        const btnReset = document.getElementById('btnReset');
        const studentsContainer = document.getElementById('studentsContainer');
        
        const statusIndicator = document.getElementById('statusIndicator');
        const statusLed = document.getElementById('statusLed');
        const statusText = document.getElementById('statusText');
        const progressBar = document.getElementById('progressBar');
        const occupancyPercent = document.getElementById('occupancyPercent');
        
        const countEntradas = document.getElementById('countEntradas');
        const countSalidas = document.getElementById('countSalidas');
        const freeSpacesText = document.getElementById('freeSpaces');
        
        const eventLog = document.getElementById('eventLog');

        // Logic Gates Elements
        const gateCapacity = document.getElementById('gateCapacity');
        const gateEntry = document.getElementById('gateEntry');
        const gateActivity = document.getElementById('gateActivity');
        const gateAlert = document.getElementById('gateAlert');
        const gateEmpty = document.getElementById('gateEmpty');
        const gateIntermediate = document.getElementById('gateIntermediate');
        const gateExtreme = document.getElementById('gateExtreme');

        // Identification modal elements and logic (modal replaces prompt)
        let pendingEntryCallback = null;
        let selectedStudentIdForExit = null;
        const identModal = document.getElementById('identModal');
        const exitModal = document.getElementById('exitModal');
        const studentNameInput = document.getElementById('studentNameInput');
        const studentsList = document.getElementById('studentsList');
        const modalConfirm = document.getElementById('modalConfirm');
        const modalCancel = document.getElementById('modalCancel');
        const exitModalCancel = document.getElementById('exitModalCancel');

        function showIdentifyModal(callback) {
            if (!identModal) {
                // Fallback to prompt if modal not available
                let name = prompt('Ingrese nombre o ID del estudiante (dejar vacío para un identificador anónimo)');
                if (name === null) name = `Anon-${Math.floor(Math.random()*9000)+1000}`;
                name = name.trim() || `Anon-${Math.floor(Math.random()*9000)+1000}`;
                callback(name);
                return;
            }
            pendingEntryCallback = callback;
            identModal.classList.add('active');
            btnEnter.disabled = true;
            setTimeout(() => studentNameInput.focus(), 80);
        }

        function closeIdentifyModal() {
            if (identModal) identModal.classList.remove('active');
            pendingEntryCallback = null;
            btnEnter.disabled = currentStudents >= maxCapacity;
        }

        function onModalConfirm() {
            let name = (studentNameInput && studentNameInput.value) ? studentNameInput.value.trim() : '';
            if (!name) name = `Anon-${Math.floor(Math.random()*9000)+1000}`;
            if (pendingEntryCallback) pendingEntryCallback(name);
            closeIdentifyModal();
        }

        function onModalCancel() {
            logEvent('Ingreso cancelado por el operador', 'reset');
            closeIdentifyModal();
        }

        if (modalConfirm) modalConfirm.addEventListener('click', onModalConfirm);
        if (modalCancel) modalCancel.addEventListener('click', onModalCancel);
        if (studentNameInput) {
            studentNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') onModalConfirm();
                if (e.key === 'Escape') onModalCancel();
            });
        }

        // Exit modal functions
        function showExitModal() {
            if (!exitModal) {
                removeStudentLogic(false);
                return;
            }
            selectedStudentIdForExit = null;
            populateStudentsList();
            exitModal.classList.add('active');
            btnExit.disabled = true;
        }

        function closeExitModal() {
            if (exitModal) exitModal.classList.remove('active');
            selectedStudentIdForExit = null;
            btnExit.disabled = currentStudents <= 0;
        }

        function populateStudentsList() {
            if (!studentsList) return;
            studentsList.innerHTML = '';

            const students = studentsContainer.querySelectorAll('.student:not(.leaving)');
            if (students.length === 0) {
                studentsList.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:2rem;">No hay estudiantes en el laboratorio</div>';
                return;
            }

            students.forEach((studentEl) => {
                const name = studentEl.dataset.name || 'Estudiante';
                const id = studentEl.id;
                const avatarDiv = studentEl.querySelector('.student-avatar');
                const initials = avatarDiv?.textContent || '?';
                const gradient = avatarDiv?.style.background || 'linear-gradient(135deg, #818cf8, #c084fc)';

                const itemEl = document.createElement('div');
                itemEl.className = 'student-item';
                itemEl.dataset.studentId = id;
                itemEl.innerHTML = `
                    <div class="student-item-avatar" style="background: ${gradient};">${initials}</div>
                    <div class="student-item-info">
                        <div class="student-item-name">${name}</div>
                        <div class="student-item-id">${id}</div>
                    </div>
                    <div class="student-item-checkbox">✓</div>
                `;

                itemEl.addEventListener('click', () => {
                    // Remove previous selection
                    studentsList.querySelectorAll('.student-item').forEach(s => s.classList.remove('selected'));
                    // Select this one
                    itemEl.classList.add('selected');
                    selectedStudentIdForExit = id;
                });

                studentsList.appendChild(itemEl);
            });

            // Add confirm button at the end
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

        function removeStudentById(studentId) {
            const studentEl = document.getElementById(studentId);
            if (!studentEl) return;

            const name = studentEl.dataset.name || 'Estudiante';

            studentEl.classList.add('leaving');
            setTimeout(() => {
                if (studentsContainer.contains(studentEl)) {
                    studentsContainer.removeChild(studentEl);
                }
            }, 600);

            currentStudents = Math.max(0, currentStudents - 1);
            totalSalidas++;

            logEvent(`Estudiante "${name}" salió del laboratorio`, 'out');
            triggerGateAnimation('exit');
            updateUI();
        }

        if (exitModalCancel) exitModalCancel.addEventListener('click', closeExitModal);

        // Helper to add a student from modal
        function addStudentByName(name) {
            if (currentStudents >= maxCapacity) {
                logEvent('Intento de ingreso bloqueado: laboratorio lleno', 'full');
                return;
            }
            currentStudents++;
            totalEntradas++;

            // Generate avatar initials from name
            const initials = name
                .split(' ')
                .map(word => word[0]?.toUpperCase() || '')
                .join('')
                .substring(0, 2) || '?';

            // Array of gradient colors for student avatars
            const gradients = [
                'linear-gradient(135deg, #818cf8, #c084fc)',
                'linear-gradient(135deg, #06b6d4, #3b82f6)',
                'linear-gradient(135deg, #10b981, #14b8a6)',
                'linear-gradient(135deg, #f59e0b, #ec4899)',
                'linear-gradient(135deg, #8b5cf6, #6366f1)',
                'linear-gradient(135deg, #ef4444, #f97316)',
                'linear-gradient(135deg, #14b8a6, #06b6d4)',
                'linear-gradient(135deg, #ec4899, #f43f5e)',
            ];
            const gradientIndex = (totalEntradas - 1) % gradients.length;
            const gradient = gradients[gradientIndex];

            const studentEl = document.createElement('div');
            studentEl.className = 'student entering';
            studentEl.id = `student-${totalEntradas}`;
            studentEl.dataset.name = name;

            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'student-avatar';
            avatarDiv.textContent = initials;
            avatarDiv.style.background = gradient;

            const nameDiv = document.createElement('div');
            nameDiv.className = 'student-name';
            nameDiv.textContent = name.substring(0, 14);
            nameDiv.title = name; // Tooltip completo

            const idDiv = document.createElement('div');
            idDiv.className = 'student-id';
            idDiv.textContent = `#${totalEntradas}`;

            studentEl.appendChild(avatarDiv);
            studentEl.appendChild(nameDiv);
            studentEl.appendChild(idDiv);
            studentsContainer.appendChild(studentEl);

            logEvent(`Estudiante "${name}" ingresó al laboratorio`, 'in');
            triggerGateAnimation('entry');
            updateUI();

            if (currentStudents === maxCapacity) {
                logEvent('¡ALERTA: LABORATORIO LLENO!', 'full');
                triggerGateAnimation('full');
            }
        }

        // Initialization
        updateUI();
        logEvent('Sistema inicializado y listo', 'reset');

        // Event Listeners
        maxCapacityInput.addEventListener('change', (e) => {
            let val = parseInt(e.target.value);
            if (val < 1 || isNaN(val)) { val = 1; e.target.value = 1; }
            maxCapacity = val;
            
            // If new capacity is lower than current students, evict excess
            if (currentStudents > maxCapacity) {
                const diff = currentStudents - maxCapacity;
                for(let i=0; i<diff; i++) {
                    setTimeout(() => removeStudentLogic(true), i * 150); // Staggered eviction
                }
            } else {
                updateUI();
            }
            logEvent(`Capacidad máxima actualizada a ${maxCapacity}`, 'reset');
        });

        btnEnter.addEventListener('click', () => {
            if (currentStudents < maxCapacity) {
                // Open modal to identify student
                studentNameInput.value = '';
                showIdentifyModal((name) => addStudentByName(name));
            } else {
                logEvent('Intento de ingreso bloqueado: laboratorio lleno', 'full');
            }
        });

        btnExit.addEventListener('click', () => {
            if (currentStudents > 0) {
                showExitModal();
            }
        });

        btnReset.addEventListener('click', () => {
            currentStudents = 0;
            totalEntradas = 0;
            totalSalidas = 0;
            
            // Animate removal of all students
            const allStudents = studentsContainer.querySelectorAll('.student');
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

        function removeStudentLogic(isSystemEviction = false) {
            // Find the last visible student
            const students = studentsContainer.querySelectorAll('.student:not(.leaving)');
            if (students.length === 0) return;

            const lastStudent = students[students.length - 1];
            const name = lastStudent.dataset.name || lastStudent.textContent || 'Estudiante';

            // Animate and remove
            lastStudent.classList.add('leaving');
            setTimeout(() => {
                if (studentsContainer.contains(lastStudent)) {
                    studentsContainer.removeChild(lastStudent);
                }
            }, 600);

            // Update counts
            currentStudents = Math.max(0, currentStudents - 1);
            if (!isSystemEviction) totalSalidas++;

            // Log with name when available
            if (!isSystemEviction) logEvent(`Estudiante "${name}" salió del laboratorio`, 'out');
            else logEvent(`Se liberó espacio: ${name} removido por ajuste de capacidad`, 'reset');

            updateUI();
        }

        function updateUI() {
            // Update Number Statistics
            countEntradas.textContent = totalEntradas;
            countSalidas.textContent = totalSalidas;
            const free = maxCapacity - currentStudents;
            freeSpacesText.textContent = free;

            // Update Progress Bar
            const percent = Math.round((currentStudents / maxCapacity) * 100);
            progressBar.style.width = `${percent}%`;
            occupancyPercent.textContent = `${percent}%`;

            // Reset Status Alerts
            statusLed.classList.remove('full');
            progressBar.classList.remove('full');
            statusIndicator.classList.remove('full-alert');
            
            // Conditional Styling based on occupancy
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

            // Update Buttons State
            btnEnter.disabled = currentStudents >= maxCapacity;
            btnExit.disabled = currentStudents <= 0;

            // Update Logic Gates Visuals
            updateStaticGates();
        }

        function updateStaticGates() {
            // Gate: Capacity Limit (NOT) -> Output 1 if there is space (NOT Full), 0 if full
            toggleGateLed(gateCapacity, currentStudents < maxCapacity);
            
            // Gate: Lab Empty (NOR) -> Output 1 ONLY if inputs are 0 (students == 0)
            toggleGateLed(gateEmpty, currentStudents === 0);
            
            // Gate: Alert Full (AND) -> Output 1 ONLY if students == maxCapacity
            toggleGateLed(gateAlert, currentStudents === maxCapacity);
        }

        function toggleGateLed(gateElement, isOn) {
            if (!gateElement) return;
            // Prefer the explicit output dot, fallback to any gate-dot
            const led = gateElement.querySelector('.gate-dot.out') || gateElement.querySelector('.gate-dot') || gateElement.querySelector('.legend-dot');
            // Toggle active state on gate container
            gateElement.classList.toggle('active', !!isOn);
            if (!led) return; // nothing to light
            led.classList.toggle('on', !!isOn);
        }

        function triggerGateAnimation(type) {
            // Always flash Activity OR gate on any action
            flashGate(gateActivity);

            if (type === 'entry') flashGate(gateEntry);
        }

        function flashGate(gateElement) {
            toggleGateLed(gateElement, true);
            setTimeout(() => {
                // Turn off, then re-evaluate static states so they don't break
                toggleGateLed(gateElement, false);
                updateStaticGates(); 
            }, 400);
        }

        function logEvent(message, type) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('es-ES', { hour12: false });
            
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            
            let colorClass = '';
            if(type === 'in') colorClass = 'log-action-in';
            else if(type === 'out') colorClass = 'log-action-out';
            else if(type === 'full') colorClass = 'log-action-full';
            else if(type === 'reset') colorClass = 'log-action-reset';

            entry.innerHTML = `<span class="log-time">[${timeStr}]</span> <span class="${colorClass}">${message}</span>`;
            
            eventLog.insertBefore(entry, eventLog.firstChild);
        }
