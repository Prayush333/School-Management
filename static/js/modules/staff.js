// --- Staff Module ---

import { getStaff, createStaff } from '../api.js';
import { showLoading, hideLoading, showToast, getInitials, openModal, closeModal, debounce, formatDate } from '../ui.js';

let allStaff = [];
let filters = { search: '', department: '' };

// -- Load Staff Data --

export async function init() {
  const isForm = document.body.dataset.staffForm;
  if (isForm) {
    bindFormEvents();
    return;
  }
  await loadStaff();
  bindEvents();
}

async function loadStaff() {
  showLoading();
  try {
    allStaff = await getStaff();
    renderTable();
  } catch (err) {
    showToast('Failed to load staff', 'error');
  } finally {
    hideLoading();
  }
}

function getFilteredStaff() {
  return allStaff.filter(s => {
    const matchSearch = !filters.search ||
      `${s.firstName} ${s.lastName} ${s.department} ${s.email}`.toLowerCase().includes(filters.search.toLowerCase());
    const matchDept = !filters.department || s.department === filters.department;
    return matchSearch && matchDept;
  });
}

function renderTable() {
  const tbody = document.getElementById('staff-table-body');
  if (!tbody) return;

  const filtered = getFilteredStaff();

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5"><div class="empty-state"><i class="fa-solid fa-users"></i><p>No staff found</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => `
    <tr>
      <td data-label="Employee">
        <div class="student-name-cell">
          <span class="student-avatar-sm">${getInitials(s.firstName, s.lastName)}</span>
          <div>
            <div class="fw-semibold">${s.firstName} ${s.lastName}</div>
            <small class="text-muted">${s.employeeId}</small>
          </div>
        </div>
      </td>
      <td data-label="Department">${s.department}</td>
      <td data-label="Designation">${s.designation}</td>
      <td data-label="Email">${s.email}</td>
      <td data-label="Phone">${s.phone}</td>
      <td data-label="Joined">${formatDate(s.joinDate)}</td>
    </tr>
  `).join('');
}

function bindEvents() {
  const searchInput = document.getElementById('staff-search');
  const deptFilter = document.getElementById('staff-department-filter');
  const addBtn = document.getElementById('add-staff-btn');
  const saveBtn = document.getElementById('save-staff-btn');

  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      filters.search = e.target.value;
      renderTable();
    }));
  }
  if (deptFilter) {
    deptFilter.addEventListener('change', (e) => {
      filters.department = e.target.value;
      renderTable();
    });
  }
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.getElementById('staff-form').reset();
      openModal('staffModal');
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSave);
  }
}

async function handleSave() {
  const form = document.getElementById('staff-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = {
    firstName: document.getElementById('staff-first-name').value,
    lastName: document.getElementById('staff-last-name').value,
    email: document.getElementById('staff-email').value,
    phone: document.getElementById('staff-phone').value,
    department: document.getElementById('staff-department').value,
    designation: document.getElementById('staff-designation').value,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active'
  };

  showLoading();
  try {
    await createStaff(data);
    showToast('Staff member added', 'success');
    closeModal('staffModal');
    await loadStaff();
  } catch (err) {
    showToast('Failed to add staff', 'error');
  } finally {
    hideLoading();
  }
}

function bindFormEvents() {
  document.getElementById('staff-page-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      firstName: document.getElementById('staff-first-name').value,
      lastName: document.getElementById('staff-last-name').value,
      email: document.getElementById('staff-email').value,
      phone: document.getElementById('staff-phone').value,
      department: document.getElementById('staff-department').value,
      designation: document.getElementById('staff-designation').value,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    showLoading();
    await createStaff(data);
    hideLoading();
    showToast('Staff added', 'success');
    window.location.href = '/?tpl=templates/staff/list.html';
  });
}
