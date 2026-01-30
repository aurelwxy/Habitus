// ===== CONFIG =====
const defaultConfig = {
  app_title: 'habitus.',
  empty_habits_message: 'Erstelle deinen ersten Habit',
  empty_todos_message: 'Erstelle deine erste Aufgabe'
};

let config = { ...defaultConfig };
let items = [];
let editingItemId = null;
let currentPage = 'stats';
let selectedHabitIcon = 0;
let selectedHabitColor = '#6366f1';
let selectedHabitType = 'task';
let selectedTodoPriority = 'medium';
let selectedDate = getTodayDate();
let currentWeekStart = getWeekStart(getTodayDate());
let selectedDailyDays = [1, 2, 3, 4, 5, 6, 0]; // All days selected by default

const habitColors = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#84cc16', // Lime
  '#f97316', // Orange
  '#a855f7', // Violet
  '#22c55e', // Green
  '#eab308', // Yellow
  '#64748b', // Slate
  '#6b7280'  // Gray
];

const habitIcons = [
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H9.5C8.67 2 8 2.67 8 3.5V4h8v-.5c0-.83-.67-1.5-1.5-1.5z"/><path d="M18 4H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/><path d="M9 9h6"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5l11 11"/><path d="M21 3L3 21"/><path d="M3 3l18 18"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/><path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"/><path d="M1 12h6m6 0h6"/><path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="12" y2="20"/><circle cx="12" cy="14" r="8"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5-5 10-8.5 10-13a10 10 0 1 0-20 0c0 4.5 5 8 10 13Z"/><path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>'
];

// ===== LOCALSTORAGE FUNCTIONS =====

function saveToLocalStorage() {
  try {
    localStorage.setItem('habitus_items', JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('habitus_items');
    if (saved) {
      items = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    items = [];
  }
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// ===== UTILITY FUNCTIONS =====

function getToday() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTodayDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

function getWeekStart(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
}

function getWeekDays(startDate) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i));
  }
  return days;
}

function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function dateToString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  const due = parseDate(dueDate);
  return due < getTodayDate();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = parseDate(dateStr);
  const today = getTodayDate();
  const tomorrow = addDays(today, 1);
  
  if (date.toDateString() === today.toDateString()) return 'Heute';
  if (date.toDateString() === tomorrow.toDateString()) return 'Morgen';
  
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

// ===== NAVIGATION =====

function renderWeekPicker(containerId) {
  const container = document.querySelector(`#${containerId} > div`);
  if (!container) return;
  
  // Determine color based on page
  const isTodoPage = containerId.includes('todos');
  const accentColor = isTodoPage ? '#22c55e' : '#6366f1';
  const accentColorLight = isTodoPage ? 'rgba(34, 197, 94, 0.3)' : 'rgba(99, 102, 241, 0.3)';
  
  const weekDays = getWeekDays(currentWeekStart);
  const today = getTodayDate();
  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  
  container.innerHTML = weekDays.map((day, index) => {
    const isToday = isSameDay(day, today);
    const isSelected = isSameDay(day, selectedDate);
    const dayNum = day.getDate();
    const dateStr = dateToString(day);
    
    return `
      <button class="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all min-w-0" 
        style="background: ${isSelected ? accentColor : 'transparent'}; border: 1px solid ${isSelected ? accentColor : (isToday ? accentColorLight : 'transparent')};"
        onclick="selectDate(parseDate('${dateStr}'))">
        <span class="text-xs font-medium mb-0.5" style="color: ${isSelected ? '#ffffff' : (isToday ? accentColor : '#6b7280')};">${dayNames[index]}</span>
        <span class="text-base font-semibold" style="color: ${isSelected ? '#ffffff' : '#e5e7eb'};">${dayNum}</span>
      </button>
    `;
  }).join('');
}

const swipeHandlers = new Map();

function setupWeekSwipe(containerId) {
  const slider = document.getElementById(containerId);
  if (!slider) return;
  
  if (swipeHandlers.has(containerId)) {
    const oldHandlers = swipeHandlers.get(containerId);
    slider.removeEventListener('touchstart', oldHandlers.touchstart);
    slider.removeEventListener('touchmove', oldHandlers.touchmove);
    slider.removeEventListener('touchend', oldHandlers.touchend);
  }
  
  let startX = 0;
  let startTime = 0;
  let isDown = false;
  let hasMoved = false;
  let isProcessing = false;
  
  const touchstart = (e) => {
    if (isProcessing) return;
    startX = e.touches[0].pageX;
    startTime = Date.now();
    isDown = true;
    hasMoved = false;
  };
  
  const touchmove = (e) => {
    if (!isDown) return;
    hasMoved = true;
  };
  
  const touchend = (e) => {
    if (!isDown || !hasMoved || isProcessing) {
      isDown = false;
      return;
    }
    
    const endX = e.changedTouches[0].pageX;
    const diff = startX - endX;
    const timeDiff = Date.now() - startTime;
    
    if (Math.abs(diff) > 80 && timeDiff < 500) {
      isProcessing = true;
      
      if (diff > 0) {
        changeWeek(1);
      } else {
        changeWeek(-1);
      }
      
      setTimeout(() => {
        isProcessing = false;
      }, 300);
    }
    
    isDown = false;
    hasMoved = false;
  };
  
  slider.addEventListener('touchstart', touchstart);
  slider.addEventListener('touchmove', touchmove);
  slider.addEventListener('touchend', touchend);
  
  swipeHandlers.set(containerId, { touchstart, touchmove, touchend });
}

function selectDate(date) {
  selectedDate = new Date(date);
  renderWeekPicker('habits-week-slider');
  renderWeekPicker('todos-week-slider');
  renderAll();
}

function changeWeek(direction) {
  const weekDays = getWeekDays(currentWeekStart);
  let selectedIndex = 0;
  for (let i = 0; i < weekDays.length; i++) {
    if (isSameDay(weekDays[i], selectedDate)) {
      selectedIndex = i;
      break;
    }
  }
  
  currentWeekStart = addDays(currentWeekStart, direction * 7);
  selectedDate = addDays(currentWeekStart, selectedIndex);
  
  renderWeekPicker('habits-week-slider');
  renderWeekPicker('todos-week-slider');
  renderAll();
}

function navigateToPage(page) {
  currentPage = page;
  // Wichtig für deine WeekPicker-Farben:
  if (typeof activePage !== 'undefined') activePage = page;

  // 1. Alle Nav-Items zurücksetzen
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('bg-white', 'text-black', 'bg-white/10');
    btn.classList.add('text-gray-400');
    const span = btn.querySelector('span');
    if (span) span.classList.replace('font-bold', 'font-medium');
  });

  // 2. Aktiven Button stylen
  const activeBtn = document.getElementById(`nav-${page}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-gray-400');
    activeBtn.classList.add('bg-white/10', 'text-white');
    const span = activeBtn.querySelector('span');
    if (span) span.classList.replace('font-medium', 'font-bold');
  }

  // 3. Seiten umschalten
  ['stats', 'habits', 'todos', 'sport', 'streak-details'].forEach(p => {
    const el = document.getElementById(`${p}-page`);
    if (el) {
      el.style.display = 'none';
      el.classList.add('hidden');
    }
  });
  const target = document.getElementById(`${page}-page`);
  if (target) {
    target.style.display = 'block';
    target.classList.remove('hidden');
  }

  // 4. Entsprechende Render-Funktionen aufrufen
  if (page === 'stats') {
    renderStats();
  } else if (page === 'habits') {
    renderWeekPicker('habits-week-slider');
    setupWeekSwipe('habits-week-slider');
    renderHabits();
  } else if (page === 'todos') {
    renderWeekPicker('todos-week-slider');
    setupWeekSwipe('todos-week-slider');
    renderTodos();
  } else if (page === 'sport') {
    if (typeof renderWorkouts === 'function') {
      renderWorkouts();
    }
  } else if (page === 'streak-details') {
    if (typeof renderStreakDetailsPage === 'function') {
      document.getElementById('streak-details-content').innerHTML = renderStreakDetailsPage();
    }
  }
}

// ===== RESET LOGIC =====

function shouldResetItem(item) {
  const lastReset = parseDate(item.last_reset);
  const today = getTodayDate();
  
  if (!lastReset) return true;
  
  switch (item.interval_type) {
    case 'daily':
      const daysSinceLastReset = Math.floor((today - lastReset) / (1000 * 60 * 60 * 24));
      return daysSinceLastReset >= 1;
      
    case 'weekly':
      const lastResetWeekStart = getWeekStart(lastReset);
      const currentWeekStart = getWeekStart(today);
      return lastResetWeekStart.getTime() !== currentWeekStart.getTime();
      
    case 'monthly':
      return lastReset.getMonth() !== today.getMonth() || lastReset.getFullYear() !== today.getFullYear();
      
    case 'custom':
      const customDays = parseInt(item.interval_days) || 2;
      const daysSinceReset = Math.floor((today - lastReset) / (1000 * 60 * 60 * 24));
      return daysSinceReset >= customDays;
      
    default:
      return false;
  }
}

function canEditHabit(habit, viewDate) {
  const today = getTodayDate();
  const lastReset = parseDate(habit.last_reset);
  
  if (!lastReset) return true;
  
  // Check if habit is active on this day of week (for daily habits)
  if (habit.interval_type === 'daily') {
    const viewDay = viewDate.getDay();
    const dailyDays = habit.daily_days ? JSON.parse(habit.daily_days) : [1, 2, 3, 4, 5, 6, 0];
    
    if (!dailyDays.includes(viewDay)) {
      return false;
    }
  }
  
  switch (habit.interval_type) {
    case 'daily':
      return isSameDay(viewDate, today);
      
    case 'weekly':
      const currentWeekStart = getWeekStart(today);
      const viewWeekStart = getWeekStart(viewDate);
      
      if (currentWeekStart.getTime() !== viewWeekStart.getTime()) {
        return false;
      }
      
      return viewDate <= today;
      
    case 'monthly':
      const isSameMonth = viewDate.getMonth() === today.getMonth() && 
                         viewDate.getFullYear() === today.getFullYear();
      return isSameMonth && viewDate <= today;
      
    case 'custom':
      const customDays = parseInt(habit.interval_days) || 2;
      const daysSinceReset = Math.floor((today - lastReset) / (1000 * 60 * 60 * 24));
      const daysFromResetToView = Math.floor((viewDate - lastReset) / (1000 * 60 * 60 * 24));
      
      return daysFromResetToView >= 0 && 
             daysFromResetToView < customDays && 
             viewDate <= today;
      
    default:
      return isSameDay(viewDate, today);
  }
}

function checkAndResetItems() {
  const habits = items.filter(i => i.type === 'habit');
  
  habits.forEach(habit => {
    if (shouldResetItem(habit)) {
      const wasCompleted = habit.progress_today >= 100;
      
      let newStreak = habit.streak || 0;
      if (!wasCompleted) {
        newStreak = 0;
      }
      
      habit.progress_today = 0;
      habit.current_value = 0;
      habit.streak = newStreak;
      habit.last_reset = getToday();
    }
  });
  
  checkRepeatingTodos();
  saveToLocalStorage();
  renderAll();
}

function checkRepeatingTodos() {
  const todos = items.filter(i => i.type === 'todo' && i.completed && i.repeat_type !== 'none');
  
  todos.forEach(todo => {
    const dueDate = parseDate(todo.due_date);
    const today = getTodayDate();
    
    if (dueDate < today) {
      let newDueDate;
      
      switch (todo.repeat_type) {
        case 'daily':
          newDueDate = addDays(dueDate, 1);
          break;
        case 'weekly':
          newDueDate = addDays(dueDate, 7);
          break;
        case 'monthly':
          newDueDate = addMonths(dueDate, 1);
          break;
      }
      
      if (newDueDate) {
        items.push({
          id: generateId(),
          type: 'todo',
          title: todo.title,
          due_date: dateToString(newDueDate),
          priority: todo.priority,
          repeat_type: todo.repeat_type,
          completed: false
        });
      }
    }
  });
}

// ===== RENDERING =====

function renderAll() {
  if (currentPage === 'stats') renderStats();
  else if (currentPage === 'habits') renderHabits();
  else if (currentPage === 'todos') renderTodos();
}

function renderStats() {
  const habits = items.filter(i => i.type === 'habit');
  const todos = items.filter(i => i.type === 'todo');
  
  const activeHabits = habits.filter(h => {
    if (!h.end_date) return true;
    return parseDate(h.end_date) >= getTodayDate();
  });
  
  const completedToday = activeHabits.filter(h => h.progress_today >= 100).length;
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const openTodos = todos.filter(t => !t.completed).length;
  
  // Streak display handled by streak-system.js
  if (typeof updateStreakDisplay === 'function') {
    updateStreakDisplay();
  } else {
    document.getElementById('stat-streak').textContent = maxStreak;
  }

  document.getElementById('stat-today').textContent = `${completedToday}/${activeHabits.length}`;
  document.getElementById('stat-active-habits').textContent = activeHabits.length;
  document.getElementById('stat-open-todos').textContent = openTodos;
  
  const today = getTodayDate();
  const weekStart = getWeekStart(today);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const dailyHabits = activeHabits.filter(h => h.interval_type === 'daily');
  let dailyHabitsProgress = 0;
  dailyHabits.forEach(h => {
    dailyHabitsProgress += Math.min(100, h.progress_today || 0);
  });
  const dayProgress = dailyHabits.length > 0 ? Math.round(dailyHabitsProgress / dailyHabits.length) : 0;
  
  const weekHabits = activeHabits.filter(h => h.interval_type === 'weekly');
  let weekHabitsProgress = 0;
  weekHabits.forEach(h => {
    const weekKey = dateToString(weekStart);
    const weeklyProgress = h.weekly_progress ? JSON.parse(h.weekly_progress) : {};
    const weekData = weeklyProgress[weekKey] || { progress: 0 };
    weekHabitsProgress += Math.min(100, weekData.progress);
  });
  
  const weekProgress = weekHabits.length > 0 ? Math.round(weekHabitsProgress / weekHabits.length) : 0;
  
  const monthHabits = activeHabits.filter(h => h.interval_type === 'monthly');
  let monthHabitsProgress = 0;
  monthHabits.forEach(h => {
    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const monthlyProgress = h.monthly_progress ? JSON.parse(h.monthly_progress) : {};
    const monthData = monthlyProgress[monthKey] || { progress: 0 };
    monthHabitsProgress += Math.min(100, monthData.progress);
  });
  
  const monthProgress = monthHabits.length > 0 ? Math.round(monthHabitsProgress / monthHabits.length) : 0;
  
  updateProgressCircle('day', dayProgress);
  updateProgressCircle('week', weekProgress);
  updateProgressCircle('month', monthProgress);
}

function updateProgressCircle(type, progress) {
  // IDs für Desktop und Mobile abrufen
  const arc = document.getElementById(`${type}-progress-arc`);
  const arcMobile = document.getElementById(`${type}-progress-arc-mobile`);
  const text = document.getElementById(`${type}-progress-text`);
  
  if (!text) return;

  // NEU: Der Umfang eines vollen Kreises mit Radius 40 ist 2 * PI * 40 = ~251.2
  const arcLength = 251.2; 
  const offset = arcLength - (arcLength * progress / 100);
  
  // Update Desktop-Kreis (falls vorhanden)
  if (arc) {
arc.style.strokeDasharray = arcLength;
arc.style.strokeDashoffset = offset;
  }
  
  // Update Mobile-Kreis (falls vorhanden)
  if (arcMobile) {
arcMobile.style.strokeDasharray = arcLength;
arcMobile.style.strokeDashoffset = offset;
  }
  
  // Text-Anzeige aktualisieren
  text.textContent = `${progress}%`;
}

function renderHabits() {
  const container = document.getElementById('habits-container');
  const emptyState = document.getElementById('empty-habits');
  
  const habits = items.filter(i => i.type === 'habit');
  
  const activeHabits = habits.filter(h => {
    if (!h.end_date) return true;
    return parseDate(h.end_date) >= getTodayDate();
  });
  
  if (activeHabits.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  const sortedHabits = [...activeHabits].sort((a, b) => {
    const aComplete = a.progress_today >= 100;
    const bComplete = b.progress_today >= 100;
    
    if (aComplete !== bComplete) {
      return aComplete ? 1 : -1;
    }
    
    return (b.streak || 0) - (a.streak || 0);
  });
  
  container.innerHTML = sortedHabits.map(habit => createHabitCard(habit)).join('');
}

function createHabitCard(habit) {
  const habitType = habit.habit_type || 'task';
  const canEdit = canEditHabit(habit, selectedDate);
  const habitColor = habit.color || '#6366f1';
  
  let currentValue, progress;
  const goalValue = habit.goal_value || 1;
  
  if (habit.interval_type === 'weekly') {
    const weekKey = dateToString(getWeekStart(selectedDate));
    const weeklyProgress = habit.weekly_progress ? JSON.parse(habit.weekly_progress) : {};
    const weekData = weeklyProgress[weekKey] || { value: 0, progress: 0 };
    
    currentValue = weekData.value || 0;
    progress = habitType === 'task' ? weekData.progress : Math.min(100, (currentValue / goalValue) * 100);
  } else if (habit.interval_type === 'monthly') {
    const monthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
    const monthlyProgress = habit.monthly_progress ? JSON.parse(habit.monthly_progress) : {};
    const monthData = monthlyProgress[monthKey] || { value: 0, progress: 0 };
    
    currentValue = monthData.value || 0;
    progress = habitType === 'task' ? monthData.progress : Math.min(100, (currentValue / goalValue) * 100);
  } else {
    const dateKey = dateToString(selectedDate);
    const dailyProgress = habit.daily_progress ? JSON.parse(habit.daily_progress) : {};
    const dayData = dailyProgress[dateKey] || { value: 0, progress: 0 };
    
    currentValue = dayData.value || 0;
    progress = (habitType === 'task' || habitType === 'sport') ? dayData.progress : Math.min(100, (currentValue / goalValue) * 100);
  }
  
  const isComplete = progress >= 100;
  const streak = habit.streak || 0;
  
  let displayValue = '';
  if (habitType === 'count') {
    displayValue = `${currentValue} / ${goalValue}`;
  } else if (habitType === 'time') {
    const hours = Math.floor(currentValue / 60);
    const mins = currentValue % 60;
    const goalHours = Math.floor(goalValue / 60);
    const goalMins = goalValue % 60;
    displayValue = `${hours}:${mins.toString().padStart(2, '0')} / ${goalHours}:${goalMins.toString().padStart(2, '0')}`;
  }
  
  let editMessage = '';
  if (!canEdit) {
    if (habit.interval_type === 'weekly') {
      editMessage = '📅 Nur innerhalb der aktuellen Woche (bis heute) bearbeitbar';
    } else if (habit.interval_type === 'monthly') {
      editMessage = '📅 Nur innerhalb des aktuellen Monats (bis heute) bearbeitbar';
    } else if (habit.interval_type === 'custom') {
      editMessage = '📅 Nur innerhalb des aktuellen Intervalls (bis heute) bearbeitbar';
    } else {
      editMessage = '📅 Nur für heute bearbeitbar';
    }
  }
  
  return `
    <div class="card p-4 rounded-2xl cursor-pointer" style="background: rgba(30, 30, 30, 0.5); border: 1px solid rgba(255, 255, 255, 0.05);" onclick="openEditHabitModal('${habit.id}')">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background: ${isComplete ? 'rgba(34, 197, 94, 0.2)' : habitColor + '33'}; border: 1px solid ${isComplete ? 'rgba(34, 197, 94, 0.3)' : habitColor + '55'}; color: ${isComplete ? '#22c55e' : habitColor};">
          ${habit.icon}
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-1">
            <h3 class="font-semibold truncate ${isComplete ? 'line-through' : ''}" style="color: ${isComplete ? '#6b7280' : '#e5e7eb'};">
              ${habit.title}
            </h3>
            ${streak > 0 ? `
              <div class="flex items-center gap-1 px-2 py-1 rounded-full ${streak >= 7 ? 'streak-glow' : ''}" style="background: rgba(251, 146, 60, 0.2); border: 1px solid rgba(251, 146, 60, 0.3);">
                <span class="text-xs font-bold" style="color: #fb923c;">${streak}</span>
                <span class="text-sm">🔥</span>
              </div>
            ` : ''}
          </div>
          
          ${habit.description ? `
            <p class="text-xs mb-2" style="color: #6b7280;">${habit.description}</p>
          ` : ''}
          
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs px-2 py-1 rounded-full" style="background: rgba(99, 102, 241, 0.1); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.2);">
              ${habitType === 'task' ? '✓ Aufgabe' : habitType === 'count' ? '# Zählen' : habitType === 'time' ? '⏱ Zeit' : '💪 Sport'}
            </span>
            <span class="text-xs" style="color: #9ca3af;">
              ${getIntervalText(habit.interval_type, habit.interval_days)}
            </span>
          </div>
          
          ${habitType !== 'task' ? `
            <div class="mb-2">
              <span class="text-sm font-mono font-semibold" style="color: #e5e7eb;">${displayValue}</span>
              <span class="text-xs ml-1" style="color: #6b7280;">${habit.goal_unit}</span>
            </div>
          ` : ''}
          
          <div class="flex items-center gap-3">
            <div class="flex-1 h-2 rounded-full" style="background: rgba(255, 255, 255, 0.05);">
              <div class="progress-bar h-full rounded-full" style="width: ${Math.min(100, progress)}%; background: ${isComplete ? '#22c55e' : habitColor};"></div>
            </div>
            <span class="text-sm font-semibold" style="color: ${isComplete ? '#22c55e' : habitColor};">${Math.round(progress)}%</span>
          </div>
          
          ${canEdit ? `
            <div class="flex gap-2 mt-3" onclick="event.stopPropagation();">
              ${habitType === 'task' ? `
                <button class="btn flex-1 py-2 rounded-lg text-sm font-medium text-white" style="background: ${isComplete ? 'rgba(255, 255, 255, 0.1)' : '#22c55e'};" onclick="toggleHabitComplete('${habit.id}')">
                  ${isComplete ? 'Zurücksetzen' : 'Als erledigt markieren'}
                </button>
              ` : habitType === 'sport' ? `
                <button class="btn flex-1 py-2 rounded-lg text-sm font-medium text-white" style="background: #f97316;" onclick="navigateToWorkout('${habit.workout_id}')">
                  Workout starten
                </button>
                <button class="btn flex-1 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1" style="background: ${isComplete ? 'rgba(255, 255, 255, 0.1)' : '#22c55e'};" onclick="toggleHabitComplete('${habit.id}')">
                  ${isComplete ? `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  ` : `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  `}
                </button>
              ` : habitType === 'count' ? `
                <button class="btn flex-1 py-2 rounded-lg text-sm font-medium" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);" onclick="adjustProgress('${habit.id}', -1)">
                  - 1
                </button>
                <button class="btn flex-1 py-2 rounded-lg text-sm font-medium text-white" style="background: #22c55e;" onclick="adjustProgress('${habit.id}', 1)">
                  + 1
                </button>
              ` : `
                <button class="btn flex-1 py-2 rounded-lg text-sm font-medium" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);" onclick="adjustTime('${habit.id}', -5)">
                  - 5 min
                </button>
                <button class="btn flex-1 py-2 rounded-lg text-sm font-medium text-white" style="background: #22c55e;" onclick="adjustTime('${habit.id}', 5)">
                  + 5 min
                </button>
                <button class="btn py-2 px-3 rounded-lg text-sm font-medium text-white" style="background: #6366f1;" onclick="adjustTime('${habit.id}', 30)">
                  + 30
                </button>
              `}
            </div>
          ` : `
            <div class="mt-3 text-center">
              <span class="text-xs px-3 py-2 rounded-lg inline-block" style="background: rgba(255, 255, 255, 0.05); color: #6b7280;">
                ${editMessage}
              </span>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderTodos() {
  const container = document.getElementById('todos-container');
  const emptyState = document.getElementById('empty-todos');
  
  const todos = items.filter(i => i.type === 'todo');
  
  if (todos.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    const dateA = parseDate(a.due_date);
    const dateB = parseDate(b.due_date);
    
    if (dateA && dateB) {
      return dateA - dateB;
    }
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  container.innerHTML = sortedTodos.map(todo => createTodoCard(todo)).join('');
}

function createTodoCard(todo) {
  const overdue = isOverdue(todo.due_date) && !todo.completed;
  const priorityColors = {
    low: { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
    medium: { bg: 'rgba(251, 146, 60, 0.2)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' },
    high: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' }
  };
  const color = priorityColors[todo.priority];
  
  return `
    <div class="card p-4 rounded-2xl cursor-pointer ${overdue ? 'ring-2' : ''}" style="background: rgba(30, 30, 30, 0.5); border: 1px solid ${overdue ? '#ef4444' : 'rgba(255, 255, 255, 0.05)'};" onclick="openEditTodoModal('${todo.id}')">
      <div class="flex items-start gap-4">
        <button class="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" 
          style="background: ${todo.completed ? '#22c55e' : 'rgba(255, 255, 255, 0.05)'}; border: 2px solid ${todo.completed ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'};"
          onclick="event.stopPropagation(); toggleTodoComplete('${todo.id}')">
          ${todo.completed ? `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ` : ''}
        </button>
        
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold mb-1 ${todo.completed ? 'line-through' : ''}" style="color: ${todo.completed ? '#6b7280' : overdue ? '#ef4444' : '#e5e7eb'};">
            ${todo.title}
          </h3>
          
          <div class="flex items-center gap-2 flex-wrap">
            ${todo.due_date ? `
              <span class="text-xs px-2 py-1 rounded-full" style="background: ${overdue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; color: ${overdue ? '#ef4444' : '#9ca3af'}; border: 1px solid ${overdue ? 'rgba(239, 68, 68, 0.3)' : 'transparent'};">
                📅 ${formatDate(todo.due_date)}
              </span>
            ` : ''}
            
            <span class="text-xs px-2 py-1 rounded-full font-medium" style="background: ${color.bg}; color: ${color.text}; border: 1px solid ${color.border};">
              ${todo.priority === 'low' ? 'Niedrig' : todo.priority === 'medium' ? 'Mittel' : 'Hoch'}
            </span>
            
            ${todo.repeat_type !== 'none' ? `
              <span class="text-xs px-2 py-1 rounded-full" style="background: rgba(255, 255, 255, 0.05); color: #9ca3af;">
                🔁 ${todo.repeat_type === 'daily' ? 'Täglich' : todo.repeat_type === 'weekly' ? 'Wöchentlich' : 'Monatlich'}
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function getIntervalText(intervalType, intervalDays) {
  switch (intervalType) {
    case 'daily': return 'Täglich';
    case 'weekly': return 'Wöchentlich';
    case 'monthly': return 'Monatlich';
    case 'custom': return `Alle ${intervalDays || 2} Tage`;
    default: return 'Täglich';
  }
}

function updateDate() {
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const dateStr = new Date().toLocaleDateString('de-DE', options);
  document.getElementById('date-display').textContent = dateStr;
}

// ===== MODAL HANDLING =====

function openHabitModal() {
  editingItemId = null;
  selectedHabitIcon = 0;
  selectedHabitColor = '#6366f1';
  selectedHabitType = 'task';
  selectedDailyDays = [1, 2, 3, 4, 5, 6, 0];
  
  document.getElementById('habit-modal-title').textContent = 'Neuer Habit';
  document.getElementById('habit-title').value = '';
  document.getElementById('habit-description').value = '';
  document.getElementById('habit-interval').value = 'daily';
  document.getElementById('habit-custom-days').value = '2';
  document.getElementById('habit-goal-value').value = '1';
  document.getElementById('habit-goal-unit').value = 'mal';
  document.getElementById('habit-end-date').value = '';
  document.getElementById('habit-workout-id').value = '';
  document.getElementById('habit-workout-text').innerText = 'Workout wählen...';
  document.getElementById('habit-workout-text').classList.add('text-gray-400');
  document.getElementById('habit-workout-text').classList.remove('text-white');
  document.getElementById('delete-habit-btn').classList.add('hidden');
  document.getElementById('habit-custom-interval').classList.add('hidden');
  document.getElementById('habit-daily-days').classList.remove('hidden');
  
  updateHabitTypeButtons();
  updateGoalSection();
  updateWorkoutSection();
  renderHabitIconPicker();
  renderHabitColorPicker();
  updateDailyDaysButtons();
  document.getElementById('habit-modal').classList.remove('hidden');
}

function openEditHabitModal(id) {
  const habit = items.find(i => i.id === id);
  if (!habit) return;
  
  editingItemId = id;
  selectedHabitIcon = habitIcons.indexOf(habit.icon);
  if (selectedHabitIcon === -1) selectedHabitIcon = 0;
  selectedHabitColor = habit.color || '#6366f1';
  selectedHabitType = habit.habit_type || 'task';
  selectedDailyDays = habit.daily_days ? JSON.parse(habit.daily_days) : [1, 2, 3, 4, 5, 6, 0];
  
  document.getElementById('habit-modal-title').textContent = 'Habit bearbeiten';
  document.getElementById('habit-title').value = habit.title;
  document.getElementById('habit-description').value = habit.description || '';
  document.getElementById('habit-interval').value = habit.interval_type;
  document.getElementById('habit-custom-days').value = habit.interval_days || '2';
  document.getElementById('habit-goal-value').value = habit.goal_value;
  document.getElementById('habit-goal-unit').value = habit.goal_unit;
  document.getElementById('habit-end-date').value = habit.end_date || '';
  document.getElementById('habit-workout-id').value = habit.workout_id || '';
  
  // Set workout text if sport type
  if (habit.habit_type === 'sport' && habit.workout_id) {
    const workouts = JSON.parse(localStorage.getItem('habitus_sport_workouts') || '[]');
    const workout = workouts.find(w => w.id === habit.workout_id);
    if (workout) {
      document.getElementById('habit-workout-text').innerText = workout.name;
      document.getElementById('habit-workout-text').classList.remove('text-gray-400');
      document.getElementById('habit-workout-text').classList.add('text-white');
    }
  }
  
  document.getElementById('delete-habit-btn').classList.remove('hidden');
  
  if (habit.interval_type === 'custom') {
    document.getElementById('habit-custom-interval').classList.remove('hidden');
    document.getElementById('habit-daily-days').classList.add('hidden');
  } else if (habit.interval_type === 'daily') {
    document.getElementById('habit-custom-interval').classList.add('hidden');
    document.getElementById('habit-daily-days').classList.remove('hidden');
  } else {
    document.getElementById('habit-custom-interval').classList.add('hidden');
    document.getElementById('habit-daily-days').classList.add('hidden');
  }
  
  updateHabitTypeButtons();
  updateGoalSection();
  renderHabitIconPicker();
  renderHabitColorPicker();
  updateDailyDaysButtons();
  document.getElementById('habit-modal').classList.remove('hidden');
}

function openTodoModal() {
  editingItemId = null;
  selectedTodoPriority = 'medium';
  
  const tomorrow = addDays(getTodayDate(), 1);
  
  document.getElementById('todo-modal-title').textContent = 'Neue Aufgabe';
  document.getElementById('todo-title').value = '';
  document.getElementById('todo-due-date').value = dateToString(tomorrow);
  document.getElementById('todo-repeat').value = 'none';
  document.getElementById('delete-todo-btn').classList.add('hidden');
  
  updatePriorityButtons();
  document.getElementById('todo-modal').classList.remove('hidden');
}

function openEditTodoModal(id) {
  const todo = items.find(i => i.id === id);
  if (!todo) return;
  
  editingItemId = id;
  selectedTodoPriority = todo.priority;
  
  document.getElementById('todo-modal-title').textContent = 'Aufgabe bearbeiten';
  document.getElementById('todo-title').value = todo.title;
  document.getElementById('todo-due-date').value = todo.due_date || '';
  document.getElementById('todo-repeat').value = todo.repeat_type;
  document.getElementById('delete-todo-btn').classList.remove('hidden');
  
  updatePriorityButtons();
  document.getElementById('todo-modal').classList.remove('hidden');
}

function closeModals() {
  document.getElementById('habit-modal').classList.add('hidden');
  document.getElementById('todo-modal').classList.add('hidden');
  document.getElementById('habit-delete-modal').classList.add('hidden');
  document.getElementById('todo-delete-modal').classList.add('hidden');
}

function renderHabitIconPicker() {
  const picker = document.getElementById('habit-icon-picker');
  picker.innerHTML = habitIcons.map((icon, index) => `
    <button type="button" class="icon-btn w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all" 
      style="background: ${selectedHabitIcon === index ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; border: 2px solid ${selectedHabitIcon === index ? '#6366f1' : 'transparent'}; color: ${selectedHabitIcon === index ? '#a5b4fc' : '#9ca3af'};"
      onclick="selectHabitIcon(${index})">
      ${icon}
    </button>
  `).join('');
}

function renderHabitColorPicker() {
  const picker = document.getElementById('habit-color-picker');
  picker.innerHTML = habitColors.map((color) => `
    <button type="button" class="w-10 h-10 rounded-xl transition-all" 
      style="background: ${color}; border: 3px solid ${selectedHabitColor === color ? '#ffffff' : 'transparent'}; opacity: ${selectedHabitColor === color ? '1' : '0.7'};"
      onclick="selectHabitColor('${color}')">
    </button>
  `).join('');
}

function selectHabitIcon(index) {
  selectedHabitIcon = index;
  renderHabitIconPicker();
}

function selectHabitColor(color) {
  selectedHabitColor = color;
  renderHabitColorPicker();
}

function toggleDailyDay(day) {
  const index = selectedDailyDays.indexOf(day);
  if (index > -1) {
    if (selectedDailyDays.length > 1) {
      selectedDailyDays.splice(index, 1);
    }
  } else {
    selectedDailyDays.push(day);
  }
  updateDailyDaysButtons();
}

function updateDailyDaysButtons() {
  document.querySelectorAll('.daily-day-btn').forEach(btn => {
    const day = parseInt(btn.dataset.day);
    const isSelected = selectedDailyDays.includes(day);
    
    if (isSelected) {
      btn.style.border = '2px solid ' + selectedHabitColor;
      btn.style.background = selectedHabitColor + '33';
      btn.style.color = selectedHabitColor;
    } else {
      btn.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      btn.style.background = 'rgba(255, 255, 255, 0.05)';
      btn.style.color = '#6b7280';
    }
  });
}

function selectHabitType(type) {
  selectedHabitType = type;
  updateHabitTypeButtons();
  updateGoalSection();
  updateWorkoutSection();
}

function updateHabitTypeButtons() {
  document.querySelectorAll('.habit-type-chip').forEach(btn => {
    const type = btn.dataset.habitType;
    const isSelected = type === selectedHabitType;
    
    if (isSelected) {
      btn.style.border = '2px solid';
      if (type === 'task') {
        btn.style.borderColor = '#6366f1';
        btn.style.background = 'rgba(99, 102, 241, 0.2)';
        btn.style.color = '#a5b4fc';
      } else if (type === 'count') {
        btn.style.borderColor = '#22c55e';
        btn.style.background = 'rgba(34, 197, 94, 0.2)';
        btn.style.color = '#4ade80';
      } else if (type === 'time') {
        btn.style.borderColor = '#fb923c';
        btn.style.background = 'rgba(251, 146, 60, 0.2)';
        btn.style.color = '#fb923c';
      } else if (type === 'sport') {
        btn.style.borderColor = '#f97316';
        btn.style.background = 'rgba(249, 115, 22, 0.2)';
        btn.style.color = '#f97316';
      }
    } else {
      btn.style.border = '1px solid';
      if (type === 'task') {
        btn.style.borderColor = 'rgba(99, 102, 241, 0.3)';
        btn.style.background = 'rgba(99, 102, 241, 0.2)';
        btn.style.color = '#a5b4fc';
      } else if (type === 'count') {
        btn.style.borderColor = 'rgba(34, 197, 94, 0.3)';
        btn.style.background = 'rgba(34, 197, 94, 0.2)';
        btn.style.color = '#4ade80';
      } else if (type === 'time') {
        btn.style.borderColor = 'rgba(251, 146, 60, 0.3)';
        btn.style.background = 'rgba(251, 146, 60, 0.2)';
        btn.style.color = '#fb923c';
      } else if (type === 'sport') {
        btn.style.borderColor = 'rgba(249, 115, 22, 0.3)';
        btn.style.background = 'rgba(249, 115, 22, 0.2)';
        btn.style.color = '#f97316';
      }
    }
  });
}

function updateGoalSection() {
  const goalSection = document.getElementById('habit-goal-section');
  const goalValue = document.getElementById('habit-goal-value');
  const goalUnit = document.getElementById('habit-goal-unit');
  
  if (selectedHabitType === 'task' || selectedHabitType === 'sport') {
    goalSection.classList.add('hidden');
  } else {
    goalSection.classList.remove('hidden');
    
    if (selectedHabitType === 'count') {
      goalUnit.innerHTML = `
        <option value="mal">× (mal)</option>
        <option value="seiten">Seiten</option>
        <option value="km">Kilometer</option>
        <option value="liter">Liter</option>
        <option value="stk">Stück</option>
        <option value="kcal">Kalorien</option>
        <option value="schritte">Schritte</option>
      `;
      goalValue.value = '10';
    } else if (selectedHabitType === 'time') {
      goalUnit.innerHTML = `
        <option value="min">Minuten</option>
      `;
      goalValue.value = '30';
    }
  }
}

function selectPriority(priority) {
  selectedTodoPriority = priority;
  updatePriorityButtons();
}

function updatePriorityButtons() {
  document.querySelectorAll('.priority-chip').forEach(btn => {
    const priority = btn.dataset.priority;
    const isSelected = priority === selectedTodoPriority;
    
    if (isSelected) {
      btn.style.border = '2px solid';
      if (priority === 'low') btn.style.borderColor = '#60a5fa';
      else if (priority === 'medium') btn.style.borderColor = '#fb923c';
      else btn.style.borderColor = '#ef4444';
    } else {
      btn.style.border = '1px solid';
      if (priority === 'low') btn.style.borderColor = 'rgba(59, 130, 246, 0.3)';
      else if (priority === 'medium') btn.style.borderColor = 'rgba(251, 146, 60, 0.3)';
      else btn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    }
  });
}

// ===== EVENT HANDLERS =====

document.getElementById('habit-interval').onchange = function() {
  const customInterval = document.getElementById('habit-custom-interval');
  const dailyDays = document.getElementById('habit-daily-days');
  
  if (this.value === 'custom') {
    customInterval.classList.remove('hidden');
    dailyDays.classList.add('hidden');
  } else if (this.value === 'daily') {
    customInterval.classList.add('hidden');
    dailyDays.classList.remove('hidden');
  } else {
    customInterval.classList.add('hidden');
    dailyDays.classList.add('hidden');
  }
};

function saveHabit() {
  const title = document.getElementById('habit-title').value.trim();
  if (!title) {
    showToast('Bitte gib einen Titel ein', 'error');
    return;
  }
  
  // Validierung für Sport-Typ: Workout muss ausgewählt sein
  if (selectedHabitType === 'sport') {
    const workoutIdElement = document.getElementById('habit-workout-id');
    if (!workoutIdElement) {
      console.error('habit-workout-id Element nicht gefunden!');
      showToast('Fehler beim Speichern', 'error');
      return;
    }
    const workoutId = workoutIdElement.value;
    if (!workoutId || workoutId === '') {
      showToast('Bitte wähle ein Workout aus', 'error');
      return;
    }
  }
  
  const intervalType = document.getElementById('habit-interval').value;
  const intervalDays = intervalType === 'custom' ? document.getElementById('habit-custom-days').value : '';
  
  const habitData = {
    type: 'habit',
    habit_type: selectedHabitType,
    title,
    description: document.getElementById('habit-description').value.trim(),
    icon: habitIcons[selectedHabitIcon],
    color: selectedHabitColor,
    interval_type: intervalType,
    interval_days: intervalDays,
    daily_days: JSON.stringify(selectedDailyDays),
    goal_value: selectedHabitType === 'task' || selectedHabitType === 'sport' ? 1 : (parseInt(document.getElementById('habit-goal-value').value) || 1),
    goal_unit: (selectedHabitType === 'task' || selectedHabitType === 'sport') ? 'mal' : document.getElementById('habit-goal-unit').value,
    end_date: document.getElementById('habit-end-date').value || '',
    last_reset: getToday()
  };
  
  // Add workout_id for sport type
  if (selectedHabitType === 'sport') {
    const workoutIdElement = document.getElementById('habit-workout-id');
    habitData.workout_id = workoutIdElement ? workoutIdElement.value : '';
  } else {
    habitData.workout_id = '';
  }
  
  if (editingItemId) {
    const index = items.findIndex(i => i.id === editingItemId);
    if (index !== -1) {
      items[index] = { ...items[index], ...habitData };
    }
  } else {
    items.push({
      id: generateId(),
      ...habitData,
      progress_today: 0,
      current_value: 0,
      streak: 0,
      best_streak: 0,
      start_date: getToday(),
      completions: JSON.stringify([]),
      daily_progress: JSON.stringify({}),
      weekly_progress: JSON.stringify({}),
      monthly_progress: JSON.stringify({})
    });
  }
  
  saveToLocalStorage();
  showToast(editingItemId ? 'Habit aktualisiert!' : 'Habit erstellt!');
  closeModals();
  renderAll();
}

function saveTodo() {
  const title = document.getElementById('todo-title').value.trim();
  if (!title) {
    showToast('Bitte gib einen Titel ein', 'error');
    return;
  }
  
  const todoData = {
    type: 'todo',
    title,
    due_date: document.getElementById('todo-due-date').value || '',
    priority: selectedTodoPriority,
    repeat_type: document.getElementById('todo-repeat').value
  };
  
  if (editingItemId) {
    const index = items.findIndex(i => i.id === editingItemId);
    if (index !== -1) {
      items[index] = { ...items[index], ...todoData };
    }
  } else {
    items.push({
      id: generateId(),
      ...todoData,
      completed: false
    });
  }
  
  saveToLocalStorage();
  showToast(editingItemId ? 'Todo aktualisiert!' : 'Todo erstellt!');
  closeModals();
  renderAll();
}

function toggleHabitComplete(id) {
  const habit = items.find(i => i.id === id);
  if (!habit) return;

  // Determine previous completion status for the selected date/week/month
  let prevComplete = false;
  if (habit.interval_type === 'weekly') {
    const weekKey = dateToString(getWeekStart(selectedDate));
    const weeklyProgress = habit.weekly_progress ? JSON.parse(habit.weekly_progress) : {};
    const weekData = weeklyProgress[weekKey] || { value: 0, progress: 0 };
    prevComplete = weekData.progress >= 100;

    const isComplete = weekData.progress >= 100;
    const newProgress = isComplete ? 0 : 100;

    weeklyProgress[weekKey] = { value: 0, progress: newProgress };
    habit.weekly_progress = JSON.stringify(weeklyProgress);

    const today = getTodayDate();
    if (dateToString(getWeekStart(today)) === weekKey) {
      habit.progress_today = newProgress;
    }
  } else if (habit.interval_type === 'monthly') {
    const monthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
    const monthlyProgress = habit.monthly_progress ? JSON.parse(habit.monthly_progress) : {};
    const monthData = monthlyProgress[monthKey] || { value: 0, progress: 0 };
    prevComplete = monthData.progress >= 100;

    const isComplete = monthData.progress >= 100;
    const newProgress = isComplete ? 0 : 100;

    monthlyProgress[monthKey] = { value: 0, progress: newProgress };
    habit.monthly_progress = JSON.stringify(monthlyProgress);

    const today = getTodayDate();
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    if (monthKey === currentMonthKey) {
      habit.progress_today = newProgress;
    }
  } else {
    const dateKey = dateToString(selectedDate);
    const dailyProgress = habit.daily_progress ? JSON.parse(habit.daily_progress) : {};
    const dayData = dailyProgress[dateKey] || { value: 0, progress: 0 };
    prevComplete = dayData.progress >= 100;

    const isComplete = dayData.progress >= 100;
    const newProgress = isComplete ? 0 : 100;

    dailyProgress[dateKey] = { value: 0, progress: newProgress };
    habit.daily_progress = JSON.stringify(dailyProgress);

    const today = getTodayDate();
    if (isSameDay(selectedDate, today)) {
      habit.progress_today = newProgress;
    }
  }

  // XP award if newly completed
  const nowComplete = (habit.interval_type === 'weekly' && JSON.parse(habit.weekly_progress || '{}')[dateToString(getWeekStart(selectedDate))]?.progress >= 100) ||
                      (habit.interval_type === 'monthly' && JSON.parse(habit.monthly_progress || '{}')[`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`]?.progress >= 100) ||
                      (habit.interval_type !== 'weekly' && habit.interval_type !== 'monthly' && JSON.parse(habit.daily_progress || '{}')[dateToString(selectedDate)]?.progress >= 100);

  if (!prevComplete && nowComplete) {
    if (typeof awardHabitXP === 'function') {
      awardHabitXP(habit.id);
    }
  }

  // Update individual habit streak using streak-system helper if available
  if (typeof getHabitStreak === 'function') {
    try {
      habit.streak = getHabitStreak(habit);
    } catch (e) {
      // ignore if structure differs
    }
  }

  // Existing streak adjustment for today (keep current behavior)
  let newStreak = habit.streak || 0;
  let newBestStreak = habit.best_streak || 0;
  const today = getTodayDate();

  if (isSameDay(selectedDate, today)) {
    const wasComplete = prevComplete;
    const isNowComplete = nowComplete;

    if (!wasComplete && isNowComplete) {
      newStreak += 1;
      newBestStreak = Math.max(newBestStreak, newStreak);
    } else if (wasComplete && !isNowComplete) {
      newStreak = 0;
    }
  }

  habit.streak = newStreak;
  habit.best_streak = newBestStreak;

  saveToLocalStorage();
  renderAll();

  if (typeof updateDailyStreak === 'function') {
    updateDailyStreak();
  }
}

function adjustProgress(id, delta) {
  const habit = items.find(i => i.id === id);
  if (!habit) return;
  
  let newValue, newProgress, wasComplete;
  
  if (habit.interval_type === 'weekly') {
    const weekKey = dateToString(getWeekStart(selectedDate));
    const weeklyProgress = habit.weekly_progress ? JSON.parse(habit.weekly_progress) : {};
    const weekData = weeklyProgress[weekKey] || { value: 0, progress: 0 };
    
    const currentValue = weekData.value || 0;
    newValue = Math.max(0, currentValue + delta);
    newProgress = (newValue / habit.goal_value) * 100;
    wasComplete = weekData.progress >= 100;
    
    weeklyProgress[weekKey] = { value: newValue, progress: newProgress };
    habit.weekly_progress = JSON.stringify(weeklyProgress);
    
    const today = getTodayDate();
    if (dateToString(getWeekStart(today)) === weekKey) {
      habit.current_value = newValue;
      habit.progress_today = newProgress;
    }
  } else if (habit.interval_type === 'monthly') {
    const monthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
    const monthlyProgress = habit.monthly_progress ? JSON.parse(habit.monthly_progress) : {};
    const monthData = monthlyProgress[monthKey] || { value: 0, progress: 0 };
    
    const currentValue = monthData.value || 0;
    newValue = Math.max(0, currentValue + delta);
    newProgress = (newValue / habit.goal_value) * 100;
    wasComplete = monthData.progress >= 100;
    
    monthlyProgress[monthKey] = { value: newValue, progress: newProgress };
    habit.monthly_progress = JSON.stringify(monthlyProgress);
    
    const today = getTodayDate();
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    if (monthKey === currentMonthKey) {
      habit.current_value = newValue;
      habit.progress_today = newProgress;
    }
  } else {
    const dateKey = dateToString(selectedDate);
    const dailyProgress = habit.daily_progress ? JSON.parse(habit.daily_progress) : {};
    const dayData = dailyProgress[dateKey] || { value: 0, progress: 0 };
    
    const currentValue = dayData.value || 0;
    newValue = Math.max(0, currentValue + delta);
    newProgress = (newValue / habit.goal_value) * 100;
    wasComplete = dayData.progress >= 100;
    
    dailyProgress[dateKey] = { value: newValue, progress: newProgress };
    habit.daily_progress = JSON.stringify(dailyProgress);
    
    const today = getTodayDate();
    if (isSameDay(selectedDate, today)) {
      habit.current_value = newValue;
      habit.progress_today = newProgress;
    }
  }
  
  const isNowComplete = newProgress >= 100;
  
  let newStreak = habit.streak || 0;
  let newBestStreak = habit.best_streak || 0;
  const today = getTodayDate();
  
  if (isSameDay(selectedDate, today)) {
    if (!wasComplete && isNowComplete) {
      newStreak += 1;
      newBestStreak = Math.max(newBestStreak, newStreak);
    } else if (wasComplete && !isNowComplete) {
      newStreak = 0;
    }
  }
  
  habit.streak = newStreak;
  habit.best_streak = newBestStreak;
  
  saveToLocalStorage();
  renderAll();
}

function adjustTime(id, minutes) {
  adjustProgress(id, minutes);
}

function toggleTodoComplete(id) {
  const todo = items.find(i => i.id === id);
  if (!todo) return;

  const wasCompleted = todo.completed;
  todo.completed = !todo.completed;

  if (todo.completed) {
    todo.completedDate = getToday();
    if (!wasCompleted && typeof awardTodoXP === 'function') {
      awardTodoXP(todo.id);
    }
  } else {
    delete todo.completedDate;
  }

  saveToLocalStorage();
  renderAll();

  if (typeof updateDailyStreak === 'function') {
    updateDailyStreak();
  }
}

function confirmDeleteHabit() {
  document.getElementById('habit-delete-modal').classList.remove('hidden');
}

function cancelDeleteHabit() {
  document.getElementById('habit-delete-modal').classList.add('hidden');
}

function executeDeleteHabit() {
  if (!editingItemId) return;
  
  items = items.filter(i => i.id !== editingItemId);
  
  saveToLocalStorage();
  showToast('Habit gelöscht');
  closeModals();
  renderAll();
}

function confirmDeleteTodo() {
  document.getElementById('todo-delete-modal').classList.remove('hidden');
}

function cancelDeleteTodo() {
  document.getElementById('todo-delete-modal').classList.add('hidden');
}

function executeDeleteTodo() {
  if (!editingItemId) return;
  
  items = items.filter(i => i.id !== editingItemId);
  
  saveToLocalStorage();
  showToast('Todo gelöscht');
  closeModals();
  renderAll();
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.background = type === 'error' ? '#ef4444' : '#22c55e';
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-10px)';
  }, 2500);
}

// ===== CONFIG & INITIALIZATION =====

async function onConfigChange(cfg) {
  config = { ...defaultConfig, ...cfg };
  
  const titleElement = document.getElementById('app-title');
  titleElement.textContent = config.app_title || defaultConfig.app_title;
  titleElement.style.fontFamily = "'Poppins', sans-serif";
  document.getElementById('empty-habits-message').textContent = config.empty_habits_message || defaultConfig.empty_habits_message;
  document.getElementById('empty-todos-message').textContent = config.empty_todos_message || defaultConfig.empty_todos_message;
}

function mapToCapabilities(cfg) {
  return {
    recolorables: [],
    borderables: [],
    fontEditable: undefined,
    fontSizeable: undefined
  };
}

function mapToEditPanelValues(cfg) {
  return new Map([
    ['app_title', cfg.app_title || defaultConfig.app_title],
    ['empty_habits_message', cfg.empty_habits_message || defaultConfig.empty_habits_message],
    ['empty_todos_message', cfg.empty_todos_message || defaultConfig.empty_todos_message]
  ]);
}

// Initialize
(function init() {
  updateDate();
  loadFromLocalStorage();
  
  if (window.elementSdk) {
    window.elementSdk.init({
      defaultConfig,
      onConfigChange,
      mapToCapabilities,
      mapToEditPanelValues
    });
  }
  
  checkAndResetItems();
  setInterval(checkAndResetItems, 60000);

  // --- HIER DIE KORREKTUR ---

  // 1. Logik für die Anzeige der Tage (Intervall-Wechsel)
  const intervalSelect = document.getElementById('habit-interval');
  const dailyDaysSection = document.getElementById('habit-daily-days');
  const customIntervalSection = document.getElementById('habit-custom-interval');

  if (intervalSelect) {
    intervalSelect.addEventListener('change', function() {
      if (this.value === 'daily') {
        dailyDaysSection.classList.remove('hidden');
        customIntervalSection.classList.add('hidden');
      } else if (this.value === 'custom') {
        customIntervalSection.classList.remove('hidden');
        dailyDaysSection.classList.add('hidden');
      } else {
        dailyDaysSection.classList.add('hidden');
        customIntervalSection.classList.add('hidden');
      }
    });
  }

  // 2. Logik für die Farbauswahl (Damit die Buttons im Modal erscheinen)
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4'];
  const colorPicker = document.getElementById('habit-color-picker');
  if (colorPicker) {
    colorPicker.innerHTML = colors.map(c => `
      <button type="button" 
        onclick="window.selectedHabitColor='${c}'; this.parentElement.querySelectorAll('button').forEach(b=>b.style.borderColor='transparent'); this.style.borderColor='white';" 
        class="w-8 h-8 rounded-full border-2 border-transparent transition-all" 
        style="background-color: ${c}">
      </button>
    `).join('');
  }

  // --- ENDE DER KORREKTUR ---

  renderAll();

  // Initialize streak system UI on load if available
  if (typeof initStreakSystem === 'function') {
    try {
      initStreakSystem();
      if (typeof updateStreakDisplay === 'function') updateStreakDisplay();
      if (typeof updateDailyStreak === 'function') updateDailyStreak();
    } catch (e) {
      console.error('Streak system init error:', e);
    }
  }
})();


// ===== ICON & COLOR PICKER RENDERING =====

function renderHabitIconPicker() {
  const picker = document.getElementById('habit-icon-picker');
  picker.innerHTML = habitIcons.map((icon, index) => `
    <button type="button" class="icon-btn w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all" 
      style="background: ${selectedHabitIcon === index ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; border: 2px solid ${selectedHabitIcon === index ? '#6366f1' : 'transparent'}; color: ${selectedHabitIcon === index ? '#a5b4fc' : '#9ca3af'};"
      onclick="selectHabitIcon(${index})">
      ${icon}
    </button>
  `).join('');
}

function renderHabitColorPicker() {
  const picker = document.getElementById('habit-color-picker');
  picker.innerHTML = habitColors.map((color) => `
    <button type="button" class="w-10 h-10 rounded-xl transition-all" 
      style="background: ${color}; border: 3px solid ${selectedHabitColor === color ? '#ffffff' : 'transparent'}; opacity: ${selectedHabitColor === color ? '1' : '0.7'};"
      onclick="selectHabitColor('${color}')">
    </button>
  `).join('');
}

function selectHabitIcon(index) {
  selectedHabitIcon = index;
  renderHabitIconPicker();
}

function selectHabitColor(color) {
  selectedHabitColor = color;
  renderHabitColorPicker();
}

function toggleDailyDay(day) {
  const index = selectedDailyDays.indexOf(day);
  if (index > -1) {
    if (selectedDailyDays.length > 1) {
      selectedDailyDays.splice(index, 1);
    }
  } else {
    selectedDailyDays.push(day);
  }
  updateDailyDaysButtons();
}

function updateDailyDaysButtons() {
  document.querySelectorAll('.daily-day-btn').forEach(btn => {
    const day = parseInt(btn.dataset.day);
    const isSelected = selectedDailyDays.includes(day);
    
    if (isSelected) {
      btn.style.border = '2px solid ' + selectedHabitColor;
      btn.style.background = selectedHabitColor + '33';
      btn.style.color = selectedHabitColor;
    } else {
      btn.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      btn.style.background = 'rgba(255, 255, 255, 0.05)';
      btn.style.color = '#6b7280';
    }
  });
}

function selectHabitType(type) {
  selectedHabitType = type;
  updateHabitTypeButtons();
  updateGoalSection();
  updateWorkoutSection();
}

function updateHabitTypeButtons() {
  document.querySelectorAll('.habit-type-chip').forEach(btn => {
    const type = btn.dataset.habitType;
    const isSelected = type === selectedHabitType;
    
    if (isSelected) {
      btn.style.border = '2px solid';
      if (type === 'task') {
        btn.style.borderColor = '#6366f1';
        btn.style.background = 'rgba(99, 102, 241, 0.2)';
        btn.style.color = '#a5b4fc';
      } else if (type === 'count') {
        btn.style.borderColor = '#22c55e';
        btn.style.background = 'rgba(34, 197, 94, 0.2)';
        btn.style.color = '#4ade80';
      } else if (type === 'time') {
        btn.style.borderColor = '#fb923c';
        btn.style.background = 'rgba(251, 146, 60, 0.2)';
        btn.style.color = '#fb923c';
      } else if (type === 'sport') {
        btn.style.borderColor = '#f97316';
        btn.style.background = 'rgba(249, 115, 22, 0.2)';
        btn.style.color = '#f97316';
      }
    } else {
      btn.style.border = '1px solid';
      if (type === 'task') {
        btn.style.borderColor = 'rgba(99, 102, 241, 0.3)';
        btn.style.background = 'rgba(99, 102, 241, 0.2)';
        btn.style.color = '#a5b4fc';
      } else if (type === 'count') {
        btn.style.borderColor = 'rgba(34, 197, 94, 0.3)';
        btn.style.background = 'rgba(34, 197, 94, 0.2)';
        btn.style.color = '#4ade80';
      } else if (type === 'time') {
        btn.style.borderColor = 'rgba(251, 146, 60, 0.3)';
        btn.style.background = 'rgba(251, 146, 60, 0.2)';
        btn.style.color = '#fb923c';
      } else if (type === 'sport') {
        btn.style.borderColor = 'rgba(249, 115, 22, 0.3)';
        btn.style.background = 'rgba(249, 115, 22, 0.2)';
        btn.style.color = '#f97316';
      }
    }
  });
}

function updateGoalSection() {
  const goalSection = document.getElementById('habit-goal-section');
  const goalValue = document.getElementById('habit-goal-value');
  const goalUnit = document.getElementById('habit-goal-unit');
  
  if (selectedHabitType === 'task' || selectedHabitType === 'sport') {
    goalSection.classList.add('hidden');
  } else {
    goalSection.classList.remove('hidden');
    
    if (selectedHabitType === 'count') {
      goalUnit.innerHTML = `
        <option value="mal">× (mal)</option>
        <option value="seiten">Seiten</option>
        <option value="km">Kilometer</option>
        <option value="liter">Liter</option>
        <option value="stk">Stück</option>
        <option value="kcal">Kalorien</option>
        <option value="schritte">Schritte</option>
      `;
      goalValue.value = '10';
    } else if (selectedHabitType === 'time') {
      goalUnit.innerHTML = `
        <option value="min">Minuten</option>
      `;
      goalValue.value = '30';
    }
  }
}

function selectPriority(priority) {
  selectedTodoPriority = priority;
  updatePriorityButtons();
}

function updatePriorityButtons() {
  document.querySelectorAll('.priority-chip').forEach(btn => {
    const priority = btn.dataset.priority;
    const isSelected = priority === selectedTodoPriority;
    
    if (isSelected) {
      btn.style.border = '2px solid';
      if (priority === 'low') btn.style.borderColor = '#60a5fa';
      else if (priority === 'medium') btn.style.borderColor = '#fb923c';
      else btn.style.borderColor = '#ef4444';
    } else {
      btn.style.border = '1px solid';
      if (priority === 'low') btn.style.borderColor = 'rgba(59, 130, 246, 0.3)';
      else if (priority === 'medium') btn.style.borderColor = 'rgba(251, 146, 60, 0.3)';
      else btn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    }
  });
}

// ===== SPORT HABIT TYPE FUNCTIONS =====

function updateWorkoutSection() {
  const workoutSection = document.getElementById('habit-workout-section');
  const goalSection = document.getElementById('habit-goal-section');
  
  if (selectedHabitType === 'sport') {
    workoutSection.classList.remove('hidden');
    goalSection.classList.add('hidden');
  } else {
    workoutSection.classList.add('hidden');
    // Let updateGoalSection handle the goalSection visibility
    if (selectedHabitType === 'task') {
      goalSection.classList.add('hidden');
    } else {
      goalSection.classList.remove('hidden');
    }
  }
}

function openWorkoutSelectorModal() {
  const workoutList = document.getElementById('workout-selector-list');
  
  // Get workouts from localStorage (from sport.js)
  const workouts = JSON.parse(localStorage.getItem('habitus_sport_workouts') || '[]');
  
  if (workouts.length === 0) {
    workoutList.innerHTML = '<p class="text-center text-gray-500 py-4">Keine Workouts vorhanden. Erstelle zuerst ein Workout auf der Sport-Seite.</p>';
  } else {
    workoutList.innerHTML = workouts.map(workout => `
      <button onclick="selectWorkout('${workout.id}', '${workout.name.replace(/'/g, "\\'")}')" 
        class="w-full p-4 rounded-2xl font-bold text-left bg-white/5 hover:bg-orange-500/20 text-white transition-all flex items-center gap-3 border border-white/10 hover:border-orange-500/50">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        <span>${workout.name}</span>
        <span class="ml-auto text-xs text-gray-500">${workout.blocks ? workout.blocks.length : 0} Blöcke</span>
      </button>
    `).join('');
  }
  
  document.getElementById('workout-selector-modal').classList.remove('hidden');
}

function closeWorkoutSelectorModal() {
  document.getElementById('workout-selector-modal').classList.add('hidden');
}

function selectWorkout(workoutId, workoutName) {
  document.getElementById('habit-workout-id').value = workoutId;
  document.getElementById('habit-workout-text').innerText = workoutName;
  document.getElementById('habit-workout-text').classList.remove('text-gray-400');
  document.getElementById('habit-workout-text').classList.add('text-white');
  closeWorkoutSelectorModal();
}

function navigateToWorkout(workoutId) {
  // Navigate to sport page and start the workout
  navigateToPage('sport');
  
  // Small delay to ensure page is loaded
  setTimeout(() => {
    if (typeof startWorkout === 'function') {
      // Convert workoutId to number if it's a string
      const id = typeof workoutId === 'string' ? parseInt(workoutId) : workoutId;
      startWorkout(id);
    }
  }, 100);
}
