import { getSettings, saveSettings, showToast, confirmDialog } from './utils.js';
import { getAll, add, remove, clearStore } from './db.js';
import { clearAllSessions } from './session.js';

export function initSettings() {
  loadSettingsUI();
  loadCategories();
  initCategoryForm();
  initClearHistory();
  initSettingsListeners();
}

function loadSettingsUI() {
  const settings = getSettings();
  const timeRadios = document.querySelectorAll('input[name="timeFormat"]');
  const dateRadios = document.querySelectorAll('input[name="dateFormat"]');

  timeRadios.forEach((radio) => {
    radio.checked = radio.value === settings.timeFormat;
    radio.addEventListener('change', () => {
      settings.timeFormat = radio.value;
      saveSettings(settings);
      showToast('Format d\'heure mis à jour');
    });
  });

  dateRadios.forEach((radio) => {
    radio.checked = radio.value === settings.dateFormat;
    radio.addEventListener('change', () => {
      settings.dateFormat = radio.value;
      saveSettings(settings);
      showToast('Format de date mis à jour');
    });
  });
}

async function loadCategories() {
  const categories = await getAll('categories');
  const list = document.getElementById('categoryList');
  if (!list) return;

  list.innerHTML = '';

  if (categories.length === 0) {
    const defaults = [
      { id: 'cat_001', name: 'Travail', color: '#2563EB' },
      { id: 'cat_002', name: 'Sport', color: '#16A34A' },
      { id: 'cat_003', name: 'Lecture', color: '#9333EA' },
    ];
    for (const cat of defaults) {
      await add('categories', cat);
    }
    return loadCategories();
  }

  categories.forEach((cat) => {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.innerHTML = `
      <span class="category-color" style="background: ${cat.color}"></span>
      <span class="category-name">${escapeHTML(cat.name)}</span>
      <button class="btn-delete-category" data-id="${cat.id}" title="Supprimer">×</button>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll('.btn-delete-category').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const confirmed = await confirmDialog({
        title: 'Supprimer la catégorie',
        message: 'Cette action est irréversible.',
      });
      if (confirmed) {
        await remove('categories', btn.dataset.id);
        loadCategories();
        showToast('Catégorie supprimée');
      }
    });
  });
}

function initCategoryForm() {
  const btn = document.getElementById('btnAddCategory');
  const nameInput = document.getElementById('newCategoryName');
  const colorInput = document.getElementById('newCategoryColor');

  if (!btn) return;

  btn.addEventListener('click', async () => {
    const name = nameInput?.value?.trim();
    const color = colorInput?.value || '#2563EB';

    if (!name) {
      showToast('Veuillez saisir un nom', 'error');
      return;
    }

    try {
      const existing = await getAll('categories');
      if (existing.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        showToast('Cette catégorie existe déjà', 'error');
        return;
      }

      const { generateUUID } = await import('./utils.js');
      await add('categories', {
        id: generateUUID(),
        name,
        color,
      });

      if (nameInput) nameInput.value = '';
      loadCategories();
      showToast('Catégorie ajoutée');
    } catch (err) {
      showToast('Erreur lors de l\'ajout de la catégorie', 'error');
    }
  });
}

function initClearHistory() {
  const btn = document.getElementById('btnClearHistory');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const confirmed = await confirmDialog({
      title: 'Vider tout l\'historique',
      message: 'Supprimer TOUTES les sessions ? Cette action est irréversible.',
    });
    if (confirmed) {
      await clearAllSessions();
      showToast('Historique vidé');
    }
  });
}

function initSettingsListeners() {}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
