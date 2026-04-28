// --- Library Module ---

import { getBooks, getStudents, getLibraryIssues, issueBook, returnBook } from '../api.js';
import { showLoading, hideLoading, showToast, debounce, formatDate } from '../ui.js';

let allBooks = [];
let allIssues = [];
let allStudents = [];
let filters = { search: '', category: '' };

// -- Load Library Data --

export async function init() {
  const page = document.body.dataset.libraryPage;

  showLoading();
  try {
    [allBooks, allIssues, allStudents] = await Promise.all([
      getBooks(),
      getLibraryIssues(),
      getStudents()
    ]);

    if (page === 'books') {
      renderBooks();
      renderLibraryStats();
      bindBooksEvents();
    } else if (page === 'issue') {
      renderIssueForm();
      bindIssueEvents();
    } else if (page === 'return') {
      renderReturnTable();
      bindReturnEvents();
    }
  } catch (err) {
    showToast('Failed to load library data', 'error');
  } finally {
    hideLoading();
  }
}

function getFilteredBooks() {
  return allBooks.filter(b => {
    const matchSearch = !filters.search ||
      `${b.title} ${b.author} ${b.isbn}`.toLowerCase().includes(filters.search.toLowerCase());
    const matchCategory = !filters.category || b.category === filters.category;
    return matchSearch && matchCategory;
  });
}

function renderLibraryStats() {
  const container = document.getElementById('library-stats');
  if (!container) return;

  const total = allBooks.reduce((sum, b) => sum + b.copies, 0);
  const available = allBooks.reduce((sum, b) => sum + b.available, 0);
  const issued = total - available;
  const overdue = allIssues.filter(i => i.status === 'Overdue').length;

  container.innerHTML = `
    <div class="library-stat-item"><div class="library-stat-value">${total}</div><div class="library-stat-label">Total Copies</div></div>
    <div class="library-stat-item"><div class="library-stat-value">${available}</div><div class="library-stat-label">Available</div></div>
    <div class="library-stat-item"><div class="library-stat-value">${issued}</div><div class="library-stat-label">Issued</div></div>
    <div class="library-stat-item"><div class="library-stat-value">${overdue}</div><div class="library-stat-label">Overdue</div></div>
  `;
}

function renderBooks() {
  const tbody = document.getElementById('books-table-body');
  if (!tbody) return;

  const filtered = getFilteredBooks();

  tbody.innerHTML = filtered.map(b => `
    <tr>
      <td data-label="Book">
        <div class="book-title-cell">
          <div class="book-cover-placeholder"><i class="fa-solid fa-book"></i></div>
          <div>
            <div class="fw-semibold">${b.title}</div>
            <small class="text-muted">${b.isbn}</small>
          </div>
        </div>
      </td>
      <td data-label="Author">${b.author}</td>
      <td data-label="Category">${b.category}</td>
      <td data-label="Copies">${b.copies}</td>
      <td data-label="Available">${b.available}</td>
      <td data-label="Shelf">${b.shelf}</td>
    </tr>
  `).join('');
}

function bindBooksEvents() {
  const searchInput = document.getElementById('book-search');
  const categoryFilter = document.getElementById('category-filter');

  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      filters.search = e.target.value;
      renderBooks();
    }));
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      filters.category = e.target.value;
      renderBooks();
    });
  }
}

function renderIssueForm() {
  const bookSelect = document.getElementById('issue-book');
  const studentSelect = document.getElementById('issue-student');

  if (bookSelect) {
    bookSelect.innerHTML = '<option value="">Select a book</option>' +
      allBooks.filter(b => b.available > 0).map(b =>
        `<option value="${b.id}">${b.title} (${b.available} available)</option>`
      ).join('');
  }
  if (studentSelect) {
    studentSelect.innerHTML = '<option value="">Select a student</option>' +
      allStudents.map(s =>
        `<option value="${s.id}">${s.firstName} ${s.lastName} (${s.studentId})</option>`
      ).join('');
  }

  const dueDate = document.getElementById('issue-due-date');
  if (dueDate) {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    dueDate.value = date.toISOString().split('T')[0];
  }
}

function bindIssueEvents() {
  document.getElementById('issue-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bookId = document.getElementById('issue-book').value;
    const studentId = document.getElementById('issue-student').value;
    const dueDate = document.getElementById('issue-due-date').value;

    if (!bookId || !studentId || !dueDate) {
      showToast('Please fill all fields', 'warning');
      return;
    }

    showLoading();
    const result = await issueBook(bookId, studentId, dueDate);
    hideLoading();

    if (result) {
      showToast('Book issued successfully', 'success');
      e.target.reset();
      allBooks = await getBooks();
      renderIssueForm();
    } else {
      showToast('Book not available', 'error');
    }
  });
}

function renderReturnTable() {
  const tbody = document.getElementById('return-table-body');
  if (!tbody) return;

  const activeIssues = allIssues.filter(i => i.status !== 'Returned');

  if (activeIssues.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5"><div class="empty-state"><i class="fa-solid fa-book"></i><p>No books to return</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = activeIssues.map(issue => {
    const book = allBooks.find(b => b.id === issue.bookId);
    const student = allStudents.find(s => s.id === issue.studentId);
    return `
      <tr>
        <td data-label="Book">${book?.title || 'Unknown'}</td>
        <td data-label="Student">${student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</td>
        <td data-label="Issue Date">${formatDate(issue.issueDate)}</td>
        <td data-label="Due Date">${formatDate(issue.dueDate)}</td>
        <td data-label="Status"><span class="badge-status ${issue.status.toLowerCase()}">${issue.status}</span></td>
        <td data-label="Action">
          <button class="btn btn-sm btn-primary return-book-btn" data-id="${issue.id}">
            <i class="fa-solid fa-rotate-left me-1"></i> Return
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function bindReturnEvents() {
  document.querySelectorAll('.return-book-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      showLoading();
      const result = await returnBook(btn.dataset.id);
      hideLoading();
      if (result) {
        showToast('Book returned successfully', 'success');
        allIssues = await getLibraryIssues();
        allBooks = await getBooks();
        renderReturnTable();
        bindReturnEvents();
      } else {
        showToast('Failed to return book', 'error');
      }
    });
  });
}
