// ===== CUSTOM MODALS FOR HABIT & TODO =====

let currentDatePickerType = null;
let selectedCalendarDate = null;
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

// ===== INTERVAL MODAL =====
function openIntervalModal() {
  document.getElementById('interval-selector-modal').classList.remove('hidden');
}

function closeIntervalModal() {
  document.getElementById('interval-selector-modal').classList.add('hidden');
}

function selectInterval(value) {
  const labels = {
    'daily': 'Täglich',
    'weekly': 'Wöchentlich',
    'monthly': 'Monatlich',
    'custom': 'Benutzerdefiniert'
  };
  
  document.getElementById('habit-interval').value = value;
  document.getElementById('habit-interval-text').innerText = labels[value] || value;
  closeIntervalModal();
  
  // Show/hide daily days and custom sections
  if (typeof handleIntervalChange === 'function') {
    handleIntervalChange();
  }
}

// ===== UNIT MODAL =====
function openUnitModal() {
  document.getElementById('unit-selector-modal').classList.remove('hidden');
}

function closeUnitModal() {
  document.getElementById('unit-selector-modal').classList.add('hidden');
}

function selectUnit(value) {
  const labels = {
    'mal': '× (mal)',
    'min': 'Minuten',
    'std': 'Stunden',
    'seiten': 'Seiten',
    'km': 'Kilometer',
    'liter': 'Liter',
    'stk': 'Stück'
  };
  
  document.getElementById('habit-goal-unit').value = value;
  document.getElementById('habit-unit-text').innerText = labels[value] || value;
  closeUnitModal();
}

// ===== TODO REPEAT MODAL =====
function openTodoRepeatModal() {
  document.getElementById('todo-repeat-modal').classList.remove('hidden');
}

function closeTodoRepeatModal() {
  document.getElementById('todo-repeat-modal').classList.add('hidden');
}

function selectTodoRepeat(value) {
  const labels = {
    'none': 'Keine',
    'daily': 'Täglich',
    'weekly': 'Wöchentlich',
    'monthly': 'Monatlich'
  };
  
  document.getElementById('todo-repeat').value = value;
  document.getElementById('todo-repeat-text').innerText = labels[value] || value;
  closeTodoRepeatModal();
}

// ===== DATE PICKER MODAL =====
function openDatePicker(type) {
  currentDatePickerType = type;
  
  // Set current selected date if exists
  const dateInput = document.getElementById(type === 'habit' ? 'habit-end-date' : 'todo-due-date');
  if (dateInput && dateInput.value) {
    const parts = dateInput.value.split('-');
    selectedCalendarDate = new Date(parts[0], parts[1] - 1, parts[2]);
    currentCalendarMonth = selectedCalendarDate.getMonth();
    currentCalendarYear = selectedCalendarDate.getFullYear();
  } else {
    selectedCalendarDate = null;
    const today = new Date();
    currentCalendarMonth = today.getMonth();
    currentCalendarYear = today.getFullYear();
  }
  
  document.getElementById('date-picker-title').innerText = 
    type === 'habit' ? 'Enddatum wählen' : 'Fälligkeitsdatum wählen';
  
  // Set confirm button color based on type
  const confirmBtn = document.getElementById('date-picker-confirm-btn');
  const accentColor = getCalendarAccentColor();
  if (confirmBtn) {
    confirmBtn.style.backgroundColor = accentColor;
    confirmBtn.style.borderColor = accentColor;
  }
  
  renderCalendar();
  document.getElementById('date-picker-modal').classList.remove('hidden');
}

function closeDatePicker() {
  document.getElementById('date-picker-modal').classList.add('hidden');
  currentDatePickerType = null;
}

function previousMonth() {
  currentCalendarMonth--;
  if (currentCalendarMonth < 0) {
    currentCalendarMonth = 11;
    currentCalendarYear--;
  }
  renderCalendar();
}

function nextMonth() {
  currentCalendarMonth++;
  if (currentCalendarMonth > 11) {
    currentCalendarMonth = 0;
    currentCalendarYear++;
  }
  renderCalendar();
}

function renderCalendar() {
  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  
  document.getElementById('current-month-year').innerText = 
    `${monthNames[currentCalendarMonth]} ${currentCalendarYear}`;
  
  const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1);
  const lastDay = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Get day of week (0 = Sunday, we want Monday = 0)
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;
  
  const calendarDays = document.getElementById('calendar-days');
  calendarDays.innerHTML = '';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const accentColor = getCalendarAccentColor();
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'aspect-square';
    calendarDays.appendChild(emptyDay);
  }
  
  // Add day buttons
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentCalendarYear, currentCalendarMonth, day);
    date.setHours(0, 0, 0, 0);
    
    const isToday = date.getTime() === today.getTime();
    const isSelected = selectedCalendarDate && 
                      date.getTime() === selectedCalendarDate.getTime();
    
    const dayBtn = document.createElement('button');
    dayBtn.type = 'button';
    
    if (isSelected) {
      dayBtn.className = 'aspect-square rounded-lg font-bold text-sm transition-all text-white';
      dayBtn.style.backgroundColor = accentColor;
    } else if (isToday) {
      dayBtn.className = 'aspect-square rounded-lg font-bold text-sm transition-all border';
      dayBtn.style.borderColor = accentColor;
      dayBtn.style.backgroundColor = accentColor + '33';
      dayBtn.style.color = accentColor;
    } else {
      dayBtn.className = 'aspect-square rounded-lg font-bold text-sm transition-all bg-white/5 text-gray-300 hover:bg-white/10';
    }
    
    dayBtn.innerText = day;
    dayBtn.onclick = () => selectCalendarDate(date);
    
    calendarDays.appendChild(dayBtn);
  }
}

function selectCalendarDate(date) {
  selectedCalendarDate = date;
  renderCalendar();
}

function clearDate() {
  selectedCalendarDate = null;
  
  if (currentDatePickerType === 'habit') {
    document.getElementById('habit-end-date').value = '';
    document.getElementById('habit-end-date-text').innerText = 'Kein Enddatum';
    document.getElementById('habit-end-date-text').classList.add('text-gray-400');
    document.getElementById('habit-end-date-text').classList.remove('text-white');
  } else if (currentDatePickerType === 'todo') {
    document.getElementById('todo-due-date').value = '';
    document.getElementById('todo-due-date-text').innerText = 'Kein Datum';
    document.getElementById('todo-due-date-text').classList.add('text-gray-400');
    document.getElementById('todo-due-date-text').classList.remove('text-white');
  }
  
  closeDatePicker();
}

function confirmDate() {
  if (!selectedCalendarDate) {
    clearDate();
    return;
  }
  
  const year = selectedCalendarDate.getFullYear();
  const month = String(selectedCalendarDate.getMonth() + 1).padStart(2, '0');
  const day = String(selectedCalendarDate.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  const displayDate = selectedCalendarDate.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  
  if (currentDatePickerType === 'habit') {
    document.getElementById('habit-end-date').value = dateString;
    document.getElementById('habit-end-date-text').innerText = displayDate;
    document.getElementById('habit-end-date-text').classList.remove('text-gray-400');
    document.getElementById('habit-end-date-text').classList.add('text-white');
  } else if (currentDatePickerType === 'todo') {
    document.getElementById('todo-due-date').value = dateString;
    document.getElementById('todo-due-date-text').innerText = displayDate;
    document.getElementById('todo-due-date-text').classList.remove('text-gray-400');
    document.getElementById('todo-due-date-text').classList.add('text-white');
  }
  
  closeDatePicker();
}

// Update calendar rendering color based on context
function getCalendarAccentColor() {
  // Use orange for sport page context, otherwise use default indigo
  if (currentDatePickerType === 'sport') {
    return '#f97316';
  }
  return '#6366f1';
}
