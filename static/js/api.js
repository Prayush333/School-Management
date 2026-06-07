// --- API Abstraction Layer ---

import { studentsData } from '../data/students.js';
import { facultyData } from '../data/faculty.js';
import { staffData } from '../data/staff.js';
import { booksData, libraryIssuesData } from '../data/books.js';

// -- Configuration --

const API_CONFIG = {
  useMock: true,
  baseUrl: '/api'
};

// -- Simulated Network Delay --

function simulateDelay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// -- Local Storage Helpers --

function getStoredData(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// -- Initialize Local Storage --

function initStorage() {
  if (!localStorage.getItem('sms_students')) {
    setStoredData('sms_students', studentsData);
  }
  if (!localStorage.getItem('sms_faculty')) {
    setStoredData('sms_faculty', facultyData);
  }
  if (!localStorage.getItem('sms_staff')) {
    setStoredData('sms_staff', staffData);
  }
  if (!localStorage.getItem('sms_books')) {
    setStoredData('sms_books', booksData);
  }
  if (!localStorage.getItem('sms_issues')) {
    setStoredData('sms_issues', libraryIssuesData);
  }
}

initStorage();

// --- Student API ---

export async function getStudents() {
  if (API_CONFIG.useMock) {
    await simulateDelay();
    return getStoredData('sms_students', studentsData);
  }
  // Future backend integration
  // const response = await fetch(`${API_CONFIG.baseUrl}/students`);
  // return response.json();
}

export async function getStudentById(id) {
  const students = await getStudents();
  return students.find(s => s.id === Number(id));
}

export async function createStudent(student) {
  if (API_CONFIG.useMock) {
    await simulateDelay();
    const students = getStoredData('sms_students', studentsData);
    const newStudent = {
      ...student,
      id: Math.max(...students.map(s => s.id), 0) + 1,
      studentId: `STU-2024-${String(students.length + 1).padStart(3, '0')}`
    };
    students.push(newStudent);
    setStoredData('sms_students', students);
    return newStudent;
  }
  // Future backend integration
  // const response = await fetch(`${API_CONFIG.baseUrl}/students`, { method: 'POST', body: JSON.stringify(student) });
  // return response.json();
}

export async function updateStudent(id, data) {
  if (API_CONFIG.useMock) {
    await simulateDelay();
    const students = getStoredData('sms_students', studentsData);
    const index = students.findIndex(s => s.id === Number(id));
    if (index !== -1) {
      students[index] = { ...students[index], ...data };
      setStoredData('sms_students', students);
      return students[index];
    }
    return null;
  }
  // Future backend integration
  // const response = await fetch(`${API_CONFIG.baseUrl}/students/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  // return response.json();
}

export async function deleteStudent(id) {
  if (API_CONFIG.useMock) {
    await simulateDelay();
    const students = getStoredData('sms_students', studentsData);
    const filtered = students.filter(s => s.id !== Number(id));
    setStoredData('sms_students', filtered);
    return true;
  }
  // Future backend integration
  // await fetch(`${API_CONFIG.baseUrl}/students/${id}`, { method: 'DELETE' });
}

// --- Faculty API ---

export async function getFaculty() {
  if (API_CONFIG.useMock) {
    await simulateDelay();
    return getStoredData('sms_faculty', facultyData);
  }
  // Future backend integration
  // const response = await fetch(`${API_CONFIG.baseUrl}/faculty`);
  // return response.json();
}

export async function createFaculty(faculty) {
  if (API_CONFIG.useMock) {
    await simulateDelay();
    const list = getStoredData('sms_faculty', facultyData);
    const newFaculty = {
      ...faculty,
      id: Math.max(...list.map(f => f.id), 0) + 1,
      employeeId: `FAC-${String(list.length + 1).padStart(3, '0')}`
    };
    list.push(newFaculty);
    setStoredData('sms_faculty', list);
    return newFaculty;
  }
  // Future backend integration
  // const response = await fetch(`${API_CONFIG.baseUrl}/faculty`, { method: 'POST', body: JSON.stringify(faculty) });
  // return response.json();
}

// --- Staff API ---

export async function getStaff() {
  if (API_CONFIG.useMock) {
    await simulateDelay();
    return getStoredData('sms_staff', staffData);
  }
  // Future backend integration
  // const response = await fetch(`${API_CONFIG.baseUrl}/staff`);
  // return response.json();
}

export async function createStaff(member) {
  if (API_CONFIG.useMock) {
    await simulateDelay();
    const list = getStoredData('sms_staff', staffData);
    const newMember = {
      ...member,
      id: Math.max(...list.map(s => s.id), 0) + 1,
      employeeId: `STF-${String(list.length + 1).padStart(3, '0')}`
    };
    list.push(newMember);
    setStoredData('sms_staff', list);
    return newMember;
  }
  // Future backend integration
  // const response = await fetch(`${API_CONFIG.baseUrl}/staff`, { method: 'POST', body: JSON.stringify(member) });
  // return response.json();
}

// --- Books API ---

export async function getBooks() {
  if (API_CONFIG.useMock) {
    await simulateDelay();
    return getStoredData('sms_books', booksData);
  }
  // Future backend integration
  // const response = await fetch(`${API_CONFIG.baseUrl}/books`);
  // return response.json();
}

export async function getLibraryIssues() {
  if (API_CONFIG.useMock) {
    await simulateDelay();
    return getStoredData('sms_issues', libraryIssuesData);
  }
  // Future backend integration
  // const response = await fetch(`${API_CONFIG.baseUrl}/library/issues`);
  // return response.json();
}

export async function issueBook(bookId, studentId, dueDate) {
  if (API_CONFIG.useMock) {
    await simulateDelay();
    const books = getStoredData('sms_books', booksData);
    const issues = getStoredData('sms_issues', libraryIssuesData);
    const book = books.find(b => b.id === Number(bookId));
    if (!book || book.available <= 0) return null;

    book.available -= 1;
    const newIssue = {
      id: Math.max(...issues.map(i => i.id), 0) + 1,
      bookId: Number(bookId),
      studentId: Number(studentId),
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      returnDate: null,
      status: 'Issued'
    };
    issues.push(newIssue);
    setStoredData('sms_books', books);
    setStoredData('sms_issues', issues);
    return newIssue;
  }
  // Future backend integration
  // const response = await fetch(`${API_CONFIG.baseUrl}/library/issue`, { method: 'POST', body: JSON.stringify({ bookId, studentId, dueDate }) });
  // return response.json();
}

export async function returnBook(issueId) {
  if (API_CONFIG.useMock) {
    await simulateDelay();
    const books = getStoredData('sms_books', booksData);
    const issues = getStoredData('sms_issues', libraryIssuesData);
    const issue = issues.find(i => i.id === Number(issueId));
    if (!issue || issue.status === 'Returned') return null;

    const book = books.find(b => b.id === issue.bookId);
    if (book) book.available += 1;
    issue.returnDate = new Date().toISOString().split('T')[0];
    issue.status = 'Returned';
    setStoredData('sms_books', books);
    setStoredData('sms_issues', issues);
    return issue;
  }
  // Future backend integration
  // const response = await fetch(`${API_CONFIG.baseUrl}/library/return/${issueId}`, { method: 'POST' });
  // return response.json();
}

// --- Dashboard Stats API ---

export async function getDashboardStats() {
  const [students, faculty, staff, books] = await Promise.all([
    getStudents(),
    getFaculty(),
    getStaff(),
    getBooks()
  ]);

  const avgAttendance = students.reduce((sum, s) => sum + s.attendance, 0) / students.length;

  return {
    totalStudents: students.length,
    totalFaculty: faculty.length,
    totalStaff: staff.length,
    totalBooks: books.length,
    attendancePercentage: Math.round(avgAttendance),
    revenue: 2847500,
    studentGrowth: [1420, 1485, 1520, 1560, 1590, 1620],
    attendanceData: [88, 91, 89, 93, 92, 94],
    libraryStats: {
      total: books.reduce((sum, b) => sum + b.copies, 0),
      available: books.reduce((sum, b) => sum + b.available, 0),
      issued: books.reduce((sum, b) => sum + (b.copies - b.available), 0),
      categories: [...new Set(books.map(b => b.category))].length
    }
  };
}

// --- Settings API ---

export function getSettings() {
  return getStoredData('sms_settings', {
    schoolName: 'Prayush Academy',
    schoolEmail: 'admin@springfield.edu',
    schoolPhone: '+1 (555) 123-4567',
    schoolAddress: '100 Education Boulevard, Springfield, ST 12345',
    theme: 'light',
    primaryColor: '#4f46e5',
    language: 'en',
    notifications: true,
    emailAlerts: true
  });
}

export function saveSettings(settings) {
  setStoredData('sms_settings', settings);
  return settings;
}
