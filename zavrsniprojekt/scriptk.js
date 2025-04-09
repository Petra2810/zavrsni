document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date(); // sadasnji datum
    let selectedDate = null;
    // dohvacam elemente
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthYear = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const eventForm = document.getElementById('event-form');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const saveEventBtn = document.getElementById('save-event');
    const cancelEventBtn = document.getElementById('cancel-event');
    const eventTitle = document.getElementById('event-title');
    const eventDescription = document.getElementById('event-description');
    
    renderCalendar();
    // Event listeneri
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
    
    // prikaz kalendara
    function renderCalendar() {
        // stavljam mjesece i godinu 
        const monthNames = ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", 
                           "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"];
        currentMonthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        
        calendarDays.innerHTML = '';
        
        // početne vrijednosti
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        
        
        let startingDayOfWeek = firstDayOfMonth.getDay();
        startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
        
        const endingDayOfWeek = lastDayOfMonth.getDay();
        
        // prazni prostori za dane proslog mjeseca
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        for (let i = 0; i < startingDayOfWeek; i++) {
            const dayElement = createDayElement(prevMonthLastDay - startingDayOfWeek + i + 1, true);
            calendarDays.appendChild(dayElement);
        }
        
        // dani ovog miseca
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = createDayElement(i, false);
            
            // da se oznaci danasnji dan
            if (currentDate.getFullYear() === today.getFullYear() && 
                currentDate.getMonth() === today.getMonth() && 
                i === today.getDate()) {
                dayElement.classList.add('today');
            }
            calendarDays.appendChild(dayElement);
        }
        
        // prazni prostori za dane od slj miseca
        const daysToAdd = 42 - (startingDayOfWeek + daysInMonth); // 6 redova x 7 dana = 42 ćelije
        for (let i = 1; i <= daysToAdd; i++) {
            const dayElement = createDayElement(i, true);
            calendarDays.appendChild(dayElement);
        }
        
        //da se spreme obaveze za trenutni misec
        loadEvents();
    }
    
    function createDayElement(dayNumber, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        const dayNumberElement = document.createElement('div');
        dayNumberElement.className = 'day-number';
        dayNumberElement.textContent = dayNumber;
        dayElement.appendChild(dayNumberElement);
        
        dayElement.addEventListener('click', () => {
            if (!isOtherMonth) {
                // Ukloni odabr dan sa prije odabranog
                const previouslySelected = document.querySelector('.selected-day');
                if (previouslySelected) {
                    previouslySelected.classList.remove('selected-day');
                }
                
                // Dodaj odabrani dan na trenutno odabrani
                dayElement.classList.add('selected-day');
                
                //postavit odabrani datum
                selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
                
                // Prikaz za unos obaveze
                showEventForm(selectedDate);
            }
        });
        
        return dayElement;
    }
    
    // Prikaz za unos obaveze
    function showEventForm(date) {
        const dateString = formatDate(date);
        selectedDateDisplay.textContent = dateString;
        eventForm.style.display = 'block';
        
        eventTitle.focus();
    }
    
    // Sakrij formu za unos obaveze
    function hideEventForm() {
        eventForm.style.display = 'none';
        eventTitle.value = '';
        eventDescription.value = '';
        
        // Ukloni odabrani dan
        const previouslySelected = document.querySelector('.selected-day');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected-day');
        }
    }
    
    //Spremanje obaveze
    function saveEvent() {
        const title = eventTitle.value.trim();
        if (!title) {
            alert('Molimo unesite naziv obaveze!');
            return;
        }
        
        const description = eventDescription.value.trim();
        const dateKey = formatDateKey(selectedDate);
        
        //Dohvati postojeće obaveze iz localStorage
        let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
        
        //Dodaj novu obavezu
        if (!events[dateKey]) {
            events[dateKey] = [];
        }
        events[dateKey].push({
            title: title,
            description: description,
            createdAt: new Date().toISOString()
        });
        
        //Spremi natrag u localStorage
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        
        //Sakrij formu i osvježi kalendar
        hideEventForm();
        loadEvents();
    }
    
    //Odustani od unosa obaveze
    function cancelEvent() {
        hideEventForm();
    }
    
    //Učitaj obaveze za sadasnji misec
    function loadEvents() {
        //Dohvati sve obaveze iz localStorage
        const events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
        
        //Prođi kroz sve dane u kalendaru
        const dayElements = document.querySelectorAll('.calendar-day:not(.other-month)');
        dayElements.forEach(dayElement => {
            //Očisti postojeće obaveze
            const existingEvents = dayElement.querySelectorAll('.event');
            existingEvents.forEach(event => event.remove());
            
            //Dohvati broj dana
            const dayNumber = parseInt(dayElement.querySelector('.day-number').textContent);
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
            const dateKey = formatDateKey(date);
            
            //Ako postoje obaveze za taj dan, dodaj ih
            if (events[dateKey]) {
                events[dateKey].forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.className = 'event';
                    eventElement.title = event.description || event.title;
                    eventElement.textContent = event.title;
                    dayElement.appendChild(eventElement);
                });
            }
        });
    }
    
    //Formirat ključ za localStorage (YYYY-MM-DD)
    function formatDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    //Formatirat datum za prikaz (npr. "28. listopada 2008.")
    function formatDate(date) {
        const monthNames = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", 
                           "srpnja", "kolovoza", "rujna", "listopada", "studenog", "prosinca"];
        return `${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
})