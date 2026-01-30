// ===== SPORT MODULE WITH SETS MODE =====

let workouts = JSON.parse(localStorage.getItem('habitus_sport_workouts') || '[]');
let sportHistory = JSON.parse(localStorage.getItem('habitus_sport_history') || '[]');
let currentWorkout = null;
let currentSetIdx = 0;
let currentBlockIdx = 0;
let timerInterval = null;
let startTime = null;
let editingWorkoutId = null;
let pendingDeleteAction = null;
let currentTypeSelectElement = null;
let isPaused = false;
let pauseStartTime = null;
let totalPausedTime = 0;

// ===== MODAL FUNCTIONS =====
function showSportDeleteModal(title, message, confirmCallback) {
  document.getElementById('sport-delete-title').innerText = title;
  document.getElementById('sport-delete-message').innerText = message;
  document.getElementById('sport-delete-modal').classList.remove('hidden');
  pendingDeleteAction = confirmCallback;
}

function closeSportDeleteModal() {
  document.getElementById('sport-delete-modal').classList.add('hidden');
  pendingDeleteAction = null;
}

function executeSportDelete() {
  if (pendingDeleteAction) {
    pendingDeleteAction();
  }
  closeSportDeleteModal();
}

function showSportTypeModal(selectElement) {
  currentTypeSelectElement = selectElement;
  document.getElementById('sport-type-modal').classList.remove('hidden');
}

function closeSportTypeModal() {
  document.getElementById('sport-type-modal').classList.add('hidden');
  currentTypeSelectElement = null;
}

function selectSportType(type) {
  if (currentTypeSelectElement) {
    currentTypeSelectElement.value = type;
    handleTypeChange(currentTypeSelectElement);
  }
  closeSportTypeModal();
}

// Connect delete button to action
document.addEventListener('DOMContentLoaded', function() {
  const deleteBtn = document.getElementById('sport-delete-confirm-btn');
  if (deleteBtn) {
    deleteBtn.onclick = executeSportDelete;
  }
});

// ===== TAB SWITCHING =====
function switchSportTab(tab) {
  document.querySelectorAll('.sport-view-section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.sport-tab').forEach(b => {
    b.classList.remove('bg-orange-500', 'text-white');
    b.classList.add('text-gray-500');
  });
  
  document.getElementById(`sport-view-${tab}`).classList.remove('hidden');
  const activeTab = document.getElementById(`sport-tab-${tab}`);
  activeTab.classList.remove('text-gray-500');
  activeTab.classList.add('bg-orange-500', 'text-white');
  
  if(tab === 'history') renderSportHistory();
  if(tab === 'stats') calculateSportStats();
}

// ===== PLAYER LOGIC WITH PAUSE =====
function startWorkout(id) {
  currentWorkout = JSON.parse(JSON.stringify(workouts.find(w => w.id === id)));
  currentSetIdx = 0;
  currentBlockIdx = 0;
  startTime = Date.now();
  isPaused = false;
  totalPausedTime = 0;
  document.getElementById('sport-player-page').classList.remove('hidden');
  document.getElementById('player-workout-name').innerText = currentWorkout.name;
  
  // Show pause button if sets mode is enabled
  const pauseBtn = document.getElementById('player-pause-btn');
  if (pauseBtn) {
    pauseBtn.classList.remove('hidden');
  }
  
  updatePlayerUI();
}

function togglePause() {
  isPaused = !isPaused;
  const pauseBtn = document.getElementById('player-pause-btn');
  const pauseIcon = pauseBtn.querySelector('svg');
  
  if (isPaused) {
    pauseStartTime = Date.now();
    clearInterval(timerInterval);
    pauseBtn.classList.add('bg-orange-500');
    pauseBtn.classList.remove('bg-white/10');
    // Change icon to play
    pauseIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
  } else {
    if (pauseStartTime) {
      totalPausedTime += Date.now() - pauseStartTime;
      pauseStartTime = null;
    }
    pauseBtn.classList.remove('bg-orange-500');
    pauseBtn.classList.add('bg-white/10');
    // Change icon to pause
    pauseIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    
    // Resume timer if it was a timer block
    const block = getCurrentBlock();
    if (block && block.type === 'zeit') {
      startTimer(block.zeit);
    } else if (block && block.type === 'pause') {
      startTimer(block.pause);
    }
  }
}

function getCurrentBlock() {
  if (currentWorkout.setsMode) {
    const currentSet = currentWorkout.sets[currentSetIdx];
    return currentSet ? currentSet.blocks[currentBlockIdx] : null;
  } else {
    return currentWorkout.blocks[currentBlockIdx];
  }
}

function updatePlayerUI() {
  if (isPaused) return;
  
  clearInterval(timerInterval);
  const block = getCurrentBlock();
  
  if (!block) {
    finishWorkout();
    return;
  }
  
  const displayValue = document.getElementById('player-main-value');
  const displayUnit = document.getElementById('player-main-unit');
  const actionBtn = document.getElementById('player-action-btn');
  const circle = document.getElementById('timer-circle');
  const progressText = document.getElementById('player-progress');

  document.getElementById('player-current-block-title').innerText = block.name;
  
  // Update progress text
  if (currentWorkout.setsMode) {
    const currentSet = currentWorkout.sets[currentSetIdx];
    progressText.innerText = `Set "${currentSet.name}" | Block ${currentBlockIdx + 1} von ${currentSet.blocks.length}`;
  } else {
    progressText.innerText = `Block ${currentBlockIdx + 1} von ${currentWorkout.blocks.length}`;
  }
  
  circle.classList.remove('timer-active', 'bg-indigo-500/10');

  if (block.type === 'reps') {
    displayValue.innerText = block.reps || "0";
    displayUnit.innerText = block.sets ? `${block.sets}× Wdh.` : 'Wdh.';
    actionBtn.innerText = 'WEITER';
    actionBtn.classList.remove('bg-indigo-600');
    actionBtn.classList.add('bg-white');
    actionBtn.style.color = '#000';
  } else if (block.type === 'zeit') {
    const seconds = block.zeit || 0;
    displayValue.innerText = formatTime(seconds);
    displayUnit.innerText = 'Zeit';
    actionBtn.innerText = 'START';
    actionBtn.classList.remove('bg-white');
    actionBtn.classList.add('bg-indigo-600');
    actionBtn.style.color = '#fff';
  } else if (block.type === 'pause') {
    const seconds = block.pause || 0;
    displayValue.innerText = formatTime(seconds);
    displayUnit.innerText = 'Pause';
    actionBtn.innerText = 'START';
    actionBtn.classList.remove('bg-white');
    actionBtn.classList.add('bg-indigo-600');
    actionBtn.style.color = '#fff';
  }
}

function handlePlayerAction() {
  if (isPaused) return;
  
  const block = getCurrentBlock();
  const actionBtn = document.getElementById('player-action-btn');

  if (block.type === 'reps') {
    nextSportBlock();
  } else if (block.type === 'zeit' || block.type === 'pause') {
    if (actionBtn.innerText === 'START') {
      startTimer(block.type === 'zeit' ? block.zeit : block.pause);
      actionBtn.innerText = 'WEITER';
    } else {
      nextSportBlock();
    }
  }
}

function startTimer(seconds) {
  if (isPaused) return;
  
  let remaining = seconds;
  const displayValue = document.getElementById('player-main-value');
  const circle = document.getElementById('timer-circle');
  circle.classList.add('timer-active', 'bg-indigo-500/10');

  timerInterval = setInterval(() => {
    if (isPaused) {
      clearInterval(timerInterval);
      return;
    }
    
    remaining--;
    displayValue.innerText = formatTime(remaining);

    if (remaining <= 0) {
      clearInterval(timerInterval);
      circle.classList.remove('timer-active', 'bg-indigo-500/10');
      // Auto advance to next block
      setTimeout(() => nextSportBlock(), 500);
    }
  }, 1000);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function nextSportBlock() {
  if (isPaused) return;
  
  if (currentWorkout.setsMode) {
    const currentSet = currentWorkout.sets[currentSetIdx];
    currentBlockIdx++;
    
    // Check if we've finished the current set
    if (currentBlockIdx >= currentSet.blocks.length) {
      currentSetIdx++;
      currentBlockIdx = 0;
      
      // Check if we've finished all sets
      if (currentSetIdx >= currentWorkout.sets.length) {
        finishWorkout();
        return;
      }
    }
  } else {
    currentBlockIdx++;
    if (currentBlockIdx >= currentWorkout.blocks.length) {
      finishWorkout();
      return;
    }
  }
  
  updatePlayerUI();
}

function finishWorkout() {
  clearInterval(timerInterval);
  const totalTime = Math.floor((Date.now() - startTime - totalPausedTime) / 1000);
  
  sportHistory.push({
    id: Date.now().toString(),
    workoutId: currentWorkout.id,
    workoutName: currentWorkout.name,
    date: new Date().toISOString(),
    duration: totalTime,
    blocks: currentWorkout.setsMode 
      ? currentWorkout.sets.flatMap(set => set.blocks)
      : currentWorkout.blocks
  });
  
  localStorage.setItem('habitus_sport_history', JSON.stringify(sportHistory));
  exitSportPlayer();
  renderSportPage();
}

function exitSportPlayer() {
  clearInterval(timerInterval);
  currentWorkout = null;
  currentSetIdx = 0;
  currentBlockIdx = 0;
  isPaused = false;
  totalPausedTime = 0;
  document.getElementById('sport-player-page').classList.add('hidden');
}

// ===== WORKOUT MODAL WITH SETS MODE =====
function openCreateWorkoutModal() {
  editingWorkoutId = null;
  document.getElementById('workout-name').value = '';
  document.getElementById('sync-names-check').checked = false;
  document.getElementById('sets-mode-check').checked = false;
  document.getElementById('blocks-container').innerHTML = '';
  document.getElementById('delete-workout-btn').classList.add('hidden');
  document.getElementById('sport-workout-modal').classList.remove('hidden');
  
  toggleSetsMode(); // Initialize with sets mode off
  addBlockRow();
}

function toggleSetsMode() {
  const setsModeEnabled = document.getElementById('sets-mode-check').checked;
  const container = document.getElementById('blocks-container');
  
  if (setsModeEnabled) {
    // Switch to sets mode
    container.innerHTML = '';
    addSetSection();
  } else {
    // Switch to regular mode
    container.innerHTML = '';
    addBlockRow();
  }
}

let setCounter = 0;

function addSetSection() {
  setCounter++;
  const setId = `set-${setCounter}`;
  const container = document.getElementById('blocks-container');
  
  const setDiv = document.createElement('div');
  setDiv.className = 'set-section mb-4 p-4 bg-white/5 rounded-2xl border border-white/10';
  setDiv.dataset.setId = setId;
  
  setDiv.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <input type="text" 
             class="set-name-input bg-transparent text-lg font-bold outline-none border-b border-white/10 pb-1 flex-1 mr-2 text-white" 
             placeholder="Set ${setCounter}"
             value="Set ${setCounter}">
      <div class="flex gap-2">
        <button type="button" onclick="duplicateSet('${setId}')" class="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all" title="Set duplizieren">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button type="button" onclick="toggleSetCollapse('${setId}')" class="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all set-toggle-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <button type="button" onclick="deleteSet('${setId}')" class="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-all text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="set-blocks-container space-y-2"></div>
    <button type="button" onclick="addBlockToSet('${setId}')" class="w-full mt-2 p-2 bg-white/10 rounded-xl text-xs font-bold uppercase text-white hover:bg-white/20 transition-all">
      Block +
    </button>
  `;
  
  container.appendChild(setDiv);
  addBlockToSet(setId);
}

function toggleSetCollapse(setId) {
  const setDiv = document.querySelector(`[data-set-id="${setId}"]`);
  const blocksContainer = setDiv.querySelector('.set-blocks-container');
  const addButton = setDiv.querySelector('button[onclick*="addBlockToSet"]');
  const toggleBtn = setDiv.querySelector('.set-toggle-btn svg');
  
  if (blocksContainer.classList.contains('hidden')) {
    blocksContainer.classList.remove('hidden');
    addButton.classList.remove('hidden');
    toggleBtn.style.transform = 'rotate(0deg)';
  } else {
    blocksContainer.classList.add('hidden');
    addButton.classList.add('hidden');
    toggleBtn.style.transform = 'rotate(-90deg)';
  }
}

function duplicateSet(setId) {
  const originalSet = document.querySelector(`[data-set-id="${setId}"]`);
  const newSetId = `set-${++setCounter}`;
  
  const newSet = originalSet.cloneNode(true);
  newSet.dataset.setId = newSetId;
  
  // Update set name
  const nameInput = newSet.querySelector('.set-name-input');
  nameInput.value = `${nameInput.value} (Kopie)`;
  
  // Update button onclick handlers
  newSet.querySelector('[onclick*="duplicateSet"]').setAttribute('onclick', `duplicateSet('${newSetId}')`);
  newSet.querySelector('[onclick*="toggleSetCollapse"]').setAttribute('onclick', `toggleSetCollapse('${newSetId}')`);
  newSet.querySelector('[onclick*="deleteSet"]').setAttribute('onclick', `deleteSet('${newSetId}')`);
  newSet.querySelector('[onclick*="addBlockToSet"]').setAttribute('onclick', `addBlockToSet('${newSetId}')`);
  
  originalSet.parentNode.appendChild(newSet);
}

function deleteSet(setId) {
  const setDiv = document.querySelector(`[data-set-id="${setId}"]`);
  const setName = setDiv.querySelector('.set-name-input').value;
  
  showSportDeleteModal(
    'Set löschen?',
    `Möchtest du "${setName}" wirklich löschen?`,
    () => setDiv.remove()
  );
}

function addBlockToSet(setId) {
  const setDiv = document.querySelector(`[data-set-id="${setId}"]`);
  const blocksContainer = setDiv.querySelector('.set-blocks-container');
  
  const blockDiv = document.createElement('div');
  blockDiv.className = 'block-row p-3 bg-white/5 rounded-xl border border-white/10';
  
  blockDiv.innerHTML = `
    <div class="flex flex-wrap gap-2 items-center">
      <input type="text" class="block-name flex-1 min-w-[120px] bg-transparent outline-none text-sm font-bold text-white" placeholder="Übung">
      <select class="block-type text-[9px] p-2 bg-white/10 rounded-lg outline-none uppercase font-bold text-white" onchange="handleTypeChange(this)">
        <option value="reps">Reps</option>
        <option value="zeit">Zeit</option>
        <option value="pause">Pause</option>
      </select>
      <input type="number" class="block-reps w-16 p-2 bg-white/10 rounded-lg outline-none text-center text-xs font-bold text-white" placeholder="12" min="0">
      <input type="number" class="block-sets w-16 p-2 bg-white/10 rounded-lg outline-none text-center text-xs font-bold text-white" placeholder="3" min="0">
      <input type="number" class="block-zeit hidden w-20 p-2 bg-white/10 rounded-lg outline-none text-center text-xs font-bold text-white" placeholder="60s" min="0">
      <input type="number" class="block-pause hidden w-20 p-2 bg-white/10 rounded-lg outline-none text-center text-xs font-bold text-white" placeholder="30s" min="0">
      <button type="button" onclick="this.parentElement.parentElement.remove()" class="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-all text-xs">×</button>
    </div>
  `;
  
  blocksContainer.appendChild(blockDiv);
}

function addBlockRow() {
  const container = document.getElementById('blocks-container');
  const blockDiv = document.createElement('div');
  blockDiv.className = 'block-row p-3 sm:p-4 card';
  
  blockDiv.innerHTML = `
    <div class="flex flex-wrap gap-2 items-center">
      <input type="text" class="block-name flex-1 min-w-[120px] input-dark text-sm sm:text-base" placeholder="Übungsname" style="padding: 0.6rem 1rem;">
      <button type="button" onclick="showSportTypeModal(this.nextElementSibling)" class="block-type-display text-[9px] sm:text-[10px] px-3 sm:px-4 py-2 sm:py-3 bg-white/10 rounded-xl font-bold uppercase text-white whitespace-nowrap">
        Reps
      </button>
      <select class="block-type hidden" onchange="handleTypeChange(this)">
        <option value="reps">Reps</option>
        <option value="zeit">Zeit</option>
        <option value="pause">Pause</option>
      </select>
      <input type="number" class="block-reps w-16 sm:w-20 p-2 sm:p-3 input-dark text-center text-xs sm:text-sm font-bold" placeholder="12" min="0">
      <input type="number" class="block-sets w-16 sm:w-20 p-2 sm:p-3 input-dark text-center text-xs sm:text-sm font-bold" placeholder="3" min="0">
      <input type="number" class="block-zeit hidden w-20 sm:w-24 p-2 sm:p-3 input-dark text-center text-xs sm:text-sm font-bold" placeholder="60s" min="0">
      <input type="number" class="block-pause hidden w-20 sm:w-24 p-2 sm:p-3 input-dark text-center text-xs sm:text-sm font-bold" placeholder="30s" min="0">
      <button type="button" onclick="this.parentElement.parentElement.remove()" class="p-2 sm:p-3 bg-red-500/20 rounded-xl text-red-400 hover:bg-red-500/30 transition-all text-sm sm:text-base">×</button>
    </div>
  `;
  
  container.appendChild(blockDiv);
}

function handleTypeChange(select) {
  const row = select.closest('.block-row');
  const type = select.value;
  
  // Update display button text
  const displayBtn = row.querySelector('.block-type-display');
  if (displayBtn) {
    const typeLabels = {
      'reps': 'Reps',
      'zeit': 'Zeit',
      'pause': 'Pause'
    };
    displayBtn.textContent = typeLabels[type] || type;
  }
  
  const repsInput = row.querySelector('.block-reps');
  const setsInput = row.querySelector('.block-sets');
  const zeitInput = row.querySelector('.block-zeit');
  const pauseInput = row.querySelector('.block-pause');

  repsInput.classList.toggle('hidden', type !== 'reps');
  setsInput.classList.toggle('hidden', type !== 'reps');
  zeitInput.classList.toggle('hidden', type !== 'zeit');
  pauseInput.classList.toggle('hidden', type !== 'pause');
  
  // Add/remove compact styling for pause blocks
  if (type === 'pause') {
    row.classList.add('block-compact');
  } else {
    row.classList.remove('block-compact');
  }
}

function handleWorkoutNameInput() {
  const syncCheck = document.getElementById('sync-names-check');
  if (!syncCheck.checked) return;
  syncAllBlockNames();
}

function syncAllBlockNames() {
  const syncCheck = document.getElementById('sync-names-check');
  if (!syncCheck.checked) return;
  
  const workoutName = document.getElementById('workout-name').value.trim();
  if (!workoutName) return;
  
  const setsModeEnabled = document.getElementById('sets-mode-check').checked;
  
  if (setsModeEnabled) {
    // Sync blocks in all sets
    document.querySelectorAll('.set-section').forEach(setDiv => {
      const blocks = setDiv.querySelectorAll('.block-name');
      blocks.forEach(input => {
        if (input.value.trim() === '') {
          input.value = workoutName;
        }
      });
    });
  } else {
    // Sync regular blocks
    const blocks = document.querySelectorAll('.block-name');
    blocks.forEach(input => {
      if (input.value.trim() === '') {
        input.value = workoutName;
      }
    });
  }
}

function saveSportWorkout() {
  const name = document.getElementById('workout-name').value.trim();
  if (!name) {
    alert('Bitte gib einen Workout-Namen ein.');
    return;
  }

  const setsModeEnabled = document.getElementById('sets-mode-check').checked;
  let workoutData;
  
  if (setsModeEnabled) {
    // Save workout with sets
    const sets = [];
    document.querySelectorAll('.set-section').forEach(setDiv => {
      const setName = setDiv.querySelector('.set-name-input').value.trim() || 'Unbenanntes Set';
      const blocks = [];
      
      setDiv.querySelectorAll('.block-row').forEach(row => {
        const blockName = row.querySelector('.block-name').value.trim() || 'Übung';
        const type = row.querySelector('.block-type').value;
        
        const block = { name: blockName, type };
        
        if (type === 'reps') {
          block.reps = parseInt(row.querySelector('.block-reps').value) || 0;
          block.sets = parseInt(row.querySelector('.block-sets').value) || 0;
        } else if (type === 'zeit') {
          block.zeit = parseInt(row.querySelector('.block-zeit').value) || 0;
        } else if (type === 'pause') {
          block.pause = parseInt(row.querySelector('.block-pause').value) || 0;
        }
        
        blocks.push(block);
      });
      
      if (blocks.length > 0) {
        sets.push({ name: setName, blocks });
      }
    });
    
    if (sets.length === 0) {
      alert('Bitte füge mindestens ein Set mit Blöcken hinzu.');
      return;
    }
    
    workoutData = {
      id: editingWorkoutId || Date.now().toString(),
      name,
      setsMode: true,
      sets,
      createdAt: editingWorkoutId ? workouts.find(w => w.id === editingWorkoutId).createdAt : new Date().toISOString()
    };
  } else {
    // Save regular workout
    const blocks = [];
    document.querySelectorAll('.block-row').forEach(row => {
      const blockName = row.querySelector('.block-name').value.trim() || 'Übung';
      const type = row.querySelector('.block-type').value;
      
      const block = { name: blockName, type };
      
      if (type === 'reps') {
        block.reps = parseInt(row.querySelector('.block-reps').value) || 0;
        block.sets = parseInt(row.querySelector('.block-sets').value) || 0;
      } else if (type === 'zeit') {
        block.zeit = parseInt(row.querySelector('.block-zeit').value) || 0;
      } else if (type === 'pause') {
        block.pause = parseInt(row.querySelector('.block-pause').value) || 0;
      }
      
      blocks.push(block);
    });
    
    if (blocks.length === 0) {
      alert('Bitte füge mindestens einen Block hinzu.');
      return;
    }
    
    workoutData = {
      id: editingWorkoutId || Date.now().toString(),
      name,
      setsMode: false,
      blocks,
      createdAt: editingWorkoutId ? workouts.find(w => w.id === editingWorkoutId).createdAt : new Date().toISOString()
    };
  }

  if (editingWorkoutId) {
    const index = workouts.findIndex(w => w.id === editingWorkoutId);
    workouts[index] = workoutData;
  } else {
    workouts.push(workoutData);
  }

  localStorage.setItem('habitus_sport_workouts', JSON.stringify(workouts));
  hideSportModal('sport-workout-modal');
  renderSportPage();
}

function editWorkout(id) {
  const workout = workouts.find(w => w.id === id);
  if (!workout) return;

  editingWorkoutId = id;
  document.getElementById('workout-name').value = workout.name;
  document.getElementById('sync-names-check').checked = false;
  document.getElementById('sets-mode-check').checked = workout.setsMode || false;
  document.getElementById('blocks-container').innerHTML = '';
  
  if (workout.setsMode && workout.sets) {
    // Load sets
    workout.sets.forEach(set => {
      addSetSection();
      const setDiv = document.querySelector('.set-section:last-child');
      setDiv.querySelector('.set-name-input').value = set.name;
      
      // Clear default block
      setDiv.querySelector('.set-blocks-container').innerHTML = '';
      
      // Add blocks to set
      set.blocks.forEach(block => {
        addBlockToSet(setDiv.dataset.setId);
        const blockRow = setDiv.querySelector('.block-row:last-child');
        blockRow.querySelector('.block-name').value = block.name;
        blockRow.querySelector('.block-type').value = block.type;
        
        if (block.type === 'reps') {
          blockRow.querySelector('.block-reps').value = block.reps || '';
          blockRow.querySelector('.block-sets').value = block.sets || '';
        } else if (block.type === 'zeit') {
          blockRow.querySelector('.block-zeit').value = block.zeit || '';
        } else if (block.type === 'pause') {
          blockRow.querySelector('.block-pause').value = block.pause || '';
        }
        
        handleTypeChange(blockRow.querySelector('.block-type'));
      });
    });
  } else {
    // Load regular blocks
    workout.blocks.forEach(block => {
      addBlockRow();
      const row = document.querySelector('.block-row:last-child');
      row.querySelector('.block-name').value = block.name;
      row.querySelector('.block-type').value = block.type;
      
      if (block.type === 'reps') {
        row.querySelector('.block-reps').value = block.reps || '';
        row.querySelector('.block-sets').value = block.sets || '';
      } else if (block.type === 'zeit') {
        row.querySelector('.block-zeit').value = block.zeit || '';
      } else if (block.type === 'pause') {
        row.querySelector('.block-pause').value = block.pause || '';
      }
      
      handleTypeChange(row.querySelector('.block-type'));
    });
  }

  document.getElementById('delete-workout-btn').classList.remove('hidden');
  document.getElementById('sport-workout-modal').classList.remove('hidden');
}

function deleteWorkout(id) {
  const workout = workouts.find(w => w.id === id);
  if (!workout) return;

  showSportDeleteModal(
    'Workout löschen?',
    `Möchtest du "${workout.name}" wirklich löschen?`,
    () => {
      workouts = workouts.filter(w => w.id !== id);
      localStorage.setItem('habitus_sport_workouts', JSON.stringify(workouts));
      hideSportModal('sport-workout-modal');
      renderSportPage();
    }
  );
}

function hideSportModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
  editingWorkoutId = null;
}

// ===== RENDER SPORT PAGE =====
function renderSportPage() {
  const workoutsHtml = workouts.length === 0 
    ? '<div class="text-center text-gray-400 py-12">Noch keine Workouts erstellt</div>'
    : workouts.map(w => {
        const blockCount = w.setsMode 
          ? w.sets.reduce((total, set) => total + set.blocks.length, 0)
          : w.blocks.length;
        const setInfo = w.setsMode ? `${w.sets.length} Sets | ` : '';
        
        return `
          <div class="card p-4 flex items-center justify-between group hover:bg-white/10 transition-all">
            <div class="flex-1" onclick="startWorkout('${w.id}')">
              <h4 class="font-black text-base sm:text-lg mb-1 text-white">${w.name}</h4>
              <p class="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">${setInfo}${blockCount} Blöcke</p>
            </div>
            <button onclick="editWorkout('${w.id}')" class="p-2 sm:p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          </div>
        `;
      }).join('');

  document.getElementById('sport-workouts-list').innerHTML = workoutsHtml;
}

function renderSportHistory() {
  const historyHtml = sportHistory.length === 0
    ? '<div class="text-center text-gray-400 py-12">Noch keine Workouts absolviert</div>'
    : sportHistory.slice().reverse().map(h => {
        const date = new Date(h.date);
        const duration = Math.floor(h.duration / 60);
        return `
          <div class="card p-4">
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-black text-base text-white">${h.workoutName}</h4>
              <span class="text-xs text-gray-400">${date.toLocaleDateString('de-DE')}</span>
            </div>
            <p class="text-xs text-gray-400">${duration} Min. | ${h.blocks.length} Blöcke</p>
          </div>
        `;
      }).join('');

  document.getElementById('sport-history-list').innerHTML = historyHtml;
}

function calculateSportStats() {
  const totalWorkouts = sportHistory.length;
  const totalMinutes = sportHistory.reduce((sum, h) => sum + Math.floor(h.duration / 60), 0);
  const uniqueWorkouts = [...new Set(sportHistory.map(h => h.workoutId))].length;

  document.getElementById('sport-stat-total').textContent = totalWorkouts;
  document.getElementById('sport-stat-minutes').textContent = totalMinutes;
  document.getElementById('sport-stat-unique').textContent = uniqueWorkouts;
}

// Initialize on page load
renderSportPage();
