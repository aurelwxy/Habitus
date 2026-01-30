# INTEGRATION GUIDE - STREAK SYSTEM & WORKOUT SETS MODE

## OVERVIEW
This guide shows you how to integrate:
1. **Advanced Streak System** with XP, Freeze streaks, and weekly visualization
2. **Workout Sets Mode** with collapsible sets, duplication, and pause functionality

## FILES STRUCTURE
- `streak-system.js` - Complete streak and XP management
- `sport-enhanced.js` - Enhanced sport.js with Sets mode
- `index.html` - Updated HTML with new UI elements
- `app.js` - Modified app.js with streak integration

## INSTALLATION STEPS

### Step 1: Add JavaScript Files

Add these script tags to your index.html BEFORE the closing `</body>` tag:

```html
<!-- Add these in order -->
<script src="app.js"></script>
<script src="streak-system.js"></script>  <!-- NEW -->
<script src="sport-enhanced.js"></script>  <!-- REPLACES sport.js -->
<script src="custom-modals.js"></script>
<script src="dynamic-color-override.js"></script>
```

### Step 2: Update index.html

#### 2.1 Update the Streak Card on Dashboard (around line 234)

FIND:
```html
<div class="card p-5 rounded-[2rem] bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
  <div class="flex items-center gap-2 mb-3">
    <div class="p-2 rounded-xl bg-orange-500/20 text-orange-500">
      <svg width="18" height="18" ...></svg>
    </div>
    <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Streak</span>
  </div>
  <div class="flex items-baseline gap-1">
    <span id="stat-streak" class="text-3xl font-bold text-orange-500">0</span>
    <span class="text-xs text-orange-500/60 font-semibold">Tage</span>
  </div>
</div>
```

REPLACE WITH:
```html
<div class="card p-5 rounded-[2rem] bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 cursor-pointer hover:scale-105 transition-transform" onclick="openStreakDetails()">
  <div id="dashboard-total-streak">
    <!-- Streak info will be inserted by JavaScript -->
  </div>
</div>
```

#### 2.2 Add Streak Details Page (after stats page, around line 277)

INSERT AFTER the stats page closing `</main>` tag:

```html
<!-- Streak Details Page -->
<main id="streak-details-page" class="page px-3 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-32 hidden">
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-white">🔥 Streak Details</h2>
      <button onclick="navigateToPage('stats')" class="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div id="streak-details-content"></div>
  </div>
</main>
```

#### 2.3 Update Sport Player (around line 765)

FIND the section with the action buttons (around line 765):
```html
<div class="mt-auto space-y-4">
  <button id="player-action-btn" onclick="handlePlayerAction()" ...>WEITER</button>
  <button onclick="nextSportBlock()" ...>Überspringen</button>
</div>
```

INSERT BEFORE these buttons:
```html
<button id="player-pause-btn" onclick="togglePause()" class="w-full px-6 py-3 bg-white/10 rounded-2xl font-bold text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2 hidden">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="6" y="4" width="4" height="16"/>
    <rect x="14" y="4" width="4" height="16"/>
  </svg>
  <span>Pause</span>
</button>
```

#### 2.4 Update Workout Modal (around line 776)

FIND:
```html
<div class="flex items-center gap-2 mb-4 sm:mb-6 bg-white/5 p-2 sm:p-3 rounded-2xl w-fit">
  <input type="checkbox" id="sync-names-check" onchange="syncAllBlockNames()" class="w-4 h-4 accent-indigo-500">
  <label for="sync-names-check" class="text-[9px] sm:text-[10px] font-bold uppercase text-gray-400">Name-Sync</label>
</div>
```

INSERT AFTER:
```html
<div class="flex items-center gap-2 mb-4 sm:mb-6 bg-white/5 p-2 sm:p-3 rounded-2xl w-fit">
  <input type="checkbox" id="sets-mode-check" onchange="toggleSetsMode()" class="w-4 h-4 accent-orange-500">
  <label for="sets-mode-check" class="text-[9px] sm:text-[10px] font-bold uppercase text-gray-400">Sets Modus</label>
</div>
```

### Step 3: Update app.js

#### 3.1 Update toggleHabitCompletion function

FIND the `toggleHabitCompletion` function and ADD this code after setting completion status:

```javascript
// Award XP if newly completed
if (!wasCompleted && completion.completed) {
  awardHabitXP(habitId);
}

// Update habit's individual streak
habit.streak = getHabitStreak(habit);

// ... rest of existing code ...

// At the end, add:
updateDailyStreak();
```

#### 3.2 Update toggleTodo function

FIND the `toggleTodo` function and ADD:

```javascript
if (todo.completed) {
  todo.completedDate = getToday();
  if (!wasCompleted) {
    awardTodoXP(todoId);  // ADD THIS
  }
}

// ... rest of existing code ...

// At the end, add:
updateDailyStreak();
```

#### 3.3 Update renderStatsPage function

REPLACE the line that updates the streak:
```javascript
document.getElementById('stat-streak').textContent = maxStreak;
```

WITH:
```javascript
// Streak is now handled by updateStreakDisplay() in streak-system.js
updateStreakDisplay();
```

#### 3.4 Update renderHabitsPage to show habit streaks

FIND where you render habit cards and ADD individual habit streak display:

```javascript
// In the habit card HTML generation:
const habitStreak = getHabitStreak(habit);
let streakBadgeHtml = '';
if (habitStreak > 0) {
  streakBadgeHtml = `
    <div class="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
      <span class="text-xs">🔥</span>
      <span class="text-xs font-bold text-orange-400">${habitStreak}</span>
    </div>
  `;
}

// Add streakBadgeHtml to your card HTML
```

#### 3.5 Update navigateToPage function

ADD 'streak-details' to the page navigation:

```javascript
function navigateToPage(pageName) {
  currentPage = pageName;
  
  // ... existing code ...
  
  // Add this to the page map:
  const pageMap = {
    'stats': 'stats-page',
    'habits': 'habits-page',
    'todos': 'todos-page',
    'sport': 'sport-page',
    'streak-details': 'streak-details-page'  // ADD THIS
  };
  
  // ... existing code ...
  
  // Add this to the render section:
  if (pageName === 'streak-details') {
    document.getElementById('streak-details-content').innerHTML = renderStreakDetailsPage();
  }
}
```

#### 3.6 Initialize streak system on load

ADD to the bottom of app.js or in DOMContentLoaded:

```javascript
// Initialize streak system
initStreakSystem();
updateStreakDisplay();
updateDailyStreak();
```

### Step 4: Replace sport.js

REPLACE your current `sport.js` file with `sport-enhanced.js`

OR update the script tag in index.html:
```html
<!-- OLD -->
<script src="sport.js"></script>

<!-- NEW -->
<script src="sport-enhanced.js"></script>
```

## FEATURES EXPLANATION

### Streak System
- **Daily Streak**: Increments when ALL daily habits and due todos are completed
- **Individual Habit Streaks**: Each habit shows its own consecutive completion streak
- **XP System**: +10 XP per habit, +5 XP per todo
- **Freeze Streaks**: Earned at 100 XP, saves your streak for one missed day (shown with ❄️)
- **Weekly View**: Visual calendar showing 🔥 for completed days, ❄️ for freeze-saved days, ❌ for missed days

### Workout Sets Mode
- **Sets Toggle**: Enable "Sets Modus" checkbox in workout creation
- **Collapsible Sets**: Click arrow to expand/collapse set blocks
- **Duplicate Sets**: Copy entire sets with all blocks
- **Pause Button**: Pause timer during workout execution
- **Progress Tracking**: Shows "Set X | Block Y of Z"

## TESTING

1. **Streak System**:
   - Create a daily habit and complete it → Check XP increases
   - Complete enough tasks to earn 100 XP → Check freeze streak appears
   - Click on streak card on dashboard → Should open detailed view
   - Check weekly calendar shows correct icons

2. **Workout Sets**:
   - Create new workout and enable "Sets Modus"
   - Add multiple sets with different blocks
   - Test collapse/expand functionality
   - Duplicate a set
   - Start workout and test pause button
   - Check progress text shows set and block info

## TROUBLESHOOTING

- **Streak not updating**: Check that `updateDailyStreak()` is called after habit/todo completion
- **XP not awarding**: Ensure `awardHabitXP()` and `awardTodoXP()` are called correctly
- **Sets not saving**: Check localStorage for 'habitus_sport_workouts'
- **Pause button not showing**: Ensure it's visible when workout starts (check hidden class)

## DATA STRUCTURE

### Streak Data (localStorage: 'habitus_streak_data')
```javascript
{
  totalStreak: 5,
  currentXP: 45,
  iceStreaks: 2,
  weeklyCompletions: {
    '2025-01-27': { completed: true, isIce: false },
    '2025-01-28': { completed: true, isIce: true },
    '2025-01-29': { completed: false, isIce: false }
  },
  lastCheckDate: '2025-01-30'
}
```

### Workout with Sets (localStorage: 'habitus_sport_workouts')
```javascript
{
  id: '123',
  name: 'Push Day',
  setsMode: true,
  sets: [
    {
      name: 'Set 1',
      blocks: [
        { name: 'Bench Press', type: 'reps', reps: 12, sets: 4 },
        { name: 'Rest', type: 'pause', pause: 90 }
      ]
    }
  ]
}
```
