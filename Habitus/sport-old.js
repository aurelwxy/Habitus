// ===== SPORT MODULE =====

let workouts = JSON.parse(localStorage.getItem('habitus_sport_workouts') || '[]');
let sportHistory = JSON.parse(localStorage.getItem('habitus_sport_history') || '[]');
let currentWorkout = null;
let currentBlockIdx = 0;
let timerInterval = null;
let startTime = null;
let editingWorkoutId = null;
let pendingDeleteAction = null;
let currentTypeSelectElement = null;

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

// ===== PLAYER LOGIC =====
function startWorkout(id) {
  currentWorkout = workouts.find(w => w.id === id);
  currentBlockIdx = 0;
  startTime = Date.now();
  document.getElementById('sport-player-page').classList.remove('hidden');
  document.getElementById('player-workout-name').innerText = currentWorkout.name;
  updatePlayerUI();
}

function updatePlayerUI() {
  clearInterval(timerInterval);
  const block = currentWorkout.blocks[currentBlockIdx];
  const displayValue = document.getElementById('player-main-value');
  const displayUnit = document.getElementById('player-main-unit');
  const actionBtn = document.getElementById('player-action-btn');
  const circle = document.getElementById('timer-circle');

  document.getElementById('player-current-block-title').innerText = block.name;
  document.getElementById('player-progress').innerText = `Block ${currentBlockIdx + 1} von ${currentWorkout.blocks.length}`;
  
  circle.classList.remove('timer-active', 'bg-indigo-500/10');

  if (block.type === 'reps') {
    displayValue.innerText = block.reps || "0";
    displayUnit.innerText = "Wiederholungen";
    actionBtn.innerText = "FERTIG";
    actionBtn.classList.remove('bg-indigo-600', 'text-white');
    actionBtn.classList.add('bg-white', 'text-black');
  } else {
    let timeLeft = parseInt(block.seconds);
    displayValue.innerText = timeLeft;
    displayUnit.innerText = block.type === 'pause' ? "Pause" : "Sekunden";
    actionBtn.innerText = "STOP / WEITER";
    actionBtn.classList.remove('bg-white', 'text-black');
    actionBtn.classList.add('bg-indigo-600', 'text-white');
    circle.classList.add('timer-active', 'bg-indigo-500/10');

    timerInterval = setInterval(() => {
      timeLeft--;
      displayValue.innerText = timeLeft;
      if(timeLeft <= 0) {
        clearInterval(timerInterval);
        nextSportBlock();
      }
    }, 1000);
  }
}

function handlePlayerAction() {
  const block = currentWorkout.blocks[currentBlockIdx];
  if (block.type === 'reps') {
    nextSportBlock();
  } else {
    nextSportBlock();
  }
}

function nextSportBlock() {
  currentBlockIdx++;
  if (currentBlockIdx < currentWorkout.blocks.length) {
    updatePlayerUI();
  } else {
    finishWorkout();
  }
}

function finishWorkout() {
  const duration = Math.round((Date.now() - startTime) / 1000);
  const entry = {
    id: Date.now(),
    name: currentWorkout.name,
    date: new Date().toLocaleDateString('de-DE'),
    durationSeconds: duration,
    timestamp: Date.now()
  };
  sportHistory.push(entry);
  localStorage.setItem('habitus_sport_history', JSON.stringify(sportHistory));
  exitSportPlayer();
  switchSportTab('history');
}

function exitSportPlayer() {
  clearInterval(timerInterval);
  document.getElementById('sport-player-page').classList.add('hidden');
}

// ===== WORKOUT EDITOR =====
function openCreateWorkoutModal() {
  editingWorkoutId = null;
  document.getElementById('workout-name').value = "";
  document.getElementById('blocks-container').innerHTML = "";
  document.getElementById('delete-workout-btn').classList.add('hidden');
  addBlockRow();
  document.getElementById('sport-workout-modal').classList.remove('hidden');
}

function addBlockRow(data = null) {
  const div = document.createElement('div');
  div.className = "block-row card p-4 bg-white/5 relative rounded-2xl";
  const typeValue = data ? data.type : "reps";
  const nameValue = data ? data.name : (document.getElementById('sync-names-check').checked ? document.getElementById('workout-name').value : "");

  div.innerHTML = `
    <div class="edit-view space-y-4">
      <div class="flex items-center gap-3">
        <div class="drag-handle cursor-grab text-gray-600 text-xl opacity-30">⠿</div>
        <input type="text" value="${nameValue}" placeholder="Name" class="block-name-input bg-transparent border-b border-white/10 flex-1 outline-none font-bold text-orange-400">
        <button onclick="showSportTypeModal(this.nextElementSibling)" class="bg-white/5 text-white text-[10px] font-bold p-1.5 px-3 rounded type-display-btn">
          ${typeValue === 'reps' ? 'Wdh.' : typeValue === 'zeit' ? 'Zeit' : 'Pause'}
        </button>
        <select class="hidden block-type-select">
          <option value="reps" ${typeValue==='reps'?'selected':''}>Wdh.</option>
          <option value="zeit" ${typeValue==='zeit'?'selected':''}>Zeit</option>
          <option value="pause" ${typeValue==='pause'?'selected':''}>Pause</option>
        </select>
        <button onclick="confirmBlock(this)" class="text-orange-500 font-bold text-lg">✓</button>
      </div>
      <div class="input-fields">
        <div class="reps-area ${typeValue !== 'reps' ? 'hidden' : ''}">
          <input type="number" value="${data?.reps || ''}" placeholder="Anzahl" class="input-dark text-sm block-reps">
        </div>
        <div class="time-area ${typeValue === 'reps' ? 'hidden' : ''}">
          <div class="flex justify-between text-[10px] mb-2 text-gray-500 uppercase font-bold">
            <span class="type-label">${typeValue==='pause'?'Pause':'Ziel'}</span>
            <span class="text-orange-400 time-display">${Math.floor((data?.seconds||30)/60)}m ${(data?.seconds||30)%60}s</span>
          </div>
          <input type="range" min="5" max="600" step="5" value="${data?.seconds||30}" oninput="updateTimeLabel(this)" class="block-seconds-range">
        </div>
      </div>
    </div>
    <div class="compact-view hidden">
      <div class="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
        <div class="flex items-center gap-3 flex-1">
          <div class="drag-handle cursor-grab text-orange-400 text-xl">⠿</div>
          <div class="flex-1">
            <span class="compact-name font-bold text-sm text-white block">${nameValue || 'Übung'}</span>
            <span class="compact-val text-xs text-orange-400"></span>
          </div>
        </div>
        <button onclick="editBlockRow(this)" class="text-[10px] font-bold text-orange-500 uppercase px-3 py-1 bg-orange-500/20 rounded-lg hover:bg-orange-500/30 transition-all">Edit</button>
      </div>
    </div>
  `;
  document.getElementById('blocks-container').appendChild(div);
  if(data) confirmBlock(div.querySelector('.edit-view button[onclick*="confirmBlock"]'));
}

function handleTypeChange(select) {
  const row = select.closest('.block-row');
  const type = select.value;
  row.querySelector('.reps-area').classList.toggle('hidden', type !== 'reps');
  row.querySelector('.time-area').classList.toggle('hidden', type === 'reps');
  if(type === 'pause') row.querySelector('.block-name-input').value = "Pause";
  
  // Update button text
  const displayBtn = row.querySelector('.type-display-btn');
  if (displayBtn) {
    displayBtn.innerText = type === 'reps' ? 'Wdh.' : type === 'zeit' ? 'Zeit' : 'Pause';
  }
}

function handleWorkoutNameInput() { 
  if(document.getElementById('sync-names-check').checked) syncAllBlockNames(); 
}

function syncAllBlockNames() {
  const name = document.getElementById('workout-name').value;
  document.querySelectorAll('.block-row').forEach(row => {
    if(row.querySelector('.block-type-select').value !== 'pause') {
      row.querySelector('.block-name-input').value = name;
    }
  });
}

function updateTimeLabel(input) {
  const v = input.value;
  input.previousElementSibling.querySelector('.time-display').innerText = `${Math.floor(v/60)}m ${v%60}s`;
}

function confirmBlock(btn) {
  const row = btn.closest('.block-row');
  const type = row.querySelector('.block-type-select').value;
  const val = type === 'reps' ? (row.querySelector('.block-reps').value + " Wdh.") : (Math.floor(row.querySelector('.block-seconds-range').value/60) + "m " + (row.querySelector('.block-seconds-range').value%60) + "s");
  row.querySelector('.compact-val').innerText = val;
  row.querySelector('.compact-name').innerText = row.querySelector('.block-name-input').value;
  row.querySelector('.edit-view').classList.add('hidden');
  row.querySelector('.compact-view').classList.remove('hidden');
  row.classList.add('block-compact');
  
  // Enable dragging for all drag handles
  document.querySelectorAll('.drag-handle').forEach(handle => {
    handle.style.cursor = 'grab';
    handle.style.opacity = '1';
  });
}

function editBlockRow(btn) {
  const row = btn.closest('.block-row');
  row.querySelector('.edit-view').classList.remove('hidden');
  row.querySelector('.compact-view').classList.add('hidden');
  row.classList.remove('block-compact');
  
  // Disable dragging for edit view drag handles
  row.querySelector('.edit-view .drag-handle').style.cursor = 'not-allowed';
  row.querySelector('.edit-view .drag-handle').style.opacity = '0.3';
}

function saveSportWorkout() {
  const name = document.getElementById('workout-name').value;
  if(!name) {
    showToast('Name fehlt', 'error');
    return;
  }
  const blocks = Array.from(document.querySelectorAll('.block-row')).map(row => ({
    name: row.querySelector('.block-name-input').value || "Übung",
    type: row.querySelector('.block-type-select').value,
    reps: row.querySelector('.block-reps').value,
    seconds: row.querySelector('.block-seconds-range').value
  }));
  const data = { id: editingWorkoutId || Date.now(), name, blocks };
  if(editingWorkoutId) workouts = workouts.map(w => w.id === editingWorkoutId ? data : w);
  else workouts.push(data);
  localStorage.setItem('habitus_sport_workouts', JSON.stringify(workouts));
  renderWorkouts();
  hideSportModal('sport-workout-modal');
  showToast('Workout gespeichert!', 'success');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.innerText = message;
    toast.style.background = type === 'error' ? '#ef4444' : '#22c55e';
    toast.style.opacity = '1';
    toast.style.pointerEvents = 'auto';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.pointerEvents = 'none';
    }, 3000);
  }
}

function renderWorkouts() {
  document.getElementById('workout-list').innerHTML = workouts.map(w => `
    <div class="card p-6 flex justify-between items-center rounded-[2rem] bg-white/5 border border-white/10">
      <div onclick="startWorkout(${w.id})" class="cursor-pointer">
        <h3 class="font-black text-xl">${w.name}</h3>
        <p class="text-xs text-gray-500">${w.blocks.length} Übungen</p>
      </div>
      <div class="flex gap-4 items-center">
        <button onclick="editWorkout(${w.id})" class="text-[10px] font-bold text-gray-500 uppercase">Edit</button>
        <button onclick="startWorkout(${w.id})" class="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center text-xl shadow-xl shadow-white/5 active:scale-90 transition-all">▶</button>
      </div>
    </div>
  `).reverse().join('');
}

function editWorkout(id) {
  const w = workouts.find(x => x.id === id);
  editingWorkoutId = id;
  document.getElementById('workout-name').value = w.name;
  document.getElementById('blocks-container').innerHTML = "";
  document.getElementById('delete-workout-btn').classList.remove('hidden');
  w.blocks.forEach(b => addBlockRow(b));
  document.getElementById('sport-workout-modal').classList.remove('hidden');
}

function deleteWorkout(id) {
  showSportDeleteModal(
    'Workout löschen?',
    'Das Workout wird dauerhaft gelöscht.',
    () => {
      workouts = workouts.filter(w => w.id !== id);
      localStorage.setItem('habitus_sport_workouts', JSON.stringify(workouts));
      renderWorkouts();
      hideSportModal('sport-workout-modal');
      showToast('Workout gelöscht', 'success');
    }
  );
}

function calculateSportStats() {
  const now = Date.now();
  const today = sportHistory.filter(h => (now - h.timestamp) < 86400000).reduce((a, b) => a + b.durationSeconds, 0);
  const week = sportHistory.filter(h => (now - h.timestamp) < 604800000).reduce((a, b) => a + b.durationSeconds, 0);
  const fmt = (s) => s > 0 ? `${Math.floor(s/60)}m ${s%60}s` : "—";
  document.getElementById('sport-stats-today').innerText = fmt(today);
  document.getElementById('sport-stats-week').innerText = fmt(week);
}

function renderSportHistory() {
  document.getElementById('sport-history-list').innerHTML = sportHistory.length ? sportHistory.map(h => `
    <div class="card p-5 flex justify-between items-center rounded-[2rem] bg-white/5 border border-white/10">
      <div>
        <h4 class="font-bold">${h.name}</h4>
        <p class="text-[10px] text-gray-500 uppercase">${h.date}</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-gray-400 text-xs font-bold">${Math.floor(h.durationSeconds/60)}m ${h.durationSeconds%60}s</div>
        <button onclick="deleteSportHistoryEntry(${h.id})" class="text-red-500/80 hover:text-red-500 text-xs font-bold">×</button>
      </div>
    </div>
  `).reverse().join('') : "<p class='text-center text-gray-600 py-10'>Noch kein Verlauf</p>";
}

function deleteSportHistoryEntry(id) {
  showSportDeleteModal(
    'Eintrag löschen?',
    'Dieser Verlauf wird dauerhaft gelöscht.',
    () => {
      sportHistory = sportHistory.filter(h => h.id !== id);
      localStorage.setItem('habitus_sport_history', JSON.stringify(sportHistory));
      renderSportHistory();
      showToast('Eintrag gelöscht', 'success');
    }
  );
}

function hideSportModal(id) { 
  document.getElementById(id).classList.add('hidden'); 
  editingWorkoutId = null; 
}

// Initialize sortable for blocks
document.addEventListener('DOMContentLoaded', function() {
  const blocksContainer = document.getElementById('blocks-container');
  if (blocksContainer && typeof Sortable !== 'undefined') {
    Sortable.create(blocksContainer, { 
      animation: 150, 
      handle: '.drag-handle',
      filter: 'input, select, button:not(.drag-handle)',
      preventOnFilter: false
    });
  }
  // Render workouts when page loads if we're on sport page
  if (typeof renderWorkouts === 'function') {
    renderWorkouts();
  }
});
