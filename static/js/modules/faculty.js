// --- Faculty Module ---

import { getFaculty, createFaculty } from '../api.js';
import { showLoading, hideLoading, showToast, getInitials, openModal, closeModal, debounce } from '../ui.js';

let allFaculty = [];
let filters = { search: '', department: '' };

// -- Load Faculty Data --

export async function init() {
  const isForm = document.body.dataset.facultyForm;
  if (isForm) {
    bindFormEvents();
    return;
  }
  await loadFaculty();
  bindEvents();
}

async function loadFaculty() {
  showLoading();
  try {
    allFaculty = await getFaculty();
    renderCards();
  } catch (err) {
    showToast('Failed to load faculty', 'error');
  } finally {
    hideLoading();
  }
}

function getFilteredFaculty() {
  return allFaculty.filter(f => {
    const matchSearch = !filters.search ||
      `${f.firstName} ${f.lastName} ${f.department} ${f.email}`.toLowerCase().includes(filters.search.toLowerCase());
    const matchDept = !filters.department || f.department === filters.department;
    return matchSearch && matchDept;
  });
}

function renderCards() {
  const container = document.getElementById('faculty-grid');
  if (!container) return;

  const filtered = getFilteredFaculty();

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-12"><div class="empty-state"><i class="fa-solid fa-chalkboard-user"></i><p>No faculty found</p></div></div>`;
    return;
  }

  container.innerHTML = filtered.map(f => `
    <div class="col-sm-6 col-lg-4 col-xl-3">
      <div class="faculty-card">
        <div class="faculty-avatar">${getInitials(f.firstName, f.lastName)}</div>
        <h3 class="faculty-name">${f.firstName} ${f.lastName}</h3>
        <p class="faculty-designation">${f.designation}</p>
        <span class="faculty-department">${f.department}</span>
        <div class="faculty-meta">
          <span><i class="fa-solid fa-envelope me-1"></i>${f.email}</span>
        </div>
        <div class="faculty-meta mt-2">
          <span><i class="fa-solid fa-clock me-1"></i>${f.experience} yrs</span>
          <span><i class="fa-solid fa-book me-1"></i>${f.subjects?.length || 0} subjects</span>
        </div>
      </div>
    </div>
  `).join('');
}

function bindEvents() {
  const searchInput = document.getElementById('faculty-search');
  const deptFilter = document.getElementById('department-filter');
  const addBtn = document.getElementById('add-faculty-btn');
  const saveBtn = document.getElementById('save-faculty-btn');

  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      filters.search = e.target.value;
      renderCards();
    }));
  }
  if (deptFilter) {
    deptFilter.addEventListener('change', (e) => {
      filters.department = e.target.value;
      renderCards();
    });
  }
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.getElementById('faculty-form').reset();
      openModal('facultyModal');
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSave);
  }
}

async function handleSave() {
  const form = document.getElementById('faculty-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = {
    firstName: document.getElementById('faculty-first-name').value,
    lastName: document.getElementById('faculty-last-name').value,
    email: document.getElementById('faculty-email').value,
    phone: document.getElementById('faculty-phone').value,
    department: document.getElementById('faculty-department').value,
    designation: document.getElementById('faculty-designation').value,
    qualification: document.getElementById('faculty-qualification').value,
    experience: parseInt(document.getElementById('faculty-experience').value, 10),
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    subjects: []
  };

  showLoading();
  try {
    await createFaculty(data);
    showToast('Faculty added successfully', 'success');
    closeModal('facultyModal');
    await loadFaculty();
  } catch (err) {
    showToast('Failed to add faculty', 'error');
  } finally {
    hideLoading();
  }
}

function bindFormEvents() {
  document.getElementById('faculty-page-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      firstName: document.getElementById('faculty-first-name').value,
      lastName: document.getElementById('faculty-last-name').value,
      email: document.getElementById('faculty-email').value,
      phone: document.getElementById('faculty-phone').value,
      department: document.getElementById('faculty-department').value,
      designation: document.getElementById('faculty-designation').value,
      qualification: document.getElementById('faculty-qualification').value,
      experience: parseInt(document.getElementById('faculty-experience').value, 10),
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      subjects: []
    };
    showLoading();
    await createFaculty(data);
    hideLoading();
    showToast('Faculty added', 'success');
    window.location.href = '/?tpl=templates/faculty/list.html';
  });
}
