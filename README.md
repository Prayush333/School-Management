# Springfield Academy — School Management System

A production-ready, deployment-ready School Management System frontend built with HTML5, CSS3, Bootstrap 5, Vanilla JavaScript (ES6 Modules), Font Awesome, and Chart.js.

## Features

- **Dashboard** — Stats, charts (student growth, attendance, library), recent activity
- **Students** — Search, filter, pagination, add/edit modals, detail view
- **Faculty** — Card grid, search, department filter, add modal
- **Staff** — Directory table, search, department filter
- **Library** — Book inventory, issue/return workflows, statistics
- **Reports** — Attendance, library, and student reports with charts
- **Settings** — School profile, dark mode, theme colors, preferences

## Tech Stack

- HTML5 / CSS3
- Bootstrap 5.3
- Vanilla JavaScript ES6 Modules
- Font Awesome 6
- Chart.js 4

No build process. No npm. No bundler. No backend required.

## Project Structure

```
school-management/
├── index.html
├── templates/
│   ├── base.html
│   ├── dashboard/
│   ├── students/
│   ├── faculty/
│   ├── staff/
│   ├── library/
│   ├── reports/
│   └── settings/
├── static/
│   ├── css/
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   ├── ui.js
│   │   └── modules/
│   ├── data/
│   ├── images/
│   └── icons/
└── README.md
```

## Template Structure

Like a standard Django project, all layout lives in `templates/base.html`. Child pages only extend and fill blocks:

```django
{% extends "base.html" %}

{% block title %}Students{% endblock title %}

{% block content %}
  <!-- page-specific content only -->
{% endblock content %}
```

No repeated HTML, CSS links, sidebar, or navbar in child templates.

## Quick Start

Serve the project with any static HTTP server (required for ES modules and template loading):

```bash
npx serve .
```

Open `http://localhost:3000` in your browser.

## Deployment

### GitHub Pages

1. Push the repository to GitHub
2. Enable GitHub Pages (source: main branch, root `/`)
3. Access at `https://yourusername.github.io/school-management/`

### Netlify

Drag and drop the project folder, or connect your Git repo. No build command needed.

### Vercel

Import the repo as a static site. Set output directory to `.` (root).

## Backend Integration

The `static/js/api.js` module provides abstraction functions:

- `getStudents()` / `createStudent()` / `updateStudent()` / `deleteStudent()`
- `getFaculty()` / `createFaculty()`
- `getStaff()` / `createStaff()`
- `getBooks()` / `issueBook()` / `returnBook()`

Set `API_CONFIG.useMock = false` and uncomment the `fetch()` calls to connect to any backend:

- Django / Flask / FastAPI (Python)
- Laravel / Symfony (PHP)
- Node.js / Express
- Spring Boot (Java)
- Go / Rust

Templates use Django-style inheritance (`{% extends %}`, `{% block %}`, `{% static %}`, `{% url %}`) and work directly with Django. See `django_urls_example.py` for URL name mappings.

With Django, remove `static-init.js` from `index.html` — Django renders `base.html` + child blocks server-side.

## Demo Data

- 20 students
- 10 faculty members
- 10 staff members
- 30 library books

Data persists in `localStorage` during the session.

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## License

MIT
