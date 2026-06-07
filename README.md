
# Prayush Academy — School Management System

A production-ready School Management System frontend built with plain HTML, CSS, and JavaScript. No build tools, no frameworks, no backend required — just open and run.

---

## Features

### Dashboard

* Summary stats (total students, faculty, staff, books)
* Student growth chart, attendance chart, library activity chart (Chart.js)
* Recent activity feed

### Students

* Searchable, filterable, paginated student list
* Student detail view
* Add / edit student form with modal

### Faculty

* Card grid layout
* Search and department filter
* Add faculty modal

### Staff

* Directory table
* Search and department filter
* Add staff modal

### Library

* Book inventory table
* Issue and return workflows
* Library usage statistics

### Reports

* Attendance, library, and student reports
* Visual charts for each report type

### Settings

* School profile configuration
* Dark mode toggle
* Theme color preferences

---

## Tech Stack

| Technology         | Version     | Purpose                       |
| ------------------ | ----------- | ----------------------------- |
| HTML5 / CSS3       | —          | Structure and styling         |
| Bootstrap          | 5.3         | Layout and UI components      |
| Vanilla JavaScript | ES6 Modules | Routing, logic, interactivity |
| Font Awesome       | 6           | Icons                         |
| Chart.js           | 4           | Charts and data visualization |

No npm. No bundler. No build step.

---

## Project Structure

```
prayush-academy/
├── index.html                  # Entry point — loads static-init.js
├── django_urls_example.py      # (optional) Django URL reference
├── README.md
├── templates/
│   ├── base.html               # Master layout (sidebar, navbar, CDN imports)
│   ├── dashboard/
│   │   └── dashboard.html
│   ├── students/
│   │   ├── list.html
│   │   ├── details.html
│   │   └── form.html
│   ├── faculty/
│   │   ├── list.html
│   │   └── form.html
│   ├── staff/
│   │   ├── list.html
│   │   └── form.html
│   ├── library/
│   │   ├── books.html
│   │   ├── issue.html
│   │   └── return.html
│   ├── reports/
│   │   └── reports.html
│   └── settings/
│       └── settings.html
└── static/
    ├── css/                    # Custom stylesheets
    ├── js/
    │   ├── static-init.js      # Bootstraps base.html in the browser
    │   ├── app.js              # Client-side router
    │   ├── api.js              # Data layer (mock / real API switch)
    │   ├── ui.js               # Shared DOM helpers
    │   └── modules/            # Page-specific JavaScript
    ├── data/                   # JSON demo data
    ├── images/
    └── icons/
```

---

## Getting Started

ES modules require a server — you can't open `index.html` directly as a file. Use any static server:

```bash
# Option 1 — Node.js serve
npx serve .

# Option 2 — Python
python -m http.server 8000

# Option 3 — VS Code
# Install the "Live Server" extension and click "Go Live"
```

Then open `http://localhost:3000` (or whichever port) in your browser.

---

## Demo Data

The app ships with pre-loaded mock data stored in `localStorage`:

* 20 students
* 10 faculty members
* 10 staff members
* 30 library books

Data persists for the duration of your browser session.

---

## Connecting a Real Backend

Open `static/js/api.js` and set:

```js
API_CONFIG.useMock = false;
```

Then uncomment the `fetch()` calls. The API layer exposes these functions:

```js
// Students
getStudents()
createStudent(data)
updateStudent(id, data)
deleteStudent(id)

// Faculty
getFaculty()
createFaculty(data)

// Staff
getStaff()
createStaff(data)

// Library
getBooks()
issueBook(data)
returnBook(id)
```

These work with any REST backend — Django, Flask, FastAPI, Laravel, Node/Express, Spring Boot, or Go.

### Django Integration

The templates use Django-style syntax (`{% extends %}`, `{% block %}`, `{% static %}`, `{% url %}`), so they drop straight into a Django project.

1. Copy `templates/` into your Django app's template directory
2. Add the URL patterns from `django_urls_example.py` to your `urls.py`
3. Remove `static-init.js` from `index.html` — Django renders templates server-side

---

## Deployment

### GitHub Pages

1. Push the repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Access at `https://yourusername.github.io/prayush-academy/`

### Netlify

Drag and drop the project folder into [netlify.com/drop](https://netlify.com/drop). No build command needed.

### Vercel

Import the repo as a static site. Set the output directory to `.` (root).

---

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## License

MIT
