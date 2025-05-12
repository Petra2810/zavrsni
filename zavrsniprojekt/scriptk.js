document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let selectedDate = null;
    let calendarDays = document.getElementById('calendar-days');
    let currentMonthYear = document.getElementById('current-month-year');
    let prevMonthBtn = document.getElementById('prev-month');
    let nextMonthBtn = document.getElementById('next-month');
    let eventForm = document.getElementById('event-form');
    let selectedDateDisplay = document.getElementById('selected-date-display');
    let saveEventBtn = document.getElementById('save-event');
    let cancelEventBtn = document.getElementById('cancel-event');
    let eventTitle = document.getElementById('event-title');
    let eventDescription = document.getElementById('event-description');
    
    //za opis biljesk
    let tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);
    
    renderCalendar();
     //Event listeneri
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    saveEventBtn.addEventListener('click', saveEvent);
    cancelEventBtn.addEventListener('click', cancelEvent);

     //prikaz kalendara
    function renderCalendar() {
        let monthNames = ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", 
                         "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"];
        currentMonthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        
        calendarDays.innerHTML = '';
        
        let firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        let lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        let daysInMonth = lastDayOfMonth.getDate();
        
        let startingDayOfWeek = firstDayOfMonth.getDay();
        startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
        
        let prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        for (let i = 0; i < startingDayOfWeek; i++) {
            let dayElement = createDayElement(prevMonthLastDay - startingDayOfWeek + i + 1, true);
            calendarDays.appendChild(dayElement);
        }
        
        let today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            let dayElement = createDayElement(i, false);
            
            if (currentDate.getFullYear() === today.getFullYear() && 
                currentDate.getMonth() === today.getMonth() && 
                i === today.getDate()) {
                dayElement.classList.add('today');
            }
            calendarDays.appendChild(dayElement);
        }
        
        let daysToAdd = 42 - (startingDayOfWeek + daysInMonth);
        for (let i = 1; i <= daysToAdd; i++) {
            let dayElement = createDayElement(i, true);
            calendarDays.appendChild(dayElement);
        }
        
        loadEvents();
    }

    function createDayElement(dayNumber, isOtherMonth) {
        let dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        let dayNumberElement = document.createElement('div');
        dayNumberElement.className = 'day-number';
        dayNumberElement.textContent = dayNumber;
        dayElement.appendChild(dayNumberElement);
        
        dayElement.addEventListener('click', () => {
            if (!isOtherMonth) {
                let previouslySelected = document.querySelector('.selected-day');
                if (previouslySelected) {
                    previouslySelected.classList.remove('selected-day');
                }
                
                dayElement.classList.add('selected-day');
                selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
                showEventForm(selectedDate);
            }
        });
        
        return dayElement;
    }

     //Prikaz za unos obaveze
    function showEventForm(date) {
        let dateString = formatDate(date);
        selectedDateDisplay.textContent = dateString;
        eventForm.style.display = 'block';
        eventTitle.focus();
    }

     //Sakrij  -||-
    function hideEventForm() {
        eventForm.style.display = 'none';
        eventTitle.value = '';
        eventDescription.value = '';
        document.getElementById('event-priority').value = 'medium';
        
        let previouslySelected = document.querySelector('.selected-day');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected-day');
        }
    }

    //Spremanje obaveze
    function saveEvent() {
        let title = eventTitle.value.trim();
        if (!title) {
            alert('Molimo unesite naziv obaveze!');
            return;
        }
        
        let description = eventDescription.value.trim();
        let priority = document.getElementById('event-priority').value;
        let dateKey = formatDateKey(selectedDate);
        
        let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
        
        if (!events[dateKey]) {
            events[dateKey] = [];
        }
        events[dateKey].push({
            title: title,
            description: description,
            priority: priority,
            createdAt: new Date().toISOString(),
            id: Date.now()
        });
        
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        hideEventForm();
        loadEvents();
    }

     //Odustani od upisa
    function cancelEvent() {
        hideEventForm();
    }

    //Učitaj obaveze za sadasnji misec
    function loadEvents() {
        let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
        let dayElements = document.querySelectorAll('.calendar-day:not(.other-month)');
        
        dayElements.forEach(dayElement => {
            let existingEvents = dayElement.querySelectorAll('.event');
            existingEvents.forEach(event => event.remove());
            
            let dayNumber = parseInt(dayElement.querySelector('.day-number').textContent);
            let date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
            let dateKey = formatDateKey(date);
            
            if (events[dateKey]) {
                events[dateKey].forEach(event => {
                    let eventElement = document.createElement('div');
                    eventElement.className = `event ${event.priority}-priority`;
                    eventElement.dataset.id = event.id;
                    
                    let eventTitleElement = document.createElement('span');
                    eventTitleElement.textContent = event.title;
                    
                    let deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-event';
                    deleteBtn.innerHTML = '×';
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteEvent(dateKey, event.id);
                    });
                    
                    eventElement.appendChild(eventTitleElement);
                    eventElement.appendChild(deleteBtn);
                    dayElement.appendChild(eventElement);
                    
                    if (event.description) {
                        eventElement.addEventListener('mouseenter', (e) => {
                            tooltip.textContent = event.description;
                            tooltip.style.display = 'block';
                            tooltip.style.left = `${e.pageX + 10}px`;
                            tooltip.style.top = `${e.pageY + 10}px`;
                        });
                        
                        eventElement.addEventListener('mouseleave', () => {
                            tooltip.style.display = 'none';
                        });
                        
                        eventElement.addEventListener('mousemove', (e) => {
                            tooltip.style.left = `${e.pageX + 10}px`;
                            tooltip.style.top = `${e.pageY + 10}px`;
                        });
                    }
                });
            }
        });
    }

     //brisanje obaveza
    function deleteEvent(dateKey, eventId) {
        if (!confirm('Jeste li sigurni da želite izbrisati ovu obavezu?')) {
            return;
        }
        
        let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
        if (events[dateKey]) {
            events[dateKey] = events[dateKey].filter(event => event.id != eventId);
            
            if (events[dateKey].length === 0) {
                delete events[dateKey];
            }
            
            localStorage.setItem('calendarEvents', JSON.stringify(events));
            
            // Dodana linija za sakrivanje tooltipa
            tooltip.style.display = 'none';
            
            loadEvents();
        }
    }
    
    //Formirat ključ za localStorage (YYYY-MM-DD)
    function formatDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    //Formatirat datum za prikaz (npr. "28. listopada 2008.")
    function formatDate(date) {
        let monthNames = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", 
                         "srpnja", "kolovoza", "rujna", "listopada", "studenog", "prosinca"];
        return `${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
});