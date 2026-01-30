// ===== PATCH FOR APP.JS - ADD THESE MODIFICATIONS =====

// ============================================================
// 1. FIND: function toggleHabitCompletion(habitId, dateStr)
// ADD: After the completion status is set, add XP and streak updates
// ============================================================

// ORIGINAL CODE SNIPPET TO FIND:
/*
  habit.completions[dateStr] = completion;
  saveToLocalStorage();
  renderHabitsPage();
  renderStatsPage();
*/

// REPLACE WITH:
/*
  const wasCompleted = completion.completed;  // ADD THIS LINE BEFORE TOGGLING
  
  // ... existing completion toggle logic ...
  
  // Award XP if newly completed (ADD THESE LINES)
  if (!wasCompleted && completion.completed) {
    if (typeof awardHabitXP === 'function') {
      awardHabitXP(habitId);
    }
  }

  // Update habit's individual streak (ADD THIS LINE)
  if (typeof getHabitStreak === 'function') {
    habit.streak = getHabitStreak(habit);
  }

  saveToLocalStorage();
  renderHabitsPage();
  renderStatsPage();
  
  // Update daily streak (ADD THIS LINE)
  if (typeof updateDailyStreak === 'function') {
    updateDailyStreak();
  }
*/

// ============================================================
// 2. FIND: function toggleTodo(todoId)
// ADD: XP award when todo is completed
// ============================================================

// FIND AND ADD:
/*
function toggleTodo(todoId) {
  const todo = items.find(i => i.id === todoId && i.type === 'todo');
  if (!todo) return;

  const wasCompleted = todo.completed;  // ADD THIS LINE
  todo.completed = !todo.completed;
  
  if (todo.completed) {
    todo.completedDate = getToday();
    // Award XP (ADD THESE LINES)
    if (!wasCompleted && typeof awardTodoXP === 'function') {
      awardTodoXP(todoId);
    }
  } else {
    delete todo.completedDate;
  }

  saveToLocalStorage();
  renderTodosPage();
  renderStatsPage();
  
  // Update daily streak (ADD THIS LINE)
  if (typeof updateDailyStreak === 'function') {
    updateDailyStreak();
  }
}
*/

// ============================================================
// 3. FIND: function renderStatsPage()
// MODIFY: Update streak display call
// ============================================================

// FIND THIS CODE:
/*
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  document.getElementById('stat-streak').textContent = maxStreak;
*/

// REPLACE WITH:
/*
  // Streak is now handled by updateStreakDisplay()
  if (typeof updateStreakDisplay === 'function') {
    updateStreakDisplay();
  }
*/

// ============================================================
// 4. FIND: function renderHabitCard(habit, dateStr)
//    OR wherever you generate the habit card HTML
// ADD: Individual habit streak badge
// ============================================================

// ADD THIS CODE when building the habit card HTML:
/*
// Get individual habit streak
let habitStreakBadge = '';
if (typeof getHabitStreak === 'function') {
  const habitStreak = getHabitStreak(habit);
  if (habitStreak > 0) {
    habitStreakBadge = `
      <div class="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
        <span class="text-xs">🔥</span>
        <span class="text-xs font-bold text-orange-400">${habitStreak}</span>
      </div>
    `;
  }
}

// Then in your card HTML, add: ${habitStreakBadge}
*/

// ============================================================
// 5. FIND: function navigateToPage(pageName)
// ADD: Support for streak-details page
// ============================================================

// FIND the pageMap object and ADD streak-details:
/*
const pageMap = {
  'stats': 'stats-page',
  'habits': 'habits-page',
  'todos': 'todos-page',
  'sport': 'sport-page',
  'streak-details': 'streak-details-page'  // ADD THIS LINE
};
*/

// FIND the page-specific rendering section and ADD:
/*
if (pageName === 'streak-details') {
  if (typeof renderStreakDetailsPage === 'function') {
    document.getElementById('streak-details-content').innerHTML = renderStreakDetailsPage();
  }
}
*/

// ============================================================
// 6. ADD: Initialize streak system on page load
//    Add this at the END of app.js or in your init function
// ============================================================

// ADD THIS CODE:
/*
// Initialize streak system when page loads
if (typeof initStreakSystem === 'function') {
  initStreakSystem();
  updateStreakDisplay();
  updateDailyStreak();
}
*/

// ============================================================
// 7. ADD: openStreakDetails function (if not exists)
// ============================================================

// ADD THIS FUNCTION:
/*
function openStreakDetails() {
  navigateToPage('streak-details');
}
*/

// ============================================================
// COMPLETE EXAMPLE OF MODIFIED toggleHabitCompletion:
// ============================================================

function toggleHabitCompletion(habitId, dateStr) {
  const habit = items.find(i => i.id === habitId && i.type === 'habit');
  if (!habit) return;

  if (!habit.completions) habit.completions = {};
  if (!habit.completions[dateStr]) {
    habit.completions[dateStr] = { completed: false, value: 0 };
  }

  const completion = habit.completions[dateStr];
  const wasCompleted = completion.completed;  // SAVE PREVIOUS STATE
  
  if (habit.habitType === 'task') {
    completion.completed = !completion.completed;
  } else if (habit.habitType === 'counter') {
    const currentValue = completion.value || 0;
    const goalValue = habit.goal || 1;
    
    if (!completion.completed && currentValue >= goalValue) {
      completion.completed = true;
    } else if (completion.completed) {
      completion.completed = false;
      completion.value = 0;
    } else {
      completion.value = Math.min(currentValue + 1, goalValue);
      if (completion.value >= goalValue) {
        completion.completed = true;
      }
    }
  } else if (habit.habitType === 'timer') {
    if (!completion.completed) {
      const goalSeconds = (habit.goal || 0) * 60;
      completion.value = goalSeconds;
      completion.completed = true;
    } else {
      completion.completed = false;
      completion.value = 0;
    }
  }

  // Award XP if newly completed (NEW)
  if (!wasCompleted && completion.completed) {
    if (typeof awardHabitXP === 'function') {
      awardHabitXP(habitId);
    }
  }

  // Update habit's individual streak (NEW)
  if (typeof getHabitStreak === 'function') {
    habit.streak = getHabitStreak(habit);
  }

  saveToLocalStorage();
  renderHabitsPage();
  renderStatsPage();
  
  // Update daily streak (NEW)
  if (typeof updateDailyStreak === 'function') {
    updateDailyStreak();
  }
}
