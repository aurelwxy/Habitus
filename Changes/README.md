# 🔥 Habitus - Streak System & Workout Sets Mode

## 📦 Neue Features

### 1. Advanced Streak System
- ✅ **Täglicher Gesamtstreak**: Wird nur erhöht, wenn ALLE täglichen Habits und fälligen Todos erledigt sind
- ✅ **Individuelle Habit-Streaks**: Jedes Habit zeigt seine eigene Streak-Kette
- ✅ **XP-System**: 
  - +10 XP pro erledigtem Habit
  - +5 XP pro erledigtem Todo
- ✅ **Freeze-Streaks (Streak auf Eis)**: 
  - Bei 100 XP erhältst du 1 Freeze ❄️
  - Rettet deinen Streak für einen verpassten Tag
- ✅ **Wöchentliche Visualisierung**:
  - Mo-So Kalender mit Icons
  - 🔥 = Tag erfüllt
  - ❄️ = Mit Freeze gerettet
  - ❌ = Nicht erfüllt
- ✅ **Detailseite**: Klick auf die Streak-Karte öffnet die Detailansicht

### 2. Workout Sets Mode
- ✅ **Sets-Modus**: Aktivierbar über Checkbox "Sets Modus"
- ✅ **Sets hinzufügen**: Benenne und organisiere Übungen in Sets
- ✅ **Blöcke in Sets**: Füge beliebig viele Blöcke zu jedem Set hinzu
- ✅ **Sets duplizieren**: Kopiere komplette Sets mit allen Blöcken
- ✅ **Kollabierbare Sets**: Ein-/Ausklappen via Dropdown
- ✅ **Pause-Button**: Pausiere das Workout während der Ausführung
- ✅ **Fortschrittsanzeige**: Zeigt "Set X | Block Y von Z"

## 📁 Dateien

1. **streak-system.js** (13 KB)
   - Komplettes Streak- und XP-Management
   - LocalStorage-Integration
   - Visualisierungs-Funktionen

2. **sport-enhanced.js** (29 KB)
   - Erweiterter sport.js mit Sets-Modus
   - Pause-Funktionalität
   - Duplikations-Features

3. **app-js-patch.js** (6.7 KB)
   - Änderungen für app.js
   - Code-Snippets zum Einfügen
   - Vollständige Beispiel-Funktionen

4. **html-additions.html** (2.5 KB)
   - HTML-Code für neue UI-Elemente
   - Streak-Details-Seite
   - Pause-Button
   - Sets-Modus-Checkbox

5. **INTEGRATION_GUIDE.md** (9.4 KB)
   - Schritt-für-Schritt Anleitung
   - Detaillierte Code-Positionen
   - Datenstruktur-Dokumentation

## 🚀 Quick Start

### Option 1: Automatische Integration (Empfohlen)

1. **Füge die neuen JavaScript-Dateien hinzu:**
   ```html
   <!-- In index.html vor </body> -->
   <script src="app.js"></script>
   <script src="streak-system.js"></script>
   <script src="sport-enhanced.js"></script>  <!-- ersetzt sport.js -->
   <script src="custom-modals.js"></script>
   <script src="dynamic-color-override.js"></script>
   ```

2. **Ersetze sport.js:**
   - Benenne `sport.js` um zu `sport-old.js` (Backup)
   - Benenne `sport-enhanced.js` um zu `sport.js`
   - ODER ändere den Script-Tag wie oben gezeigt

3. **Füge HTML-Elemente hinzu:**
   - Öffne `html-additions.html`
   - Kopiere die Sections in deine `index.html` an den angegebenen Stellen

4. **Passe app.js an:**
   - Öffne `app-js-patch.js`
   - Suche die markierten Funktionen in deiner `app.js`
   - Füge die Code-Änderungen ein (siehe Kommentare im Patch)

### Option 2: Manuelle Integration

Folge der detaillierten Anleitung in `INTEGRATION_GUIDE.md`

## 📋 Änderungen in bestehenden Dateien

### index.html

**Zeile ~234** - Streak Card (Dashboard):
```html
<!-- ALT -->
<div class="card p-5 ... ">
  <span id="stat-streak" class="text-3xl...">0</span>
</div>

<!-- NEU -->
<div class="card p-5 ... cursor-pointer" onclick="openStreakDetails()">
  <div id="dashboard-total-streak"></div>
</div>
```

**Nach Zeile 277** - Neue Seite hinzufügen:
```html
<!-- Streak Details Page -->
<main id="streak-details-page" class="page ... hidden">
  <div id="streak-details-content"></div>
</main>
```

**Zeile ~765** - Pause Button:
```html
<button id="player-pause-btn" onclick="togglePause()" ...>
  Pause
</button>
```

**Zeile ~776** - Sets Modus Checkbox:
```html
<div class="flex items-center gap-2 ...">
  <input type="checkbox" id="sets-mode-check" onchange="toggleSetsMode()" ...>
  <label for="sets-mode-check">Sets Modus</label>
</div>
```

### app.js

**toggleHabitCompletion():**
```javascript
// Vorher state speichern
const wasCompleted = completion.completed;

// Nach dem Toggle
if (!wasCompleted && completion.completed) {
  awardHabitXP(habitId);
}
habit.streak = getHabitStreak(habit);
updateDailyStreak();
```

**toggleTodo():**
```javascript
const wasCompleted = todo.completed;
if (todo.completed && !wasCompleted) {
  awardTodoXP(todoId);
}
updateDailyStreak();
```

**renderStatsPage():**
```javascript
// Ersetze:
// document.getElementById('stat-streak').textContent = maxStreak;
// Mit:
updateStreakDisplay();
```

**navigateToPage():**
```javascript
// Füge hinzu:
'streak-details': 'streak-details-page'

// Und:
if (pageName === 'streak-details') {
  document.getElementById('streak-details-content').innerHTML = 
    renderStreakDetailsPage();
}
```

**Initialisierung:**
```javascript
// Am Ende von app.js oder in DOMContentLoaded:
initStreakSystem();
updateStreakDisplay();
updateDailyStreak();
```

## 🧪 Testing

### Streak System testen:

1. **XP verdienen:**
   - Erstelle ein Daily Habit
   - Erledige es → +10 XP sollte angezeigt werden
   - Erstelle und erledige ein Todo → +5 XP

2. **Freeze bekommen:**
   - Sammle 100 XP (10 Habits oder 20 Todos)
   - Ein ❄️ sollte erscheinen
   - XP Counter resettet auf 0

3. **Streak Details:**
   - Klicke auf die Streak-Karte im Dashboard
   - Sollte die Detailseite öffnen
   - Wochenkalender sollte Icons zeigen

4. **Täglicher Streak:**
   - Erledige ALLE täglichen Habits
   - Erledige ALLE fälligen Todos
   - Streak sollte sich erhöhen

5. **Individueller Habit Streak:**
   - Erledige ein Habit mehrere Tage hintereinander
   - Kleine 🔥 Badge sollte auf der Habit-Card erscheinen

### Workout Sets testen:

1. **Sets Mode aktivieren:**
   - Erstelle neues Workout
   - Aktiviere "Sets Modus" Checkbox
   - Interface sollte sich zu Sets-Ansicht ändern

2. **Set erstellen:**
   - Klicke "Set +"
   - Benenne das Set
   - Füge Blöcke hinzu

3. **Set duplizieren:**
   - Klicke auf Duplikat-Icon
   - Set sollte kopiert werden mit "(Kopie)" im Namen

4. **Kollabieren:**
   - Klicke auf Dropdown-Pfeil
   - Blöcke sollten ein-/ausgeblendet werden

5. **Workout ausführen:**
   - Starte ein Workout mit Sets
   - Pause-Button sollte sichtbar sein
   - Fortschrittstext sollte "Set X | Block Y" zeigen
   - Pause-Funktion testen

## 🔍 Troubleshooting

### Streak wird nicht aktualisiert
- ✓ Prüfe, ob `updateDailyStreak()` aufgerufen wird
- ✓ Öffne Browser Console und prüfe auf Fehler
- ✓ Prüfe LocalStorage: `habitus_streak_data`

### XP wird nicht vergeben
- ✓ Stelle sicher, dass `awardHabitXP()` bzw. `awardTodoXP()` existiert
- ✓ Prüfe, ob `streak-system.js` geladen wird
- ✓ Console sollte keine Fehler zeigen

### Sets Mode speichert nicht
- ✓ Prüfe LocalStorage: `habitus_sport_workouts`
- ✓ Stelle sicher, dass `sport-enhanced.js` geladen ist
- ✓ Prüfe Console auf Fehler beim Speichern

### Pause Button nicht sichtbar
- ✓ Prüfe, ob Button in HTML vorhanden ist
- ✓ Stelle sicher, dass `hidden` Klasse entfernt wird
- ✓ Prüfe CSS für `#player-pause-btn`

### Streak Details Seite öffnet nicht
- ✓ Prüfe, ob `<main id="streak-details-page">` existiert
- ✓ Stelle sicher, dass `navigateToPage` angepasst wurde
- ✓ Prüfe, ob `renderStreakDetailsPage()` definiert ist

## 💾 Datenstruktur

### LocalStorage Keys

**habitus_streak_data:**
```javascript
{
  totalStreak: 5,              // Gesamter Streak
  currentXP: 45,               // Aktuelles XP
  iceStreaks: 2,               // Verfügbare Freezes
  weeklyCompletions: {
    '2025-01-27': { 
      completed: true, 
      isIce: false 
    },
    '2025-01-28': { 
      completed: true, 
      isIce: true          // Mit Freeze gerettet
    }
  },
  lastCheckDate: '2025-01-30'
}
```

**habitus_sport_workouts** (mit Sets):
```javascript
{
  id: '123456',
  name: 'Push Day',
  setsMode: true,              // Sets aktiviert
  sets: [
    {
      name: 'Aufwärmen',
      blocks: [
        { 
          name: 'Jumping Jacks', 
          type: 'reps', 
          reps: 20, 
          sets: 2 
        },
        { 
          name: 'Pause', 
          type: 'pause', 
          pause: 30 
        }
      ]
    },
    {
      name: 'Hauptsatz',
      blocks: [
        { 
          name: 'Bench Press', 
          type: 'reps', 
          reps: 12, 
          sets: 4 
        }
      ]
    }
  ],
  createdAt: '2025-01-30T12:00:00.000Z'
}
```

**Reguläres Workout** (ohne Sets):
```javascript
{
  id: '123456',
  name: 'Quick Cardio',
  setsMode: false,
  blocks: [
    { name: 'Running', type: 'zeit', zeit: 600 },
    { name: 'Rest', type: 'pause', pause: 60 }
  ]
}
```

## 🎯 Funktionsweise

### Streak-Logik

1. **Tägliche Prüfung:**
   - Alle Daily Habits für heute abgeschlossen?
   - Alle fälligen Todos erledigt?
   - Falls JA → Streak +1
   - Falls NEIN → Prüfe Freeze verfügbar

2. **Freeze-Verwendung:**
   - Automatisch, wenn Tag nicht erfüllt
   - Nur wenn gestern erfüllt war
   - Verbraucht 1 Freeze
   - Streak bleibt erhalten

3. **XP-Vergabe:**
   - Bei jeder Habit-Completion
   - Bei jeder Todo-Completion
   - Automatisch zu Freeze bei 100 XP

4. **Habit-Streak:**
   - Unabhängig vom Gesamt-Streak
   - Zählt aufeinanderfolgende Tage
   - Berücksichtigt Habit-Intervall
   - Gezeigt auf Habit-Card

### Sets-Modus-Logik

1. **Erstellung:**
   - Checkbox aktivieren → Interface wechselt
   - Sets können hinzugefügt werden
   - Blöcke innerhalb von Sets

2. **Ausführung:**
   - Durchläuft alle Sets nacheinander
   - Innerhalb jedes Sets: Block für Block
   - Fortschritt zeigt Set und Block
   - Pause-Button immer verfügbar

3. **Speicherung:**
   - Sets-Array mit Blöcken
   - Flag `setsMode: true`
   - Kompatibel mit altem Format

## 📱 Features im Detail

### Streak Details Seite

- **Header**: Große Streak-Zahl mit 🔥
- **Freeze-Anzeige**: Verfügbare Freezes mit ❄️
- **XP-Fortschritt**: Balken bis 100 XP
- **Wochenkalender**: 
  - 7 Tage (Mo-So)
  - Visuelle Icons für Status
  - Heutiger Tag hervorgehoben
- **Info-Box**: Erklärung der Funktionsweise

### Workout Sets Interface

- **Kollabierbar**: Pfeile zum Ein-/Ausklappen
- **Drag & Drop**: Weiterhin mit Blöcken möglich
- **Visuelles Feedback**: Sets farblich getrennt
- **Duplikat-Funktion**: Schnelles Kopieren
- **Delete-Sicherheit**: Bestätigung vor Löschen

## 🔐 Sicherheit & Performance

- ✅ Alle Daten nur im LocalStorage
- ✅ Keine externen API-Calls
- ✅ Effiziente Streak-Berechnung
- ✅ Lazy Loading von Details
- ✅ Optimierte Render-Funktionen

## 📝 Hinweise

1. **Backup**: Erstelle Backup deiner aktuellen Dateien
2. **Testing**: Teste erst in Entwicklungsumgebung
3. **LocalStorage**: Wird automatisch migriert
4. **Browser**: Getestet in Chrome, Firefox, Safari
5. **Mobile**: Vollständig responsive

## 🆘 Support

Bei Problemen:
1. Prüfe Browser Console auf Fehler
2. Verifiziere alle Code-Änderungen
3. Teste Schritt für Schritt
4. Prüfe LocalStorage-Inhalte
5. Stelle sicher, dass alle Dateien geladen werden

## ✨ Future Ideas

- Streak-Statistiken (längster Streak, etc.)
- Achievements/Badges
- Workout-Vorlagen mit Sets
- Export/Import von Streak-Daten
- Social Sharing von Streaks
- Workout-Templates Library
