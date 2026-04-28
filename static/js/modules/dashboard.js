// --- Dashboard Module ---

import { getDashboardStats } from '../api.js';
import { showLoading, hideLoading, formatCurrency } from '../ui.js';

let charts = {};

// -- Load Dashboard Data --

export async function init() {
  showLoading();
  try {
    const stats = await getDashboardStats();
    renderStats(stats);
    renderCharts(stats);
    renderRecentActivity();
  } catch (err) {
    console.error('Dashboard load error:', err);
  } finally {
    hideLoading();
  }
}

// -- Render Stat Cards --

function renderStats(stats) {
  const container = document.getElementById('dashboard-stats');
  if (!container) return;

  const cards = [
    { label: 'Total Students', value: stats.totalStudents, icon: 'fa-user-graduate', color: 'primary', trend: '+3.2%', up: true },
    { label: 'Total Faculty', value: stats.totalFaculty, icon: 'fa-chalkboard-user', color: 'success', trend: '+1', up: true },
    { label: 'Total Staff', value: stats.totalStaff, icon: 'fa-users', color: 'info', trend: '0', up: true },
    { label: 'Total Books', value: stats.totalBooks, icon: 'fa-book', color: 'warning', trend: '+5', up: true },
    { label: 'Attendance', value: `${stats.attendancePercentage}%`, icon: 'fa-calendar-check', color: 'success', trend: '+2.1%', up: true },
    { label: 'Revenue', value: formatCurrency(stats.revenue), icon: 'fa-dollar-sign', color: 'primary', trend: '+8.4%', up: true }
  ];

  container.innerHTML = cards.map(card => `
    <div class="col-6 col-lg-4 col-xl-2">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon ${card.color}"><i class="fa-solid ${card.icon}"></i></div>
        </div>
        <div class="stat-card-value">${card.value}</div>
        <div class="stat-card-label">${card.label}</div>
        <div class="stat-card-trend ${card.up ? 'up' : 'down'}">
          <i class="fa-solid fa-arrow-${card.up ? 'up' : 'down'}"></i> ${card.trend}
        </div>
      </div>
    </div>
  `).join('');
}

// -- Render Charts --

function renderCharts(stats) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const growthCtx = document.getElementById('studentGrowthChart');
  if (growthCtx) {
    charts.growth = new Chart(growthCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Students',
          data: stats.studentGrowth,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#4f46e5'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });
  }

  const attendanceCtx = document.getElementById('attendanceChart');
  if (attendanceCtx) {
    charts.attendance = new Chart(attendanceCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Attendance %',
          data: stats.attendanceData,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor }, max: 100 }
        }
      }
    });
  }

  const libraryCtx = document.getElementById('libraryChart');
  if (libraryCtx) {
    charts.library = new Chart(libraryCtx, {
      type: 'doughnut',
      data: {
        labels: ['Available', 'Issued'],
        datasets: [{
          data: [stats.libraryStats.available, stats.libraryStats.issued],
          backgroundColor: ['#4f46e5', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: textColor, padding: 16 } }
        },
        cutout: '65%'
      }
    });
  }
}

// -- Render Recent Activity --

function renderRecentActivity() {
  const container = document.getElementById('recent-activity');
  if (!container) return;

  const activities = [
    { text: 'New student Emma Johnson enrolled in Grade 10-A', time: '2 hours ago', color: 'primary' },
    { text: 'Library book "1984" issued to Noah Davis', time: '4 hours ago', color: 'success' },
    { text: 'Faculty meeting scheduled for tomorrow', time: '6 hours ago', color: 'warning' },
    { text: 'Monthly attendance report generated', time: '1 day ago', color: 'primary' },
    { text: 'New faculty member Dr. Lisa Anderson joined', time: '2 days ago', color: 'success' }
  ];

  container.innerHTML = activities.map(a => `
    <div class="recent-activity-item">
      <div class="activity-dot ${a.color}"></div>
      <div>
        <p class="activity-text">${a.text}</p>
        <span class="activity-time">${a.time}</span>
      </div>
    </div>
  `).join('');
}
