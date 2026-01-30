// Service Worker Registration + beforeinstallprompt handling
let deferredPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    window.deferredPrompt = e; // expose for manual triggering
    console.log('beforeinstallprompt event gespeichert');
  });

  window.addEventListener('appinstalled', () => {
    console.log('App wurde installiert');
    deferredPrompt = null;
    window.deferredPrompt = null;
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registriert!', reg))
      .catch(err => console.error('Registrierung fehlgeschlagen:', err));
  });
}

// Helper: trigger install prompt programmatically (e.g., call window.triggerPwaInstall())
window.triggerPwaInstall = async () => {
  if (!deferredPrompt) {
    console.log('Kein Install-Prompt verfügbar');
    return false;
  }
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  window.deferredPrompt = null;
  console.log('Install prompt choice:', choice.outcome);
  return choice;
};

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
  } else if (type === 'workout') {
    if (typeof openCreateWorkoutModal === 'function') openCreateWorkoutModal();
  }
}
