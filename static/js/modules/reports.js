// --- Reports Module ---

import { getStudents, getBooks, getLibraryIssues } from '../api.js';
import { showLoading, hideLoading, showToast, formatDate } from '../ui.js';

let charts = {};

// -- Load Reports Data --

export async function init() {
  showLoading();
  try {
    const [students, books, issues] = await Promise.all([
      getStudents(),
      getBooks(),
      getLibraryIssues()
    ]);
    renderAttendanceReport(students);
    renderLibraryReport(books, issues);
    renderStudentReport(students);
    bindExportButtons();
  } catch (err) {
    showToast('Failed to load reports', 'error');
  } finally {
    hideLoading();
  }
}

function renderAttendanceReport(students) {
  const tbody = document.getElementById('attendance-report-body');
  if (!tbody) return;

  const byGrade = {};
  students.forEach(s => {
    if (!byGrade[s.grade]) byGrade[s.grade] = { total: 0, sum: 0 };
    byGrade[s.grade].total++;
    byGrade[s.grade].sum += s.attendance;
  });

  tbody.innerHTML = Object.entries(byGrade).map(([grade, data]) => {
    const avg = Math.round(data.sum / data.total);
    return `<tr>
      <td data-label="Grade">Grade ${grade}</td>
      <td data-label="Students">${data.total}</td>
      <td data-label="Avg Attendance">${avg}%</td>
      <td data-label="Status"><span class="badge-status ${avg >= 90 ? 'active' : 'overdue'}">${avg >= 90 ? 'Good' : 'Needs Attention'}</span></td>
    </tr>`;
  }).join('');

  const ctx = document.getElementById('attendanceReportChart');
  if (ctx) {
    const grades = Object.keys(byGrade).sort();
    charts.attendance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: grades.map(g => `Grade ${g}`),
        datasets: [{
          label: 'Avg Attendance %',
          data: grades.map(g => Math.round(byGrade[g].sum / byGrade[g].total)),
          backgroundColor: 'rgba(79, 70, 229, 0.7)',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { max: 100 } }
      }
    });
  }
}

function renderLibraryReport(books, issues) {
  const tbody = document.getElementById('library-report-body');
  if (!tbody) return;

  const byCategory = {};
  books.forEach(b => {
    if (!byCategory[b.category]) byCategory[b.category] = { total: 0, available: 0, issued: 0 };
    byCategory[b.category].total += b.copies;
    byCategory[b.category].available += b.available;
    byCategory[b.category].issued += b.copies - b.available;
  });

  tbody.innerHTML = Object.entries(byCategory).map(([cat, data]) => `
    <tr>
      <td data-label="Category">${cat}</td>
      <td data-label="Total">${data.total}</td>
      <td data-label="Available">${data.available}</td>
      <td data-label="Issued">${data.issued}</td>
    </tr>
  `).join('');

  const ctx = document.getElementById('libraryReportChart');
  if (ctx) {
    charts.library = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(byCategory),
        datasets: [{
          data: Object.values(byCategory).map(d => d.total),
          backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } }
      }
    });
  }
}

function renderStudentReport(students) {
  const tbody = document.getElementById('student-report-body');
  if (!tbody) return;

  const byGradeSection = {};
  students.forEach(s => {
    const key = `Grade ${s.grade}-${s.section}`;
    byGradeSection[key] = (byGradeSection[key] || 0) + 1;
  });

  tbody.innerHTML = Object.entries(byGradeSection).sort().map(([key, count]) => `
    <tr>
      <td data-label="Class">${key}</td>
      <td data-label="Students">${count}</td>
      <td data-label="Capacity">35</td>
      <td data-label="Utilization">${Math.round((count / 35) * 100)}%</td>
    </tr>
  `).join('');

  const ctx = document.getElementById('studentReportChart');
  if (ctx) {
    charts.students = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(byGradeSection),
        datasets: [{
          data: Object.values(byGradeSection),
          backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        cutout: '60%'
      }
    });
  }
}

function bindExportButtons() {
  document.querySelectorAll('.export-report-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Report export would download a PDF/CSV file', 'info', 'Export');
    });
  });
}
