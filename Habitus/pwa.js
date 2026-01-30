// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registriert!', reg))
      .catch(err => console.error('Registrierung fehlgeschlagen:', err));
  });
}

// Plus Button Logic
let isPlusMenuOpen = false;

function togglePlusMenu() {
  const menu = document.getElementById('plus-menu');
  const overlay = document.getElementById('plus-overlay');
  const items = document.querySelectorAll('.plus-menu-item');
  const plusIcon = document.getElementById('plus-icon-svg');

  isPlusMenuOpen = !isPlusMenuOpen;

  if (isPlusMenuOpen) {
    overlay.classList.remove('hidden');
    menu.classList.remove('pointer-events-none');
    if (plusIcon) plusIcon.style.transform = 'rotate(45deg)';
    
    setTimeout(() => {
      overlay.classList.add('opacity-100');
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.remove('translate-y-20', 'opacity-0');
        }, index * 60);
      });
    }, 10);
  } else {
    if (plusIcon) plusIcon.style.transform = 'rotate(0deg)';
    overlay.classList.remove('opacity-100');
    items.forEach(item => item.classList.add('translate-y-20', 'opacity-0'));
    
    setTimeout(() => {
      overlay.classList.add('hidden');
      menu.classList.add('pointer-events-none');
    }, 300);
  }
}

function handlePlusSelection(type) {
  togglePlusMenu(); // Menü erst schließen
  
  if (type === 'habit') {
    // Falls deine Funktion openHabitModal heißt, bitte hier anpassen!
    if (typeof openHabitModal === 'function') openHabitModal();
    else if (typeof openModal === 'function') openModal();
  } else if (type === 'todo') {
    if (typeof openTodoModal === 'function') openTodoModal();
    else navigateToPage('todos');
  }
}
