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
      currentXP: 0,
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
  const streakData = getStreakData();
  streakData.currentXP = (streakData.currentXP || 0) + XP_PER_HABIT;
  
  // Check if we earned an ice streak
  if (streakData.currentXP >= XP_FOR_ICE_STREAK) {
    streakData.iceStreaks = (streakData.iceStreaks || 0) + 1;
    streakData.currentXP -= XP_FOR_ICE_STREAK;
  }
  
  saveStreakData(streakData);
  updateStreakDisplay();
}

// Award XP for completing a todo
function awardTodoXP(todoId) {
  const streakData = getStreakData();
  streakData.currentXP = (streakData.currentXP || 0) + XP_PER_TODO;
  
  // Check if we earned an ice streak
  if (streakData.currentXP >= XP_FOR_ICE_STREAK) {
    streakData.iceStreaks = (streakData.iceStreaks || 0) + 1;
    streakData.currentXP -= XP_FOR_ICE_STREAK;
  }
  
  saveStreakData(streakData);
  updateStreakDisplay();
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
    // Check if we can use an ice streak
    const yesterday = dateToString(addDays(getTodayDate(), -1));
    if (streakData.lastCheckDate === yesterday && streakData.iceStreaks > 0) {
      // Use ice streak to save the streak
      streakData.iceStreaks -= 1;
      streakData.weeklyCompletions[today] = { completed: true, isIce: true };
      // Streak continues
    } else {
      // Streak broken
      if (streakData.lastCheckDate && !streakData.weeklyCompletions[yesterday]) {
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
  const currentXP = streakData.currentXP || 0;
  
  // Update dashboard streak display
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
      <div class="mt-2">
        <div class="text-xs text-gray-400 mb-1">XP: ${currentXP}/100</div>
        <div class="w-full bg-white/10 rounded-full h-2">
          <div class="bg-indigo-500 h-2 rounded-full transition-all" style="width: ${currentXP}%"></div>
        </div>
      </div>
    `;
  }
}

// Open streak details page
function openStreakDetails() {
  navigateToPage('streak-details');
}

// Render streak details page
function renderStreakDetailsPage() {
  const streakData = getStreakData();
  const totalStreak = streakData.totalStreak || 0;
  const iceStreaks = streakData.iceStreaks || 0;
  const currentXP = streakData.currentXP || 0;
  
  // Get current week
  const weekStart = getWeekStart(getTodayDate());
  const weekDays = getWeekDays(weekStart);
  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  
  const weekHtml = weekDays.map((day, index) => {
    const dateStr = dateToString(day);
    const completion = streakData.weeklyCompletions[dateStr];
    const isToday = isSameDay(day, getTodayDate());
    
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
        icon = '❌';
        bgColor = 'bg-red-500/20';
        borderColor = 'border-red-500/50';
      }
    } else if (day < getTodayDate()) {
      icon = '❌';
      bgColor = 'bg-red-500/20';
      borderColor = 'border-red-500/50';
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
            <span class="text-xs text-gray-400">XP bis zum nächsten Freeze</span>
            <span class="text-xs font-bold text-indigo-400">${currentXP}/100</span>
          </div>
          <div class="w-full bg-white/10 rounded-full h-3">
            <div class="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all" style="width: ${currentXP}%"></div>
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
          <li>• Bei 100 XP bekommst du einen Freeze ❄️</li>
          <li>• Freeze rettet deinen Streak an einem Tag</li>
          <li>• Wochen- und Monats-Habits zählen nicht zum Streak</li>
        </ul>
      </div>
    </div>
  `;
}

// Initialize system on load
initStreakSystem();
