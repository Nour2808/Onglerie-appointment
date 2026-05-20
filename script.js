// Gestion de l'application de réservation de rendez-vous

class AppointmentBooking {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.selectedDate = null;
        this.selectedService = null;
        this.selectedServicePrice = null;
        this.selectedTime = null;
        this.appointments = [];
        this.currentMonth = new Date();
        this.businessHours = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCalendar();
        this.displayAppointments();
    }

    setupEventListeners() {
        // Calendrier
        document.getElementById('prevMonth').addEventListener('click', (e) => {
            e.preventDefault();
            this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', (e) => {
            e.preventDefault();
            this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
            this.renderCalendar();
        });

        // Services
        document.querySelectorAll('input[name="service"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedService = e.target.value;
                this.selectedServicePrice = e.target.dataset.price;
                document.getElementById('selectedService').textContent = this.selectedService;
                this.generateTimeSlots();
            });
        });

        // Formulaire
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitBooking();
        });

        // Boutons de navigation
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.previousStep());
        document.getElementById('cancelBtn').addEventListener('click', () => this.resetForm());

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('newBookingBtn').addEventListener('click', () => {
            this.closeModal();
            this.resetForm();
        });
    }

    renderCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const monthName = new Date(year, month).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
        
        document.getElementById('currentMonth').textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';

        // Jours de la semaine
        const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-name';
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = firstDay === 0 ? 6 : firstDay - 1;

        // Jours du mois précédent
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        for (let i = startDay; i > 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = daysInPrevMonth - i + 1;
            calendar.appendChild(dayElement);
        }

        // Jours du mois courant
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = i;

            const date = new Date(year, month, i);
            const dateString = this.formatDate(date);

            if (date < today && date.getDate() !== today.getDate()) {
                dayElement.classList.add('disabled');
            } else {
                dayElement.addEventListener('click', () => this.selectDate(dateString, dayElement));
            }

            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            if (this.selectedDate === dateString) {
                dayElement.classList.add('selected');
            }

            calendar.appendChild(dayElement);
        }

        // Jours du mois suivant
        const totalCells = startDay + daysInMonth;
        const emptyDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= emptyDays; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = i;
            calendar.appendChild(dayElement);
        }
    }

    selectDate(dateString, element) {
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        element.classList.add('selected');
        this.selectedDate = dateString;
        document.getElementById('selectedDate').textContent = this.selectedDate;
        this.updateSummary();
    }

    formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    }

    generateTimeSlots() {
        const timeSlots = document.getElementById('timeSlots');
        timeSlots.innerHTML = '';

        this.businessHours.forEach(time => {
            const timeElement = document.createElement('div');
            timeElement.className = 'time-slot';
            timeElement.textContent = time;

            // Simulation: 30% de chance que l'horaire soit occupé
            const isAvailable = Math.random() > 0.3;
            if (!isAvailable) {
                timeElement.classList.add('disabled');
                timeElement.style.cursor = 'not-allowed';
            } else {
                timeElement.addEventListener('click', () => this.selectTime(time, timeElement));
            }

            if (this.selectedTime === time) {
                timeElement.classList.add('selected');
            }

            timeSlots.appendChild(timeElement);
        });
    }

    selectTime(time, element) {
        document.querySelectorAll('.time-slot.selected').forEach(el => {
            el.classList.remove('selected');
        });
        element.classList.add('selected');
        this.selectedTime = time;
        document.getElementById('selectedTime').textContent = this.selectedTime;
        this.updateSummary();
    }

    nextStep() {
        if (this.validateStep(this.currentStep)) {
            this.currentStep++;
            if (this.currentStep > this.totalSteps) {
                this.currentStep = this.totalSteps;
            }
            this.updateFormDisplay();
        } else {
            alert('Veuillez compléter cette étape avant de continuer.');
        }
    }

    previousStep() {
        this.currentStep--;
        if (this.currentStep < 1) {
            this.currentStep = 1;
        }
        this.updateFormDisplay();
    }

    validateStep(step) {
        switch(step) {
            case 1:
                return this.selectedDate !== null;
            case 2:
                return this.selectedService !== null;
            case 3:
                return this.selectedTime !== null;
            case 4:
                return this.validateClientForm();
            default:
                return false;
        }
    }

    validateClientForm() {
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const terms = document.getElementById('terms').checked;

        return fullName !== '' && email !== '' && phone !== '' && terms;
    }

    updateFormDisplay() {
        // Masquer tous les formulaires
        for (let i = 1; i <= this.totalSteps; i++) {
            const step = document.getElementById(`step-${i === 1 ? 'date' : i === 2 ? 'service' : i === 3 ? 'time' : 'client'}`);
            step.classList.add('hidden');
        }

        // Afficher l'étape actuelle
        const currentStepId = `step-${this.currentStep === 1 ? 'date' : this.currentStep === 2 ? 'service' : this.currentStep === 3 ? 'time' : 'client'}`;
        document.getElementById(currentStepId).classList.remove('hidden');

        // Mettre à jour les boutons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        const bookingSummary = document.querySelector('.booking-summary');

        if (this.currentStep === 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
            bookingSummary.style.display = 'none';
        } else if (this.currentStep === this.totalSteps) {
            prevBtn.style.display = 'inline-flex';
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
            bookingSummary.style.display = 'block';
        } else {
            prevBtn.style.display = 'inline-flex';
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
            bookingSummary.style.display = 'none';
        }
    }

    updateSummary() {
        document.getElementById('summaryDate').textContent = this.selectedDate || '-';
        document.getElementById('summaryService').textContent = this.selectedService || '-';
        document.getElementById('summaryTime').textContent = this.selectedTime || '-';
        document.getElementById('summaryPrice').textContent = this.selectedServicePrice ? `${this.selectedServicePrice} DT` : '-';
    }

    submitBooking() {
        if (!this.validateStep(4)) {
            alert('Veuillez remplir tous les champs requis.');
            return;
        }

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const notes = document.getElementById('notes').value.trim();

        // Créer l'objet rendez-vous
        const appointment = {
            id: Date.now(),
            date: this.selectedDate,
            time: this.selectedTime,
            service: this.selectedService,
            price: this.selectedServicePrice,
            client: fullName,
            email: email,
            phone: phone,
            notes: notes,
            confirmedAt: new Date().toLocaleString('fr-FR')
        };

        // Ajouter à la liste
        this.appointments.push(appointment);
        localStorage.setItem('appointments', JSON.stringify(this.appointments));

        // Afficher la modal de confirmation
        this.showConfirmationModal(appointment);
    }

    showConfirmationModal(appointment) {
        const modal = document.getElementById('confirmationModal');
        document.getElementById('confirmationEmail').textContent = appointment.email;
        document.getElementById('confirmDate').textContent = appointment.date;
        document.getElementById('confirmTime').textContent = appointment.time;
        document.getElementById('confirmService').textContent = appointment.service;
        document.getElementById('confirmPrice').textContent = `${appointment.price} DT`;
        
        modal.classList.add('show');
    }

    closeModal() {
        document.getElementById('confirmationModal').classList.remove('show');
    }

    resetForm() {
        this.currentStep = 1;
        this.selectedDate = null;
        this.selectedService = null;
        this.selectedServicePrice = null;
        this.selectedTime = null;

        document.getElementById('bookingForm').reset();
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        document.getElementById('selectedDate').textContent = 'Aucune';
        document.getElementById('selectedService').textContent = 'Aucun';
        document.getElementById('selectedTime').textContent = 'Aucun';
        this.updateSummary();
        this.updateFormDisplay();
    }

    deleteAppointment(appointmentId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous?')) {
            this.appointments = this.appointments.filter(apt => apt.id !== appointmentId);
            localStorage.setItem('appointments', JSON.stringify(this.appointments));
            this.displayAppointments();
        }
    }

    displayAppointments() {
        // Charger depuis localStorage
        const stored = localStorage.getItem('appointments');
        if (stored) {
            this.appointments = JSON.parse(stored);
        }

        const appointmentsList = document.getElementById('appointmentsList');
        appointmentsList.innerHTML = '';

        if (this.appointments.length === 0) {
            appointmentsList.innerHTML = '<div class="no-appointments"><p>Aucun rendez-vous confirmé pour le moment.</p></div>';
            return;
        }

        this.appointments.forEach(appointment => {
            const card = document.createElement('div');
            card.className = 'appointment-card';
            card.innerHTML = `
                <div class="appointment-header">
                    <div class="appointment-name">👤 ${appointment.client}</div>
                    <div class="appointment-badge">✓ Confirmé</div>
                </div>
                <div class="appointment-details">
                    <div class="appointment-detail">📅 <strong>${appointment.date}</strong></div>
                    <div class="appointment-detail">⏰ <strong>${appointment.time}</strong></div>
                    <div class="appointment-detail">💅 <strong>${appointment.service}</strong></div>
                    <div class="appointment-detail">💰 <strong>${appointment.price} DT</strong></div>
                    <div class="appointment-detail">📧 <strong>${appointment.email}</strong></div>
                    <div class="appointment-detail">📱 <strong>${appointment.phone}</strong></div>
                </div>
                ${appointment.notes ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.1);"><small><strong>Notes:</strong> ${appointment.notes}</small></div>` : ''}
                <button class="delete-btn" onclick="bookingApp.deleteAppointment(${appointment.id})">🗑️ Supprimer</button>
            `;
            appointmentsList.appendChild(card);
        });
    }
}

// Instance globale pour accès externe
let bookingApp;

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    bookingApp = new AppointmentBooking();
});
