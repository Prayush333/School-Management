// --- Settings Module ---

import { getSettings, saveSettings } from '../api.js';
import { showToast, setTheme, setPrimaryColor } from '../ui.js';

let currentSettings = {};

// -- Load Settings --

export function init() {
  currentSettings = getSettings();
  populateForm();
  bindEvents();
}

function populateForm() {
  document.getElementById('school-name').value = currentSettings.schoolName || '';
  document.getElementById('school-email').value = currentSettings.schoolEmail || '';
  document.getElementById('school-phone').value = currentSettings.schoolPhone || '';
  document.getElementById('school-address').value = currentSettings.schoolAddress || '';
  document.getElementById('language-select').value = currentSettings.language || 'en';
  document.getElementById('notifications-toggle').checked = currentSettings.notifications !== false;
  document.getElementById('email-alerts-toggle').checked = currentSettings.emailAlerts !== false;

  const theme = currentSettings.theme || 'light';
  document.querySelectorAll('.theme-option').forEach(el => {
    el.classList.toggle('selected', el.dataset.theme === theme);
  });

  const color = currentSettings.primaryColor || '#4f46e5';
  document.querySelectorAll('.color-scheme-btn').forEach(el => {
    el.classList.toggle('selected', el.dataset.color === color);
  });
}

function bindEvents() {
  document.querySelectorAll('.settings-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.settings-nav-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
      link.classList.add('active');
      document.getElementById(link.dataset.panel)?.classList.add('active');
    });
  });

  document.getElementById('save-profile-btn')?.addEventListener('click', () => {
    currentSettings.schoolName = document.getElementById('school-name').value;
    currentSettings.schoolEmail = document.getElementById('school-email').value;
    currentSettings.schoolPhone = document.getElementById('school-phone').value;
    currentSettings.schoolAddress = document.getElementById('school-address').value;
    saveSettings(currentSettings);
    showToast('School profile saved', 'success');
  });

  document.querySelectorAll('.theme-option').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.theme-option').forEach(t => t.classList.remove('selected'));
      el.classList.add('selected');
      const theme = el.dataset.theme;
      currentSettings.theme = theme;
      setTheme(theme);
      saveSettings(currentSettings);
      showToast(`Theme changed to ${theme}`, 'success');
    });
  });

  document.querySelectorAll('.color-scheme-btn').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.color-scheme-btn').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
      const color = el.dataset.color;
      currentSettings.primaryColor = color;
      setPrimaryColor(color);
      saveSettings(currentSettings);
      showToast('Primary color updated', 'success');
    });
  });

  document.getElementById('save-preferences-btn')?.addEventListener('click', () => {
    currentSettings.language = document.getElementById('language-select').value;
    currentSettings.notifications = document.getElementById('notifications-toggle').checked;
    currentSettings.emailAlerts = document.getElementById('email-alerts-toggle').checked;
    saveSettings(currentSettings);
    showToast('Preferences saved', 'success');
  });
}
