// ===== STREAK & XP SYSTEM =====

// XP and Streak Constants
const XP_PER_HABIT = 10;
const XP_PER_TODO = 5;
const XP_FOR_ICE_STREAK = 100;

// Initialize streak data in localStorage
function initStreakSystem() {
  if (!localStorage.getItem('habitus_streak_data')) {
    const streakData = {
      totalStreak: 0,
      reserveXP: 0, // Accumulated XP stored as reserve, only used when needed
      iceStreaks: 0,
      weeklyCompletions: {}, // Format: { 'YYYY-MM-DD': { completed: true/false, isIce: false } }
      lastCheckDate: null
    };
    localStorage.setItem('habitus_streak_data', JSON.stringify(streakData));
  }
}

// Get streak data
function getStreakData() {
  return JSON.parse(localStorage.getItem('habitus_streak_data') || '{}');
}

// Save streak data
function saveStreakData(data) {
  localStorage.setItem('habitus_streak_data', JSON.stringify(data));
}

// Check if all daily tasks are completed for a given date
function checkDailyCompletion(dateStr) {
  const habits = items.filter(item => item.type === 'habit');
  const todos = items.filter(item => item.type === 'todo');
  const date = parseDate(dateStr);
  
  // Check daily habits (support app's naming)
  const dailyHabits = habits.filter(habit => {
    // Only check habits that are active on this date
    if (!isHabitActiveOnDate(habit, date)) return false;
    
    // Support different naming for interval
    const interval = habit.interval || habit.interval_type || 'daily';
    if (interval === 'daily') {
      // Check if this day is selected
      const dayOfWeek = date.getDay();
      const selectedDays = habit.selectedDays || habit.selectedDays === undefined ? habit.selectedDays : (habit.selectedDailyDays || habit.daily_days ? (Array.isArray(habit.selectedDailyDays) ? habit.selectedDailyDays : JSON.parse(habit.daily_days || '[]')) : null);
      if (selectedDays && !selectedDays.includes(dayOfWeek)) {
        return false;
      }
      return true;
    }
    
    return false;
  });
  
  // Check if all daily habits are completed
  const allDailyHabitsCompleted = dailyHabits.every(habit => {
    // Support habit.completions or app's daily_progress structure
    const dateKey = dateStr;
    if (habit.completions) {
      return habit.completions[dateKey] && habit.completions[dateKey].completed;
    }
    if (habit.daily_progress) {
      const daily = JSON.parse(habit.daily_progress || '{}');
      return daily[dateKey] && daily[dateKey].progress >= 100;
    }
    return false;
  });
  
  // Check todos that are due on or before this date
  const dueTodos = todos.filter(todo => {
    const due = todo.due_date || todo.dueDate;
    if (!due) return false;
    const dueDate = parseDate(due);
    return dueDate <= date;
  });
  
  const allDueTodosCompleted = dueTodos.every(todo => {
    return (todo.completedDate || todo.completed_date) && parseDate(todo.completedDate || todo.completed_date) <= date;
  });
  
  return {
    allCompleted: allDailyHabitsCompleted && allDueTodosCompleted,
    dailyHabitsCount: dailyHabits.length,
    dailyHabitsCompleted: dailyHabits.filter(h => {
      const dateKey = dateStr;
      if (h.completions) {
        return h.completions[dateKey] && h.completions[dateKey].completed;
      }
      if (h.daily_progress) {
        const daily = JSON.parse(h.daily_progress || '{}');
        return daily[dateKey] && daily[dateKey].progress >= 100;
      }
      return false;
    }).length,
    dueTodosCount: dueTodos.length,
    dueTodosCompleted: dueTodos.filter(t => (t.completedDate || t.completed_date) && parseDate(t.completedDate || t.completed_date) <= date).length
  };
}

// Helper function to check if a habit is active on a specific date
function isHabitActiveOnDate(habit, date) {
  // Support multiple naming conventions (createdAt / created_at)
  const created = habit.createdAt || habit.created_at;
  if (created) {
    const createdDate = parseDate(created);
    if (date < createdDate) return false;
  }

  const end = habit.endDate || habit.end_date;
  if (end) {
    const endDate = parseDate(end);
    if (date > endDate) return false;
  }

  return true;
}

// Award XP for completing a habit
function awardHabitXP(habitId) {
  // Add XP to reserve — will be used only when needed to save streaks
  const streakData = getStreakData();
  streakData.reserveXP = (streakData.reserveXP || 0) + XP_PER_HABIT;
  saveStreakData(streakData);
  if (typeof updateStreakDisplay === 'function') updateStreakDisplay();
}

function awardTodoXP(todoId) {
  const streakData = getStreakData();
  streakData.reserveXP = (streakData.reserveXP || 0) + XP_PER_TODO;
  saveStreakData(streakData);
  if (typeof updateStreakDisplay === 'function') updateStreakDisplay();
}

// Update streak based on daily completion
function updateDailyStreak() {
  const today = dateToString(getTodayDate());
  const streakData = getStreakData();
  
  // Check if already processed today
  if (streakData.lastCheckDate === today) return;
  
  const completion = checkDailyCompletion(today);
  
  if (completion.allCompleted) {
    // All tasks completed - increase streak
    streakData.totalStreak = (streakData.totalStreak || 0) + 1;
    streakData.weeklyCompletions[today] = { completed: true, isIce: false };
  } else {
    // Check if we can use reserve XP or an ice streak to save the streak
    const yesterday = dateToString(addDays(getTodayDate(), -1));
    if (streakData.lastCheckDate === yesterday) {
      // Prefer using reserve XP first (only use when needed)
      if ((streakData.reserveXP || 0) >= XP_FOR_ICE_STREAK) {
        streakData.reserveXP -= XP_FOR_ICE_STREAK;
        streakData.weeklyCompletions[today] = { completed: true, isIce: true, usedReserve: true };
        // Streak continues and counts as a completed day
        streakData.totalStreak = (streakData.totalStreak || 0) + 1;
      } else if (streakData.iceStreaks > 0) {
        // Use an available freeze
        streakData.iceStreaks -= 1;
        streakData.weeklyCompletions[today] = { completed: true, isIce: true };
        streakData.totalStreak = (streakData.totalStreak || 0) + 1;
      } else {
        // Streak broken
        if (streakData.lastCheckDate && !streakData.weeklyCompletions[yesterday]) {
          streakData.totalStreak = 0;
        }
        streakData.weeklyCompletions[today] = { completed: false, isIce: false };
      }
    } else {
      // If last check wasn't yesterday and there's no completion today, we break the streak
      if (streakData.lastCheckDate && !streakData.weeklyCompletions[dateToString(addDays(getTodayDate(), -1))]) {
        streakData.totalStreak = 0;
      }
      streakData.weeklyCompletions[today] = { completed: false, isIce: false };
    }
  }
  
  streakData.lastCheckDate = today;
  saveStreakData(streakData);
  updateStreakDisplay();
}

// Get individual habit streak
function getHabitStreak(habit) {
  let streak = 0;
  const today = getTodayDate();
  let checkDate = addDays(today, -1); // Start from yesterday

  // Count consecutive days
  while (true) {
    const dateStr = dateToString(checkDate);

    // Check if habit is active on this date
    if (!isHabitActiveOnDate(habit, checkDate)) {
      checkDate = addDays(checkDate, -1);
      continue;
    }

    // For daily habits, check if this day is selected
    const interval = habit.interval || habit.interval_type || 'daily';
    if (interval === 'daily') {
      const dayOfWeek = checkDate.getDay();
      const selectedDays = habit.selectedDays || habit.selectedDailyDays || (habit.daily_days ? JSON.parse(habit.daily_days) : null);
      if (selectedDays && !selectedDays.includes(dayOfWeek)) {
        checkDate = addDays(checkDate, -1);
        continue;
      }
    }

    // Check if completed - support both completions and daily_progress
    let completed = false;
    if (habit.completions && habit.completions[dateStr]) {
      completed = !!habit.completions[dateStr].completed;
    } else if (habit.daily_progress) {
      try {
        const daily = JSON.parse(habit.daily_progress || '{}');
        completed = daily[dateStr] && daily[dateStr].progress >= 100;
      } catch (e) {
        completed = false;
      }
    }

    if (completed) {
      streak++;
    } else {
      break;
    }

    checkDate = addDays(checkDate, -1);
  }

  return streak;
}

// Update streak display in UI
function updateStreakDisplay() {
  const streakData = getStreakData();
  const totalStreak = streakData.totalStreak || 0;
  const iceStreaks = streakData.iceStreaks || 0;
  const reserveXP = streakData.reserveXP || 0;
  
  // Update dashboard streak display (no XP bar shown — reserve XP is stored and used only when needed)
  const streakElement = document.getElementById('dashboard-total-streak');
  if (streakElement) {
    streakElement.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="text-2xl">🔥</div>
        <div>
          <div class="text-2xl font-black">${totalStreak}</div>
          <div class="text-xs text-gray-400">Tage Streak</div>
        </div>
      </div>
      ${iceStreaks > 0 ? `
        <div class="flex items-center gap-2 mt-2">
          <div class="text-xl">❄️</div>
          <div class="text-sm font-bold text-blue-400">${iceStreaks} Freeze</div>
        </div>
      ` : ''}
    `;
  }
}

// Open streak details page
function flashStreakDebug(msg) {
  try {
    let el = document.getElementById('streak-debug-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'streak-debug-toast';
      el.style.position = 'fixed';
      el.style.right = '18px';
      el.style.top = '18px';
      el.style.zIndex = '10001';
      el.style.background = 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(30,30,30,0.8))';
      el.style.color = '#fff';
      el.style.padding = '10px 14px';
      el.style.borderRadius = '10px';
      el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.5)';
      el.style.fontSize = '13px';
      document.body.appendChild(el);
    }
    el.textContent = msg || 'Streak tapped';
    el.style.opacity = '1';
    el.style.display = 'block';
    setTimeout(() => { el.style.opacity = '0'; el.style.display = 'none'; }, 1600);
  } catch (e) { console.warn('flashStreakDebug failed', e); }
}

function openStreakDetails() {
  try { flashStreakDebug('Streak tapped');
    // UI feedback for users
    if (typeof showToast === 'function') showToast('Öffne Streak-Details...', 'success');

    // Prepare HTML content for details
    const contentHtml = (typeof renderStreakDetailsPage === 'function') ? renderStreakDetailsPage() : '<div class="p-4">Keine Daten verfügbar</div>';

    // Try normal navigation first
    if (typeof navigateToPage === 'function') navigateToPage('streak-details');

    const pageEl = document.getElementById('streak-details-page');
    const contentEl = document.getElementById('streak-details-content');

    if (pageEl && contentEl) {
      contentEl.innerHTML = contentHtml;
      pageEl.classList.remove('hidden');
      pageEl.style.display = 'block';
      try { pageEl.scrollIntoView({ behavior: 'smooth' }); } catch (e) {}
      if (typeof showToast === 'function') showToast('Streak-Details geöffnet', 'success');
      return;
    }

    // Fallback: show as modal overlay (guaranteed to appear)
    let modal = document.getElementById('streak-details-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'streak-details-modal';
      modal.style.position = 'fixed';
      modal.style.inset = '0';
      modal.style.zIndex = '9999';
      modal.style.background = 'rgba(0,0,0,0.8)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.innerHTML = `
        <div id="streak-details-modal-inner" style="width:100%;max-width:720px;max-height:90vh;overflow:auto;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:18px;position:relative;">
          <button id="streak-details-modal-close" style="position:absolute;right:12px;top:10px;background:transparent;border:none;color:#fff;font-size:22px;">×</button>
          <div id="streak-details-modal-content"></div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.querySelector('#streak-details-modal-close').addEventListener('click', () => modal.remove());
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }

    const modalContent = modal.querySelector('#streak-details-modal-content');
    if (modalContent) modalContent.innerHTML = contentHtml;
    modal.style.display = 'flex';
    if (typeof showToast === 'function') showToast('Streak-Details geöffnet (Modal)', 'success');
  } catch (e) {
    console.error('openStreakDetails error', e);
    if (typeof showToast === 'function') showToast('Fehler beim Öffnen von Streak-Details', 'error');
  }
}

// Render streak details page
function renderStreakDetailsPage() {
  const streakData = getStreakData();
  const totalStreak = streakData.totalStreak || 0;
  const iceStreaks = streakData.iceStreaks || 0;
  const reserveXP = streakData.reserveXP || 0;
  
  // Get current week
  const weekStart = getWeekStart(getTodayDate());
  const weekDays = getWeekDays(weekStart);
  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  
  const weekHtml = weekDays.map((day, index) => {
    const dateStr = dateToString(day);
    const completion = streakData.weeklyCompletions[dateStr];
    const isToday = isSameDay(day, getTodayDate());

    // Also compute an automatic check (falls keine manuelle Wochen-Aufzeichnung vorhanden ist)
    const autoCheck = checkDailyCompletion(dateStr);
    
    let icon = '';
    let bgColor = 'bg-white/5';
    let borderColor = 'border-white/10';
    
    if (completion) {
      if (completion.completed && completion.isIce) {
        icon = '❄️';
        bgColor = 'bg-blue-500/20';
        borderColor = 'border-blue-500/50';
      } else if (completion.completed) {
        icon = '🔥';
        bgColor = 'bg-orange-500/20';
        borderColor = 'border-orange-500/50';
      } else if (!completion.completed) {
        // If any tasks were completed that day, show flame instead of cross (user requested)
        if (autoCheck.dailyHabitsCompleted + autoCheck.dueTodosCompleted > 0) {
          icon = '🔥';
          bgColor = 'bg-orange-500/10';
          borderColor = 'border-orange-500/30';
        } else {
          icon = '❌';
          bgColor = 'bg-red-500/20';
          borderColor = 'border-red-500/50';
        }
      }
    } else {
      // No explicit record: use auto check — if any tasks done show fire, otherwise cross for past days
      } else if (day < getTodayDate()) {
        icon = '❌';
        bgColor = 'bg-red-500/20';
        borderColor = 'border-red-500/50';
      }
    }
    
    return `
      <div class="flex flex-col items-center gap-2">
        <div class="text-xs font-bold text-gray-400 uppercase">${dayNames[index]}</div>
        <div class="w-16 h-16 rounded-2xl ${bgColor} border-2 ${borderColor} flex items-center justify-center text-2xl ${isToday ? 'ring-2 ring-indigo-500' : ''}">
          ${icon}
        </div>
        <div class="text-xs text-gray-500">${day.getDate()}</div>
      </div>
    `;
  }).join('');
  
  return `
    <div class="page space-y-6 pb-24">
      <!-- Header -->
      <div class="card p-6 text-center">
        <div class="text-6xl mb-4">🔥</div>
        <div class="text-5xl font-black mb-2">${totalStreak}×</div>
        <div class="text-sm text-gray-400">Tage am Stück</div>
        
        ${iceStreaks > 0 ? `
          <div class="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full w-fit mx-auto">
            <div class="text-2xl">❄️</div>
            <div class="text-sm font-bold text-blue-400">${iceStreaks} Freeze verfügbar</div>
          </div>
        ` : ''}
        
        <div class="mt-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-gray-400">Reserve XP (gespeichert)</span>
            <span class="text-xs font-bold text-indigo-400">${streakData.reserveXP || 0} XP</span>
          </div>
          <div class="w-full bg-white/10 rounded-full h-3">
            <div class="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all" style="width: ${Math.min(100, (streakData.reserveXP || 0))}%"></div>
          </div>
        </div>
      </div>
      
      <!-- Current Week -->
      <div class="card p-6">
        <h3 class="text-lg font-black mb-4 flex items-center gap-2">
          <span>📅</span>
          <span>Diese Woche</span>
        </h3>
        <div class="grid grid-cols-7 gap-2">
          ${weekHtml}
        </div>
      </div>
      
      <!-- XP Info -->
      <div class="card p-6">
        <h3 class="text-lg font-black mb-4">🎯 Punkte sammeln</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span class="text-sm">Habit abgeschlossen</span>
            <span class="text-sm font-bold text-green-400">+${XP_PER_HABIT} XP</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span class="text-sm">Todo erledigt</span>
            <span class="text-sm font-bold text-green-400">+${XP_PER_TODO} XP</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <span class="text-sm font-bold">100 XP = 1 Freeze</span>
            <span class="text-xl">❄️</span>
          </div>
        </div>
      </div>
      
      <!-- Info -->
      <div class="card p-6 bg-indigo-500/10 border border-indigo-500/20">
        <h3 class="text-sm font-black mb-2 text-indigo-400">ℹ️ Wie funktioniert's?</h3>
        <ul class="text-xs text-gray-300 space-y-2">
          <li>• Schließe alle täglichen Habits ab</li>
          <li>• Erledige alle fälligen Todos</li>
          <li>• Erhalte XP für jede Aufgabe</li>
          <li>• Sammle XP — sie werden als Reserve gehalten</li>
          <li>• 100 XP werden zur Rettung eines verpassten Tages genutzt (Freeze) ❄️</li>
          <li>• Reserve-XP werden erst verwendet, wenn ein Tag verpasst wird</li>
          <li>• Wochen- und Monats-Habits zählen nicht zum Streak</li>
        </ul>
      </div>
    </div>
  `;
}

// Initialize system on load
initStreakSystem();

// Robust setup for streak click handlers (works even if DOM already loaded)
function setupStreakClickHandlers() {
  const dash = document.getElementById('dashboard-total-streak');
  if (!dash) return;

  dash.setAttribute('role', 'button');
  dash.setAttribute('aria-label', 'Streak Details öffnen');

  const parentCard = dash.closest('[onclick*="openStreakDetails"]') || dash;

  const doVisualFeedback = (el) => {
    try {
      el.classList.add('ring-2', 'ring-indigo-500');
      setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-500'), 350);
    } catch (e) {}
  };

  let touchHandled = false;

  parentCard.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchHandled = true;
    doVisualFeedback(parentCard);
    openStreakDetails();
  }, { passive: false });

  parentCard.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch') return; // touch handled
    doVisualFeedback(parentCard);
    openStreakDetails();
  });

  parentCard.addEventListener('click', (e) => {
    if (touchHandled) { touchHandled = false; return; }
    doVisualFeedback(parentCard);
    openStreakDetails();
  });

  document.body.addEventListener('click', (e) => {
    const target = e.target;
    const streakCard = target.closest && target.closest('[onclick*="openStreakDetails"]');
    if (streakCard) {
      doVisualFeedback(streakCard);
      openStreakDetails();
    }
  });

  document.body.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    if (!active) return;
    if (e.key === 'Enter' || e.key === ' ') {
      if (active.id === 'dashboard-total-streak' || (active.closest && active.closest('[onclick*="openStreakDetails"]'))) {
        e.preventDefault();
        openStreakDetails();
      }
    }
  });

  // ensure global
  window.openStreakDetails = openStreakDetails;

  // Debug: add a small 'Open Streak (debug)' button next to the dashboard streak for users without console
  try {
    const debugBtnId = 'streak-debug-open';
    if (!document.getElementById(debugBtnId)) {
      const btn = document.createElement('button');
      btn.id = debugBtnId;
      btn.textContent = 'Open Streak (debug)';
      btn.style.fontSize = '12px';
      btn.style.marginLeft = '8px';
      btn.style.padding = '6px 8px';
      btn.style.borderRadius = '6px';
      btn.style.background = 'rgba(255,255,255,0.06)';
      btn.style.color = '#fff';
      btn.style.border = '1px solid rgba(255,255,255,0.06)';
      btn.addEventListener('click', () => { flashStreakDebug('Debug button clicked'); openStreakDetails(); });
      dash.parentNode && dash.parentNode.insertBefore(btn, dash.nextSibling);
    }

    // Force-bind onclick and touch handlers on parent element and the streak div itself
    try {
      const parentCard = dash.closest('[onclick*="openStreakDetails"]') || dash.parentNode || dash;
      // set attribute so inline click works even if global binding fails
      try { parentCard.setAttribute('onclick', 'try{window.openStreakDetails && window.openStreakDetails();}catch(e){document.body.insertAdjacentHTML("beforeend","<div id=\'streak-failed-indicator\' style=\'position:fixed;left:12px;bottom:12px;background:#ff3b30;color:#fff;padding:8px 10px;border-radius:8px;z-index:10002\'>Streak open failed</div>");}'); } catch(e) {}

      // Visual indicator that binding occurred
      if (!document.getElementById('streak-binding-indicator')) {
        const i = document.createElement('div');
        i.id = 'streak-binding-indicator';
        i.textContent = 'Streak handler bound';
        i.style.position = 'fixed';
        i.style.left = '12px';
        i.style.bottom = '56px';
        i.style.background = 'rgba(0,0,0,0.6)';
        i.style.color = '#fff';
        i.style.padding = '6px 8px';
        i.style.borderRadius = '8px';
        i.style.zIndex = '10002';
        document.body.appendChild(i);
        setTimeout(() => i.remove(), 2400);
      }

      // Add direct touchstart/click handlers that show a quick highlight and call the open function
      try {
        parentCard.addEventListener('touchstart', (e) => {
          try { parentCard.style.transition = 'box-shadow 120ms'; parentCard.style.boxShadow = '0 0 0 4px rgba(255,165,0,0.12)'; setTimeout(()=>parentCard.style.boxShadow='',140); } catch(e){}
        }, { passive: true });

        parentCard.addEventListener('touchend', (e) => {
          e.preventDefault && e.preventDefault();
          flashStreakDebug('touchend detected');
          try { openStreakDetails(); } catch(e){ document.body.insertAdjacentHTML('beforeend','<div id="streak-open-exception" style="position:fixed;left:12px;bottom:12px;background:#ff3b30;color:#fff;padding:8px 10px;border-radius:8px;z-index:10002">openStreakDetails failed</div>'); }
        }, { passive: false });

        parentCard.addEventListener('click', (e) => {
          flashStreakDebug('click detected');
          try { openStreakDetails(); } catch(e){ document.body.insertAdjacentHTML('beforeend','<div id="streak-open-exception" style="position:fixed;left:12px;bottom:12px;background:#ff3b30;color:#fff;padding:8px 10px;border-radius:8px;z-index:10002">openStreakDetails failed</div>'); }
        });
      } catch(e) {}
    } catch(e) {}

  } catch(e){}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupStreakClickHandlers);
} else {
  try { setupStreakClickHandlers(); } catch (e) {}
}

