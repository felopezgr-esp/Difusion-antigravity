document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let events = JSON.parse(localStorage.getItem('difusion_events')) || [];
    let currentDate = new Date();
    let currentSort = { key: 'start', order: 'asc' };

    // Common Elements
    const addEventModal = document.getElementById('addEventModal');
    const eventDetailsModal = document.getElementById('eventDetailsModal');
    const editEventModal = document.getElementById('editEventModal');
    const addEventBtn = document.getElementById('addEventBtn');
    const addEventForm = document.getElementById('addEventForm');
    const editEventForm = document.getElementById('editEventForm');
    const deleteEventBtn = document.getElementById('deleteEventBtn');
    const closeButtons = document.querySelectorAll('.close-modal');
    const alertsContainer = document.getElementById('alertsContainer');
    const alertsList = document.getElementById('alertsList');

    // Page Specific Elements Detection
    const calendarGrid = document.getElementById('calendarGrid');
    const tableBody = document.getElementById('eventsTableBody');
    const mapEl = document.getElementById('map');
    const searchInput = document.getElementById('searchInput');
    const monthFilter = document.getElementById('monthFilter');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    // Default Checklist Template
    const defaultChecklist = [
        { text: "Confirmar asistencia", completed: false },
        { text: "Reservar espacio", completed: false },
        { text: "Enviar material promocional", completed: false },
        { text: "Coordinar transporte", completed: false },
        { text: "Preparar stand", completed: false },
        { text: "Evaluación post-evento", completed: false }
    ];

    // --- Helper Functions ---
    const saveData = () => {
        localStorage.setItem('difusion_events', JSON.stringify(events));
        if (calendarGrid) renderCalendar();
        if (tableBody) renderTable();
        if (monthFilter) populateMonthSuggestions();
        renderAlerts();
    };


    const formatDate = (dateStr) => {
        if (!dateStr) return 'Por determinar';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getProvince = (municipality) => {
        const coruna = ['Abegondo', 'Ames', 'Aranga', 'Ares', 'Arteixo', 'Arzúa', 'A Baña', 'Bergondo', 'Betanzos', 'Boimorto', 'Boiro', 'Boqueixón', 'Brión', 'Cabana de Bergantiños', 'Cabanas', 'Camariñas', 'Cambre', 'A Capela', 'Carballo', 'Cariño', 'Carnota', 'Carral', 'Cedeira', 'Cee', 'Cerceda', 'Cerdido', 'Coirós', 'Corcubión', 'Coristanco', 'A Coruña', 'Culleredo', 'Curtis', 'Dodro', 'Dumbría', 'Fene', 'Ferrol', 'Fisterra', 'Frades', 'Irixoa', 'A Laracha', 'Laxe', 'Lousame', 'Malpica de Bergantiños', 'Mañón', 'Mazaricos', 'Melide', 'Mesía', 'Miño', 'Moeche', 'Monfero', 'Mugardos', 'Muros', 'Muxía', 'Narón', 'Neda', 'Negreira', 'Noia', 'Oleiros', 'Ordes', 'Oroso', 'Ortigueira', 'Outes', 'Oza-Cesuras', 'Paderne', 'Padrón', 'O Pino', 'A Pobra do Caramiñal', 'Ponteceso', 'Pontedeume', 'As Pontes de García Rodríguez', 'Porto do Son', 'Rianxo', 'Ribeira', 'Rois', 'Sada', 'San Sadurniño', 'Santa Comba', 'Santiago de Compostela', 'Santiso', 'Sobrado', 'As Somozas', 'Teo', 'Toques', 'Tordoia', 'Touro', 'Val do Dubra', 'Valdoviño', 'Vedra', 'Vilarmaior', 'Vilasantar', 'Vimianzo', 'Zas'];
        const lugo = ['Abadín', 'Alfoz', 'Antas de Ulla', 'Baleira', 'Baralla', 'Barreiros', 'Becerreá', 'Begonte', 'Bóveda', 'Burela', 'Carballedo', 'Castro de Rei', 'Castroverde', 'Cervantes', 'Cervo', 'Chantada', 'O Corgo', 'Cospeito', 'Folgoso do Courel', 'A Fonsagrada', 'Foz', 'Friol', 'Guitiriz', 'Guntín', 'O Incio', 'Láncara', 'Lourenzá', 'Lugo', 'Meira', 'Mondoñedo', 'Monforte de Lemos', 'Monterroso', 'Muras', 'Navia de Suarna', 'Negueira de Muñiz', 'As Nogais', 'Ourol', 'Outeiro de Rei', 'Palas de Rei', 'Pantón', 'Paradela', 'O Páramo', 'A Pastoriza', 'Pedrafita do Cebreiro', 'A Pobra do Brollón', 'Pol', 'A Pontenova', 'Portomarín', 'Quiroga', 'Rábade', 'Ribadeo', 'Ribas de Sil', 'Ribeira de Piquín', 'Riotorto', 'Samos', 'Sarria', 'O Saviñao', 'Sober', 'Taboada', 'Trabada', 'Triacastela', 'O Valadouro', 'O Vicedo', 'Vilalba', 'Viveiro', 'Xermade', 'Xove'];
        const ourense = ['Allariz', 'Amoeiro', 'A Arnoia', 'Avión', 'Baltar', 'Bande', 'Baños de Molgas', 'Barbadás', 'O Barco de Valdeorras', 'Beade', 'Beariz', 'Os Blancos', 'Boborás', 'A Bola', 'Calvos de Randín', 'Carballeda de Avia', 'Carballeda de Valdeorras', 'O Carballiño', 'Cartelle', 'Castrelo de Miño', 'Castrelo do Val', 'O Castro de Caldelas', 'Celanova', 'Cenlle', 'Chandrexa de Queixa', 'Coles', 'Cortegada', 'Cualedro', 'Entrimo', 'Esgos', 'Gomesende', 'A Gudiña', 'O Irixo', 'Larouco', 'Laza', 'Leiro', 'Lobeira', 'Lobios', 'Maceda', 'Manzaneda', 'Mascide', 'Melón', 'A Merca', 'A Mezquita', 'Montederramo', 'Monterrei', 'Muíños', 'Nogueira de Ramuín', 'Oímbra', 'Ourense', 'Paderne de Allariz', 'Padrenda', 'Parada de Sil', 'O Pereiro de Aguiar', 'A Peroxa', 'Petín', 'Piñor', 'A Pobra de Trives', 'Pontedeva', 'Porqueira', 'Punxín', 'Quintela de Leirado', 'Rairiz de Veiga', 'Ramirás', 'Ribadavia', 'Riós', 'A Rúa', 'Rubiá', 'San Amaro', 'San Cibrao das Viñas', 'San Cristovo de Cea', 'San Xoán de Río', 'Sandiás', 'Sarreaus', 'Taboadela', 'A Teixeira', 'Toén', 'Trasmiras', 'A Veiga', 'Verea', 'Verín', 'Viana do Bolo', 'Vilamarín', 'Vilamartín de Valdeorras', 'Vilar de Barrio', 'Vilar de Santos', 'Vilardevós', 'Vilariño de Conso', 'Xinzo de Limia', 'Xunqueira de Ambía', 'Xunqueira de Espadanedo'];
        const pontevedra = ['Agolada', 'Arbo', 'Baiona', 'Bueu', 'Caldas de Reis', 'Cambados', 'Campo Lameiro', 'Cangas', 'A Cañiza', 'Catoira', 'Cerdedo-Cotobade', 'O Covelo', 'Crecente', 'Cuntis', 'Dozón', 'A Estrada', 'Forcarei', 'Fornelos de Montes', 'Gondomar', 'O Grove', 'A Guarda', 'A Illa de Arousa', 'Lalín', 'A Lama', 'Marín', 'Meaño', 'Meis', 'Moaña', 'Mondariz', 'Mondariz-Balneario', 'Moraña', 'Mos', 'As Neves', 'Nigrán', 'Oia', 'Pazos de Borbén', 'Poio', 'Ponte Caldelas', 'Ponteareas', 'Pontecesures', 'Pontevedra', 'O Porriño', 'Portas', 'Redondela', 'Ribadumia', 'Rodeiro', 'O Rosal', 'Salceda de Caselas', 'Salvaterra de Miño', 'Sanxenxo', 'Silleda', 'Soutomaior', 'Tomiño', 'Tui', 'Valga', 'Vigo', 'Vila de Cruces', 'Vilagarcía de Arousa', 'Vilanova de Arousa'];

        if (coruna.includes(municipality)) return 'A Coruña';
        if (lugo.includes(municipality)) return 'Lugo';
        if (ourense.includes(municipality)) return 'Ourense';
        if (pontevedra.includes(municipality)) return 'Pontevedra';
        return '';
    };

    // --- Modal Logic ---
    const openModal = (modal) => {
        if (!modal) return;
        modal.classList.add('active');
    };

    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('active');
    };

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(addEventModal);
            closeModal(eventDetailsModal);
            closeModal(editEventModal);
        });
    });

    window.onclick = (e) => {
        if (e.target === addEventModal) closeModal(addEventModal);
        if (e.target === eventDetailsModal) closeModal(eventDetailsModal);
        if (e.target === editEventModal) closeModal(editEventModal);
    };

    if (addEventBtn) addEventBtn.onclick = () => openModal(addEventModal);

    // --- Location Logic ---
    const locationSelect = document.getElementById('locationSelect');
    const editLocationSelect = document.getElementById('editLocationSelect');

    const populateLocationDropdown = (selectEl) => {
        if (!selectEl) return;
        if (typeof galiciaConcellos !== 'undefined') {
            selectEl.innerHTML = '<option value="">-- Selecciona un Concello --</option>';
            [...galiciaConcellos].sort((a, b) => a.name.localeCompare(b.name)).forEach(loc => {
                const opt = document.createElement('option');
                opt.value = loc.name;
                opt.textContent = loc.name;
                selectEl.appendChild(opt);
            });
        }
    };

    populateLocationDropdown(locationSelect);
    populateLocationDropdown(editLocationSelect);

    const setupLocationSync = (selectEl, latEl, lngEl, provinceEl) => {
        if (!selectEl) return;
        selectEl.addEventListener('change', () => {
            const selected = galiciaConcellos.find(loc => loc.name === selectEl.value);
            if (selected) {
                if (latEl) latEl.value = selected.lat;
                if (lngEl) lngEl.value = selected.lng;
                if (provinceEl) provinceEl.value = getProvince(selected.name);
            }
        });
    };

    setupLocationSync(locationSelect, document.getElementById('latInput'), document.getElementById('lngInput'), document.getElementById('provinceInput'));
    setupLocationSync(editLocationSelect, document.getElementById('editLatInput'), document.getElementById('editLngInput'), document.getElementById('editProvinceInput'));

    // --- Form Handlers ---
    if (addEventForm) {
        addEventForm.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(addEventForm);
            const newEvent = {
                id: Date.now(),
                title: formData.get('title'),
                start: formData.get('start') || null,
                end: formData.get('end') || formData.get('start') || null,
                schedule: formData.get('schedule'),
                municipality: formData.get('municipality'),
                location: formData.get('location'),
                province: formData.get('province') || getProvince(formData.get('municipality')),
                lat: parseFloat(formData.get('lat')) || null,
                lng: parseFloat(formData.get('lng')) || null,
                details: formData.get('details'),
                checklist: JSON.parse(JSON.stringify(defaultChecklist))
            };
            events.push(newEvent);
            saveData();
            closeModal(addEventModal);
            addEventForm.reset();
        };
    }

    if (editEventForm) {
        editEventForm.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(editEventForm);
            const id = parseInt(formData.get('id') || document.getElementById('editEventId').value);
            const index = events.findIndex(ev => ev.id === id);

            if (index !== -1) {
                events[index] = {
                    ...events[index],
                    title: formData.get('title') || document.getElementById('editTitle').value,
                    start: formData.get('start') || document.getElementById('editStart').value || null,
                    end: formData.get('end') || document.getElementById('editEnd').value || document.getElementById('editStart').value || null,
                    schedule: formData.get('schedule') || document.getElementById('editSchedule').value,
                    municipality: formData.get('municipality') || document.getElementById('editLocationSelect').value,
                    location: formData.get('location') || (document.getElementById('editLocationInput') ? document.getElementById('editLocationInput').value : ''),
                    province: formData.get('province') || (document.getElementById('editProvinceInput') ? document.getElementById('editProvinceInput').value : getProvince(formData.get('municipality'))),
                    lat: parseFloat(formData.get('lat') || document.getElementById('editLatInput').value) || null,
                    lng: parseFloat(formData.get('lng') || document.getElementById('editLngInput').value) || null,
                    details: formData.get('details') || document.getElementById('editDetails').value
                };
                saveData();
                closeModal(editEventModal);
            }
        };
    }

    const deleteEvent = (id) => {
        if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
            events = events.filter(ev => ev.id !== id);
            saveData();
            closeModal(editEventModal);
            closeModal(eventDetailsModal);
        }
    };

    if (deleteEventBtn) {
        deleteEventBtn.onclick = () => {
            const id = parseInt(document.getElementById('editEventId').value);
            deleteEvent(id);
        };
    }

    // --- Calendar Implementation ---
    const handleDragStart = (e, eventId) => {
        e.dataTransfer.setData('eventId', eventId);
        e.target.style.opacity = '0.5';
    };

    const renderCalendar = () => {
        if (!calendarGrid) return;
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const currentMonthYearEl = document.getElementById('currentMonthYear');
        if (currentMonthYearEl) {
            currentMonthYearEl.textContent = new Date(year, month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        }

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();

        for (let i = 0; i < startDay; i++) {
            const cell = document.createElement('div');
            cell.classList.add('day-cell', 'empty');
            calendarGrid.appendChild(cell);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const cell = document.createElement('div');
            cell.classList.add('day-cell');
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            // Highlight Today
            const today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                cell.classList.add('today');
            }

            const dayNumber = document.createElement('span');
            dayNumber.classList.add('day-number');
            dayNumber.textContent = i;
            cell.appendChild(dayNumber);

            const daysEvents = events.filter(e => e.start && e.end && dateStr >= e.start && dateStr <= e.end);

            // Logic for distinguishing shorter events in the same cell
            let maxDuration = 0;
            if (daysEvents.length > 1) {
                daysEvents.forEach(e => {
                    const dur = new Date(e.end) - new Date(e.start);
                    if (dur > maxDuration) maxDuration = dur;
                });
            }

            daysEvents.forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.classList.add('cal-event');

                // If it's shorter than the longest event in this cell, use variant color
                if (daysEvents.length > 1) {
                    const eventDur = new Date(event.end) - new Date(event.start);
                    if (eventDur < maxDuration) eventEl.classList.add('variant');
                }

                const comp = (event.checklist || []).filter(t => t.completed).length;
                const tot = (event.checklist || []).length;
                eventEl.textContent = `${event.title} ${tot > 0 ? `(${comp}/${tot})` : ''}`;
                eventEl.draggable = true;
                eventEl.ondragstart = (e) => handleDragStart(e, event.id);
                eventEl.onclick = (e) => { e.stopPropagation(); openEventDetails(event); };
                cell.appendChild(eventEl);
            });

            cell.ondragover = (e) => e.preventDefault();
            cell.ondrop = (e) => {
                e.preventDefault();
                const eventId = parseInt(e.dataTransfer.getData('eventId'));
                const event = events.find(ev => ev.id === eventId);
                if (event) {
                    const diff = event.end && event.start ? (new Date(event.end) - new Date(event.start)) : 0;
                    event.start = dateStr;
                    const newEnd = new Date(new Date(dateStr).getTime() + diff);
                    event.end = newEnd.toISOString().split('T')[0];
                    saveData();
                }
            };

            calendarGrid.appendChild(cell);
        }
        renderUndatedEvents();
    };

    const populateMonthSuggestions = () => {
        const suggestions = document.getElementById('monthSuggestions');
        if (!suggestions) return;
        suggestions.innerHTML = '';
        const months = new Set();
        events.forEach(e => {
            if (e.start) {
                const d = new Date(e.start);
                const name = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                months.add(name);
            }
        });
        months.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            suggestions.appendChild(opt);
        });
    };

    const renderUndatedEvents = () => {
        const undatedList = document.getElementById('undatedEventsList');
        if (!undatedList) return;
        undatedList.innerHTML = '';
        const undated = events.filter(e => !e.start);
        if (undated.length === 0) {
            undatedList.innerHTML = '<p style="color: #94a3b8; font-size: 0.85rem;">No hay eventos sin fecha.</p>';
            return;
        }
        undated.forEach(event => {
            const el = document.createElement('div');
            el.className = 'undated-event-item';
            el.innerHTML = `<div class="undated-event-info"><strong>${event.title}</strong><span>${event.municipality || 'Lugar por definir'}</span></div>`;
            el.onclick = () => openEventDetails(event);
            el.draggable = true;
            el.ondragstart = (e) => handleDragStart(e, event.id);
            undatedList.appendChild(el);
        });
    };

    // --- Table & Map Implementation ---
    let markersGroup;
    let map;
    const bluePinIcon = (typeof L !== 'undefined') ? L.divIcon({
        html: `<div style="background-color: #4f46e5; width: 14px; height: 14px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
        className: 'custom-pin', iconSize: [14, 14], iconAnchor: [7, 14], popupAnchor: [0, -14]
    }) : null;

    const renderTable = () => {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (markersGroup) markersGroup.clearLayers();

        const search = searchInput ? searchInput.value.toLowerCase() : '';
        const mFilter = monthFilter ? monthFilter.value.toLowerCase() : '';

        let filtered = events.filter(e => {
            const matchesText = e.title.toLowerCase().includes(search) ||
                (e.municipality || '').toLowerCase().includes(search) ||
                (e.location || '').toLowerCase().includes(search);

            let matchesMonth = true;
            if (mFilter) {
                if (e.start) {
                    const d = new Date(e.start);
                    const mName = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toLowerCase();
                    matchesMonth = mName.includes(mFilter) || e.start.includes(mFilter);
                } else {
                    // If filtering by month, undated events only show if they match text
                    // (They are "timeless", so we decide if they show or not. 
                    // Usually better to keep them visible matchesText is true)
                    matchesMonth = true;
                }
            }
            return matchesText && matchesMonth;
        });

        // Sorting
        filtered.sort((a, b) => {
            let valA = a[currentSort.key] || '';
            let valB = b[currentSort.key] || '';
            if (currentSort.key === 'start') { valA = valA || '9999'; valB = valB || '9999'; }
            if (valA < valB) return currentSort.order === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.order === 'asc' ? 1 : -1;
            return 0;
        });

        const bounds = [];
        filtered.forEach(event => {
            const tr = document.createElement('tr');
            const comp = (event.checklist || []).filter(t => t.completed).length;
            const tot = (event.checklist || []).length;
            const status = tot > 0 && comp === tot ? '<span style="color:var(--success-color)">Completado</span>' : `<span>${comp}/${tot} Tareas</span>`;

            tr.innerHTML = `
                <td>${event.start ? formatDate(event.start) : '<span style="color:#94a3b8;font-style:italic">Sin fecha</span>'}</td>
                <td style="font-weight:700">${event.title}</td>
                <td>${event.municipality || '-'}</td>
                <td>${event.province || '-'}</td>
                <td>${event.schedule || '-'}</td>
                <td>${status}</td>
                <td>
                    <button class="btn secondary btn-small details-btn"><i data-lucide="eye"></i></button>
                    <button class="btn secondary btn-small edit-btn"><i data-lucide="edit"></i></button>
                </td>
            `;
            tr.querySelector('.details-btn').onclick = () => openEventDetails(event);
            tr.querySelector('.edit-btn').onclick = () => openEditModal(event);
            tableBody.appendChild(tr);

            if (map && event.lat && event.lng) {
                const marker = L.marker([event.lat, event.lng], { icon: bluePinIcon }).addTo(markersGroup);
                marker.bindPopup(`<b>${event.title}</b><br>${event.municipality}<br>${event.location || ''}<br><small>${event.start ? formatDate(event.start) : 'Fecha sin confirmar'}</small>`);
                bounds.push([event.lat, event.lng]);
            }
        });

        if (map && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [40, 40] });
        }
        lucide.createIcons();
    };

    if (mapEl && typeof L !== 'undefined') {
        map = L.map('map', { scrollWheelZoom: false }).setView([42.755, -7.866], 7);
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);
        markersGroup = L.layerGroup().addTo(map);
    }

    // --- Inputs Handlers ---
    if (searchInput) searchInput.oninput = renderTable;
    if (monthFilter) monthFilter.oninput = renderTable;

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) searchBtn.onclick = renderTable;

    if (resetFiltersBtn) {
        resetFiltersBtn.onclick = () => {
            if (searchInput) searchInput.value = '';
            if (monthFilter) monthFilter.value = '';
            renderTable();
        };
    }

    const sortTable = (key) => {
        if (currentSort.key === key) currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
        else { currentSort.key = key; currentSort.order = 'asc'; }
        renderTable();
    };
    if (document.getElementById('sortDate')) document.getElementById('sortDate').onclick = () => sortTable('start');
    if (document.getElementById('sortTitle')) document.getElementById('sortTitle').onclick = () => sortTable('title');
    if (document.getElementById('sortLoc')) document.getElementById('sortLoc').onclick = () => sortTable('municipality');
    if (document.getElementById('sortProvince')) document.getElementById('sortProvince').onclick = () => sortTable('province');

    // --- Event Details & Checklist ---
    const openEventDetails = (event) => {
        const titleEl = document.getElementById('detailTitle');
        const datesEl = document.getElementById('detailDates');
        const scheduleEl = document.getElementById('detailSchedule');
        const locationEl = document.getElementById('detailLocation');
        const checklistItems = document.getElementById('checklistItems');
        const progressBar = document.getElementById('checklistProgress');
        const progressPercent = document.getElementById('progressPercent');

        if (!titleEl) return;
        titleEl.textContent = event.title;
        datesEl.textContent = event.start ? `${formatDate(event.start)} - ${formatDate(event.end)}` : 'Fecha por determinar';
        scheduleEl.textContent = event.schedule || 'Sin horario';
        locationEl.innerHTML = `<strong>${event.municipality || '-'}</strong>` + (event.location ? `<br><small>${event.location}</small>` : '') + `<br><small>${event.province || ''}</small>`;

        const editBtnDetails = document.getElementById('editEventBtn_FromDetails');
        if (editBtnDetails) editBtnDetails.onclick = () => openEditModal(event);

        const renderChecklist = () => {
            checklistItems.innerHTML = '';
            let comp = 0;
            if (!event.checklist) event.checklist = JSON.parse(JSON.stringify(defaultChecklist));

            event.checklist.forEach((item, idx) => {
                const li = document.createElement('li');
                li.className = 'checklist-item' + (item.completed ? ' checked' : '');
                if (item.completed) comp++;

                li.innerHTML = `
                    <div class="checkbox">${item.completed ? '<i data-lucide="check" style="width:14px;color:white"></i>' : ''}</div>
                    <span class="task-text">${item.text}</span>
                    <button class="btn secondary btn-small delete-task" style="opacity:0.3"><i data-lucide="trash-2" style="width:12px"></i></button>
                `;
                li.onclick = () => {
                    item.completed = !item.completed;
                    saveData();
                    renderChecklist();
                };
                li.querySelector('.delete-task').onclick = (e) => {
                    e.stopPropagation();
                    if (confirm('¿Eliminar tarea?')) {
                        event.checklist.splice(idx, 1);
                        saveData();
                        renderChecklist();
                    }
                };
                checklistItems.appendChild(li);
            });
            const p = event.checklist.length > 0 ? Math.round((comp / event.checklist.length) * 100) : 0;
            if (progressBar) progressBar.style.width = p + '%';
            if (progressPercent) progressPercent.textContent = p + '%';
            lucide.createIcons();
        };

        renderChecklist();
        openModal(eventDetailsModal);
    };

    const openEditModal = (event) => {
        document.getElementById('editEventId').value = event.id;
        document.getElementById('editTitle').value = event.title;
        document.getElementById('editStart').value = event.start || '';
        document.getElementById('editEnd').value = event.end || '';
        document.getElementById('editSchedule').value = event.schedule || '';
        document.getElementById('editLocationSelect').value = event.municipality || '';
        if (document.getElementById('editLocationInput')) document.getElementById('editLocationInput').value = event.location || '';
        if (document.getElementById('editProvinceInput')) document.getElementById('editProvinceInput').value = event.province || '';
        if (document.getElementById('editLatInput')) document.getElementById('editLatInput').value = event.lat || '';
        if (document.getElementById('editLngInput')) document.getElementById('editLngInput').value = event.lng || '';
        document.getElementById('editDetails').value = event.details || '';

        closeModal(eventDetailsModal);
        openModal(editEventModal);
    };

    // --- Alerts ---
    const renderAlerts = () => {
        if (!alertsContainer || !alertsList) return;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const alerts = [];
        events.forEach(e => {
            if (!e.start) return;
            const start = new Date(e.start);
            (e.checklist || []).forEach(t => {
                if (!t.completed && t.daysBefore > 0) {
                    const deadline = new Date(start);
                    deadline.setDate(deadline.getDate() - t.daysBefore);
                    if (now >= deadline) alerts.push({ event: e, task: t.text, date: deadline });
                }
            });
        });

        if (alerts.length > 0) {
            alertsContainer.classList.add('active');
            alertsList.innerHTML = '';
            alerts.forEach(a => {
                const div = document.createElement('div');
                div.className = 'alert-item';
                div.style.cursor = 'pointer';
                div.innerHTML = `
                    <span><strong>${a.event.title}</strong>: ${a.task}</span>
                    <span class="alert-deadline-tag">Plazo: ${formatDate(a.date)}</span>
                `;
                div.onclick = () => openEventDetails(a.event);
                alertsList.appendChild(div);
            });
        } else {
            alertsContainer.classList.remove('active');
        }
    };


    // --- Excel ---
    if (document.getElementById('exportBtn')) {
        document.getElementById('exportBtn').onclick = () => {
            const data = events.map(e => ({
                "Evento": e.title, "Inicio": e.start, "Fin": e.end, "Concello": e.municipality, "Dirección": e.location, "Provincia": e.province, "Detalles": e.details
            }));
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Eventos");
            XLSX.writeFile(wb, "Eventos_Difusion.xlsx");
        };
    }

    if (document.getElementById('templateBtn')) {
        document.getElementById('templateBtn').onclick = () => {
            const ws = XLSX.utils.json_to_sheet([{ "Evento": "Ejemplo", "Inicio": "2024-06-01", "Fin": "2024-06-01", "Concello": "Santiago de Compostela", "Dirección": "Plaza", "Detalles": "Notas" }]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
            XLSX.writeFile(wb, "Plantilla_Difusion.xlsx");
        };
    }

    const importFile = document.getElementById('importFile');
    if (document.getElementById('importBtn')) document.getElementById('importBtn').onclick = () => importFile.click();
    if (importFile) {
        importFile.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                data.forEach(row => {
                    events.push({
                        id: Date.now() + Math.random(),
                        title: row.Evento, start: row.Inicio, end: row.Fin, municipality: row.Concello,
                        location: row.Dirección, province: getProvince(row.Concello), details: row.Detalles,
                        checklist: JSON.parse(JSON.stringify(defaultChecklist))
                    });
                });
                saveData();
            };
            reader.readAsBinaryString(file);
        };
    }

    // --- Init ---
    if (document.getElementById('prevMonth')) document.getElementById('prevMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
    if (document.getElementById('nextMonth')) document.getElementById('nextMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };

    if (calendarGrid) renderCalendar();
    if (tableBody) renderTable();
    if (monthFilter) populateMonthSuggestions();
    renderAlerts();
});

