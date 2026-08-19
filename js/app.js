import { formatDate, getTodayString, formatDuration, getSettings, showToast, confirmDialog } from './utils.js';
import { getAllSessions, getTodaySessions, deleteSession, updateSession, getSession, getActivityNames, getAllCategories } from './session.js';
import { renderSessionsTable, filterSessions } from './history.js';
import { exportToCSV } from './export.js';
import { initTimer } from './timer.js';

document.addEventListener('DOMContentLoaded', () => {
  loadCategorySelects();
  initAddCategoryButtons();
  initConnectivityToasts();

  const page = getCurrentPage();

  switch (page) {
    case 'dashboard':
      initDashboard();
      break;
    case 'history':
      initHistoryPage();
      break;
    case 'settings':
      initSettingsPage();
      break;
  }
});

function getCurrentPage() {
  const path = window.location.pathname;
  if (path.includes('history')) return 'history';
  if (path.includes('settings')) return 'settings';
  return 'dashboard';
}

function initDashboard() {
  initTimer();
  loadDashboard();
  initManualForm();
  initActivitySuggestions();
}

async function loadCategorySelects() {
  const selects = [
    document.getElementById('category'),
    document.getElementById('quickCategory'),
    document.getElementById('editCategory'),
  ].filter(Boolean);

  if (selects.length === 0) return;

  const categories = await getAllCategories();
  const previousValues = selects.map((sel) => sel.value);

  selects.forEach((sel, i) => {
    sel.innerHTML = '<option value="">Aucune</option>';
    categories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat.name;
      option.textContent = cat.name;
      sel.appendChild(option);
    });
    const prev = previousValues[i];
    if (prev && ![...sel.options].some((o) => o.value === prev)) {
      const option = document.createElement('option');
      option.value = prev;
      option.textContent = prev;
      sel.appendChild(option);
    }
    sel.value = prev || '';
  });
}

function initAddCategoryButtons() {
  document.querySelectorAll('[data-add-category]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openAddCategoryModal(btn.dataset.addCategory);
    });
  });
}

function openAddCategoryModal(targetSelectId) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'addCategoryModal';
  overlay.innerHTML = `
    <div class="modal">
      <h3>Nouvelle catégorie</h3>
      <form id="addCategoryForm">
        <div class="form-group">
          <label for="newCategoryName">Nom *</label>
          <input type="text" id="newCategoryName" required maxlength="50">
        </div>
        <div class="form-group">
          <label for="newCategoryColor">Couleur</label>
          <input type="color" id="newCategoryColor" value="#2563EB">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Ajouter</button>
          <button type="button" class="btn btn-ghost" data-close-category-modal>Annuler</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector('[data-close-category-modal]').addEventListener('click', close);

  overlay.querySelector('#newCategoryName').focus();

  overlay.querySelector('#addCategoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = overlay.querySelector('#newCategoryName').value.trim();
    const color = overlay.querySelector('#newCategoryColor').value;

    if (!name) {
      showToast('Veuillez saisir un nom', 'error');
      return;
    }

    try {
      const existing = await getAllCategories();
      if (existing.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        showToast('Cette catégorie existe déjà', 'error');
        return;
      }

      const { generateUUID } = await import('./utils.js');
      const { add } = await import('./db.js');
      await add('categories', { id: generateUUID(), name, color });

      await loadCategorySelects();
      const target = document.getElementById(targetSelectId);
      if (target) target.value = name;
      close();
      showToast(`Catégorie « ${name} » ajoutée`);
    } catch (err) {
      showToast('Erreur lors de l\'ajout de la catégorie', 'error');
    }
  });
}

window.loadDashboard = async function () {
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = today.toLocaleDateString('fr-FR', options);
  }

  const sessions = await getTodaySessions();
  const totalEl = document.getElementById('totalTimeToday');
  const countEl = document.getElementById('sessionCountToday');

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (totalEl) totalEl.textContent = `${h}h ${m.toString().padStart(2, '0')}`;
  if (countEl) countEl.textContent = sessions.length;
};

function initManualForm() {
  const btnManual = document.getElementById('btnManualEntry');
  const formSection = document.getElementById('manualFormSection');
  const quickSection = document.querySelector('.timer-quick');
  const form = document.getElementById('sessionForm');
  const btnCancel = document.getElementById('btnCancelManual');
  const dateInput = document.getElementById('sessionDate');
  const startInput = document.getElementById('startTime');
  const endInput = document.getElementById('endTime');
  const durationEl = document.getElementById('calculatedDuration');

  if (btnManual) {
    btnManual.addEventListener('click', () => {
      if (quickSection) quickSection.style.display = 'none';
      if (formSection) formSection.style.display = 'block';
      setDefaultFormValues();
    });
  }

  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      if (formSection) formSection.style.display = 'none';
      if (quickSection) quickSection.style.display = 'block';
    });
  }

  function setDefaultFormValues() {
    if (dateInput) dateInput.value = getTodayString();
    if (startInput) startInput.value = getDefaultStartTime();
    if (endInput) endInput.value = getDefaultEndTime();
    updateDurationDisplay();
  }

  function getDefaultStartTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  function getDefaultEndTime() {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  function updateDurationDisplay() {
    if (!startInput || !endInput || !durationEl) return;
    const start = startInput.value;
    const end = endInput.value;
    if (!start || !end) return;

    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);

    if (diff === 0) {
      durationEl.textContent = 'Erreur';
      durationEl.style.color = '#DC2626';
    } else {
      durationEl.textContent = formatDuration(diff > 0 ? diff : diff + 24 * 60);
      durationEl.style.color = '';
    }
  }

  if (startInput) startInput.addEventListener('change', updateDurationDisplay);
  if (endInput) endInput.addEventListener('change', updateDurationDisplay);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const activityName = document.getElementById('activityName')?.value?.trim();
      const category = document.getElementById('category')?.value || '';
      const date = dateInput?.value;
      const startTime = startInput?.value;
      const endTime = endInput?.value;
      const notes = document.getElementById('notes')?.value?.trim() || '';

      if (!activityName || !date || !startTime || !endTime) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }

      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      if ((endH * 60 + endM) === (startH * 60 + startM)) {
        showToast('L\'heure de fin doit être postérieure à l\'heure de début', 'error');
        return;
      }

      try {
        const { createSession } = await import('./session.js');
        await createSession({ activityName, category, date, startTime, endTime, notes });
        showToast('Session enregistrée !');
        form.reset();
        if (formSection) formSection.style.display = 'none';
        if (quickSection) quickSection.style.display = 'block';
        loadDashboard();
      } catch (err) {
        showToast('Erreur lors de l\'enregistrement', 'error');
      }
    });
  }
}

async function initActivitySuggestions() {
  const datalist = document.getElementById('activitySuggestions');
  const input = document.getElementById('activityName');
  if (!datalist || !input) return;

  try {
    const names = await getActivityNames();
    datalist.innerHTML = '';
    names.forEach((name) => {
      const option = document.createElement('option');
      option.value = name;
      datalist.appendChild(option);
    });
  } catch {}
}

function initHistoryPage() {
  loadHistory();
  initFilters();
  initExport();
  initEditModal();
  initDeleteHandler();
}

async function loadHistory(filters = {}) {
  let sessions = await getAllSessions();
  if (filters.search || filters.dateFrom || filters.dateTo) {
    sessions = filterSessions(sessions, filters);
  }
  renderSessionsTable(sessions);
}

function initFilters() {
  const searchInput = document.getElementById('searchInput');
  const dateFrom = document.getElementById('filterDateFrom');
  const dateTo = document.getElementById('filterDateTo');
  const btnReset = document.getElementById('btnResetFilters');

  let debounceTimer;

  function applyFilters() {
    const filters = {
      search: searchInput?.value || '',
      dateFrom: dateFrom?.value || '',
      dateTo: dateTo?.value || '',
    };
    loadHistory(filters);
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyFilters, 300);
    });
  }

  if (dateFrom) dateFrom.addEventListener('change', applyFilters);
  if (dateTo) dateTo.addEventListener('change', applyFilters);

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (dateFrom) dateFrom.value = '';
      if (dateTo) dateTo.value = '';
      loadHistory();
      showToast('Filtres réinitialisés', 'info');
    });
  }
}

function initExport() {
  const btn = document.getElementById('btnExportCSV');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const sessions = await getAllSessions();
    if (sessions.length === 0) {
      showToast('Aucune session à exporter', 'error');
      return;
    }
    exportToCSV(sessions);
  });
}

function initEditModal() {
  const modal = document.getElementById('editModal');
  const form = document.getElementById('editForm');
  const btnClose = document.getElementById('btnCloseEdit');

  document.addEventListener('editSession', async (e) => {
    const session = await getSession(e.detail.id);
    if (!session) return;

    document.getElementById('editSessionId').value = session.id;
    document.getElementById('editActivityName').value = session.activityName;
    document.getElementById('editCategory').value = session.category || '';
    document.getElementById('editSessionDate').value = session.date;
    document.getElementById('editStartTime').value = session.startTime;
    document.getElementById('editEndTime').value = session.endTime;
    document.getElementById('editNotes').value = session.notes || '';

    updateEditDuration();
    if (modal) modal.style.display = 'flex';
  });

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  const editStart = document.getElementById('editStartTime');
  const editEnd = document.getElementById('editEndTime');
  if (editStart) editStart.addEventListener('change', updateEditDuration);
  if (editEnd) editEnd.addEventListener('change', updateEditDuration);

  function updateEditDuration() {
    const start = document.getElementById('editStartTime')?.value;
    const end = document.getElementById('editEndTime')?.value;
    const durationEl = document.getElementById('editDuration');
    if (!start || !end || !durationEl) return;

    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    const diff = (eH * 60 + eM) - (sH * 60 + sM);

    if (diff === 0) {
      durationEl.textContent = 'Erreur';
      durationEl.style.color = '#DC2626';
    } else {
      durationEl.textContent = formatDuration(diff > 0 ? diff : diff + 24 * 60);
      durationEl.style.color = '';
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editSessionId')?.value;
      const activityName = document.getElementById('editActivityName')?.value?.trim();
      const category = document.getElementById('editCategory')?.value || '';
      const date = document.getElementById('editSessionDate')?.value;
      const startTime = document.getElementById('editStartTime')?.value;
      const endTime = document.getElementById('editEndTime')?.value;
      const notes = document.getElementById('editNotes')?.value?.trim() || '';

      if (!activityName || !date || !startTime || !endTime) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
      }

      const [sH, sM] = startTime.split(':').map(Number);
      const [eH, eM] = endTime.split(':').map(Number);
      if ((eH * 60 + eM) === (sH * 60 + sM)) {
        showToast('L\'heure de fin doit être postérieure à l\'heure de début', 'error');
        return;
      }

      try {
        await updateSession(id, { activityName, category, date, startTime, endTime, notes });
        showToast('Session mise à jour !');
        if (modal) modal.style.display = 'none';
        loadHistory();
      } catch (err) {
        showToast('Erreur lors de la mise à jour', 'error');
      }
    });
  }
}

function initDeleteHandler() {
  document.addEventListener('deleteSession', async (e) => {
    const confirmed = await confirmDialog({
      title: 'Supprimer la session',
      message: 'Cette action est irréversible.',
    });
    if (!confirmed) return;

    try {
      await deleteSession(e.detail.id);
      showToast('Session supprimée');
      loadHistory();
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
    }
  });
}

function initConnectivityToasts() {
  window.addEventListener('offline', () => {
    showToast('Connexion perdue — mode hors-ligne', 'error');
  });
  window.addEventListener('online', () => {
    showToast('Connexion rétablie', 'success');
  });
}

function initSettingsPage() {
  import('./settings.js').then((module) => {
    module.initSettings();
  });
}
