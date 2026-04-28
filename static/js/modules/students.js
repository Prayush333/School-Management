// --- Student Module ---

import { getStudents, createStudent, updateStudent, deleteStudent } from '../api.js';
import {
  showLoading, hideLoading, showToast, paginate,
  renderPagination, getInitials, openModal, closeModal,
  confirmAction, debounce, formatDate
} from '../ui.js';

let allStudents = [];
let currentPage = 1;
const perPage = 8;
let filters = { search: '', grade: '', status: '' };

// -- Load Student Data --

export async function init() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('search')) filters.search = params.get('search');

  const isDetails = document.body.dataset.studentDetails;
  const isForm = document.body.dataset.studentForm;

  if (isDetails) {
    await loadStudentDetails(params.get('id'));
  } else if (isForm) {
    await initStudentForm(params.get('id'));
  } else {
    await loadStudents();
    bindEvents();
  }
}

async function loadStudents() {
  showLoading();
  try {
    allStudents = await getStudents();
    if (filters.search) {
      const searchInput = document.getElementById('student-search');
      if (searchInput) searchInput.value = filters.search;
    }
    renderTable();
  } catch (err) {
    showToast('Failed to load students', 'error');
  } finally {
    hideLoading();
  }
}

function getFilteredStudents() {
  return allStudents.filter(s => {
    const matchSearch = !filters.search || 
      `${s.firstName} ${s.lastName} ${s.studentId} ${s.email}`.toLowerCase().includes(filters.search.toLowerCase());
    const matchGrade = !filters.grade || s.grade === filters.grade;
    const matchStatus = !filters.status || s.status === filters.status;
    return matchSearch && matchGrade && matchStatus;
  });
}

function renderTable() {
  const tbody = document.getElementById('students-table-body');
  const paginationEl = document.getElementById('students-pagination');
  const infoEl = document.getElementById('pagination-info');
  if (!tbody) return;

  const filtered = getFilteredStudents();
  const { data, total, totalPages, currentPage: page } = paginate(filtered, currentPage, perPage);
  currentPage = page;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-5"><div class="empty-state"><i class="fa-solid fa-user-graduate"></i><p>No students found</p></div></td></tr>`;
  } else {
    tbody.innerHTML = data.map(s => `
      <tr>
        <td data-label="Student">
          <div class="student-name-cell">
            <span class="student-avatar-sm">${getInitials(s.firstName, s.lastName)}</span>
            <div>
              <div class="fw-semibold">${s.firstName} ${s.lastName}</div>
              <small class="text-muted">${s.studentId}</small>
            </div>
          </div>
        </td>
        <td data-label="Grade">${s.grade}-${s.section}</td>
        <td data-label="Email">${s.email}</td>
        <td data-label="Phone">${s.phone}</td>
        <td data-label="Attendance">${s.attendance}%</td>
        <td data-label="Status"><span class="badge-status ${s.status.toLowerCase()}">${s.status}</span></td>
        <td data-label="Enrolled">${formatDate(s.enrollmentDate)}</td>
        <td data-label="Actions">
          <div class="action-buttons">
            <a href="/?tpl=templates/students/details.html&id=${s.id}" class="btn-action" title="View"><i class="fa-solid fa-eye"></i></a>
            <button class="btn-action edit-student" data-id="${s.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-action danger delete-student" data-id="${s.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  if (infoEl) {
    const start = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, total);
    infoEl.textContent = `Showing ${start}-${end} of ${total} students`;
  }

  const paginationControls = document.querySelector('#students-pagination .pagination-controls') || paginationEl;
  renderPagination(paginationControls, currentPage, totalPages || 1, (page) => {
    currentPage = page;
    renderTable();
  });

  bindTableActions();
}

function bindTableActions() {
  document.querySelectorAll('.edit-student').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id, 10)));
  });
  document.querySelectorAll('.delete-student').forEach(btn => {
    btn.addEventListener('click', () => handleDelete(parseInt(btn.dataset.id, 10)));
  });
}

function bindEvents() {
  const searchInput = document.getElementById('student-search');
  const gradeFilter = document.getElementById('grade-filter');
  const statusFilter = document.getElementById('status-filter');
  const addBtn = document.getElementById('add-student-btn');
  const saveBtn = document.getElementById('save-student-btn');

  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      filters.search = e.target.value;
      currentPage = 1;
      renderTable();
    }));
  }
  if (gradeFilter) {
    gradeFilter.addEventListener('change', (e) => {
      filters.grade = e.target.value;
      currentPage = 1;
      renderTable();
    });
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      filters.status = e.target.value;
      currentPage = 1;
      renderTable();
    });
  }
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.getElementById('student-form').reset();
      document.getElementById('student-form-id').value = '';
      document.getElementById('studentModalLabel').textContent = 'Add Student';
      openModal('studentModal');
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSave);
  }
}

async function openEditModal(id) {
  const student = allStudents.find(s => s.id === id);
  if (!student) return;

  document.getElementById('student-form-id').value = student.id;
  document.getElementById('student-first-name').value = student.firstName;
  document.getElementById('student-last-name').value = student.lastName;
  document.getElementById('student-email').value = student.email;
  document.getElementById('student-phone').value = student.phone;
  document.getElementById('student-grade').value = student.grade;
  document.getElementById('student-section').value = student.section;
  document.getElementById('student-gender').value = student.gender;
  document.getElementById('student-dob').value = student.dob;
  document.getElementById('student-status').value = student.status;
  document.getElementById('studentModalLabel').textContent = 'Edit Student';
  openModal('studentModal');
}

async function handleSave() {
  const form = document.getElementById('student-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const id = document.getElementById('student-form-id').value;
  const data = {
    firstName: document.getElementById('student-first-name').value,
    lastName: document.getElementById('student-last-name').value,
    email: document.getElementById('student-email').value,
    phone: document.getElementById('student-phone').value,
    grade: document.getElementById('student-grade').value,
    section: document.getElementById('student-section').value,
    gender: document.getElementById('student-gender').value,
    dob: document.getElementById('student-dob').value,
    status: document.getElementById('student-status').value,
    address: '',
    parentName: '',
    parentPhone: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    attendance: 90
  };

  showLoading();
  try {
    if (id) {
      await updateStudent(id, data);
      showToast('Student updated successfully', 'success');
    } else {
      await createStudent(data);
      showToast('Student added successfully', 'success');
    }
    closeModal('studentModal');
    await loadStudents();
  } catch (err) {
    showToast('Failed to save student', 'error');
  } finally {
    hideLoading();
  }
}

async function handleDelete(id) {
  if (!confirmAction('Are you sure you want to delete this student?')) return;
  showLoading();
  try {
    await deleteStudent(id);
    showToast('Student deleted', 'success');
    await loadStudents();
  } catch (err) {
    showToast('Failed to delete student', 'error');
  } finally {
    hideLoading();
  }
}

async function loadStudentDetails(id) {
  showLoading();
  try {
    allStudents = await getStudents();
    const student = allStudents.find(s => s.id === Number(id));
    if (!student) {
      showToast('Student not found', 'error');
      return;
    }
    const container = document.getElementById('student-details');
    if (!container) return;

    container.innerHTML = `
      <div class="student-profile-header">
        <div class="student-profile-avatar">${getInitials(student.firstName, student.lastName)}</div>
        <div>
          <h2 class="mb-1">${student.firstName} ${student.lastName}</h2>
          <p class="text-muted mb-2">${student.studentId} · Grade ${student.grade}-${student.section}</p>
          <span class="badge-status ${student.status.toLowerCase()}">${student.status}</span>
        </div>
        <div class="ms-auto">
          <a href="/?tpl=templates/students/form.html&id=${student.id}" class="btn btn-primary btn-sm"><i class="fa-solid fa-pen me-1"></i> Edit</a>
        </div>
      </div>
      <div class="content-card-body">
        <div class="detail-grid">
          <div class="detail-item"><label>Email</label><span>${student.email}</span></div>
          <div class="detail-item"><label>Phone</label><span>${student.phone}</span></div>
          <div class="detail-item"><label>Gender</label><span>${student.gender}</span></div>
          <div class="detail-item"><label>Date of Birth</label><span>${formatDate(student.dob)}</span></div>
          <div class="detail-item"><label>Address</label><span>${student.address}</span></div>
          <div class="detail-item"><label>Parent/Guardian</label><span>${student.parentName}</span></div>
          <div class="detail-item"><label>Parent Phone</label><span>${student.parentPhone}</span></div>
          <div class="detail-item"><label>Enrollment Date</label><span>${formatDate(student.enrollmentDate)}</span></div>
          <div class="detail-item"><label>Attendance</label><span>${student.attendance}%</span></div>
        </div>
      </div>
    `;
  } finally {
    hideLoading();
  }
}

async function initStudentForm(id) {
  if (!id) return;
  showLoading();
  try {
    allStudents = await getStudents();
    const student = allStudents.find(s => s.id === Number(id));
    if (!student) return;
    document.getElementById('student-first-name').value = student.firstName;
    document.getElementById('student-last-name').value = student.lastName;
    document.getElementById('student-email').value = student.email;
    document.getElementById('student-phone').value = student.phone;
    document.getElementById('student-grade').value = student.grade;
    document.getElementById('student-section').value = student.section;
    document.getElementById('student-gender').value = student.gender;
    document.getElementById('student-dob').value = student.dob;
    document.getElementById('student-status').value = student.status;
    document.getElementById('student-form-id').value = student.id;
  } finally {
    hideLoading();
  }

  document.getElementById('student-page-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formId = document.getElementById('student-form-id').value;
    const data = {
      firstName: document.getElementById('student-first-name').value,
      lastName: document.getElementById('student-last-name').value,
      email: document.getElementById('student-email').value,
      phone: document.getElementById('student-phone').value,
      grade: document.getElementById('student-grade').value,
      section: document.getElementById('student-section').value,
      gender: document.getElementById('student-gender').value,
      dob: document.getElementById('student-dob').value,
      status: document.getElementById('student-status').value
    };
    showLoading();
    await updateStudent(formId, data);
    hideLoading();
    showToast('Student updated', 'success');
    window.location.href = `/?tpl=templates/students/details.html&id=${formId}`;
  });
}
