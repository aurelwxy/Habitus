// ===== DYNAMIC COLOR THEMING OVERRIDES =====
// This file overrides functions to add dynamic coloring based on selected habit color

// Override selectHabitColor to apply theming
const originalSelectHabitColor = window.selectHabitColor;
window.selectHabitColor = function(color) {
  if (originalSelectHabitColor) {
    originalSelectHabitColor(color);
  } else {
    selectedHabitColor = color;
    if (typeof renderHabitColorPicker === 'function') {
      renderHabitColorPicker();
    }
  }
  applyHabitModalTheming();
};

function applyHabitModalTheming() {
  const color = selectedHabitColor;
  
  // Update habit type buttons to use selected color
  if (typeof updateHabitTypeButtons === 'function') {
    updateHabitTypeButtons();
  }
  
  // Update daily days buttons
  if (typeof updateDailyDaysButtons === 'function') {
    updateDailyDaysButtons();
  }
  
  // Update save button
  const saveBtn = document.getElementById('save-habit-btn');
  if (saveBtn) {
    saveBtn.style.background = `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;
  }
  
  // Update icon picker borders
  document.querySelectorAll('.habit-icon-btn').forEach(btn => {
    if (btn.classList.contains('selected')) {
      btn.style.borderColor = color;
      btn.style.background = color + '33';
    }
  });
}

// Override updateHabitTypeButtons with dynamic colors
window.updateHabitTypeButtons = function() {
  document.querySelectorAll('.habit-type-chip').forEach(btn => {
    const type = btn.dataset.habitType;
    const isSelected = type === selectedHabitType;
    const color = selectedHabitColor;
    
    if (isSelected) {
      btn.style.border = `2px solid ${color}`;
      btn.style.background = color + '33';  // 20% opacity
      btn.style.color = color;
    } else {
      btn.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      btn.style.background = 'rgba(255, 255, 255, 0.05)';
      btn.style.color = '#9ca3af';
    }
  });
};

// Fix streak icon causing habit block to grow
document.addEventListener('DOMContentLoaded', function() {
  // Add CSS to prevent habit cards from growing when streak appears
  const style = document.createElement('style');
  style.textContent = `
    .habit-card {
      min-height: fit-content;
    }
    .habit-card .streak-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      transform: none !important;
    }
  `;
  document.head.appendChild(style);
});
