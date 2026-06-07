// --- Static Template Initializer ---
// Merges Django-style child templates with base.html for static hosting

const URL_MAP = {
  'dashboard': '/?tpl=templates/dashboard/dashboard.html',
  'students-list': '/?tpl=templates/students/list.html',
  'students-detail': '/?tpl=templates/students/details.html',
  'students-form': '/?tpl=templates/students/form.html',
  'faculty-list': '/?tpl=templates/faculty/list.html',
  'faculty-form': '/?tpl=templates/faculty/form.html',
  'staff-list': '/?tpl=templates/staff/list.html',
  'staff-form': '/?tpl=templates/staff/form.html',
  'library-books': '/?tpl=templates/library/books.html',
  'library-issue': '/?tpl=templates/library/issue.html',
  'library-return': '/?tpl=templates/library/return.html',
  'reports': '/?tpl=templates/reports/reports.html',
  'settings': '/?tpl=templates/settings/settings.html'
};

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.text();
}

function parseBlock(content, blockName) {
  const regex = new RegExp(`\\{%\\s*block\\s+${blockName}\\s*%\\}([\\s\\S]*?)\\{%\\s*endblock\\s+${blockName}\\s*%\\}`);
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function resolveDjangoTags(html) {
  return html
    .replace(/\{%\s*load\s+static\s*%\}/g, '')
    .replace(/\{%\s*static\s+['"]([^'"]+)['"]\s*%\}/g, '/static/$1')
    .replace(/\{%\s*url\s+'([^']+)'\s*%\}/g, (_, name) => URL_MAP[name] || '#')
    .replace(/\{%\s*url\s+'([^']+)'\s+[^%]+%\}/g, (_, name) => {
      const base = URL_MAP[name] || '/?tpl=';
      return base.includes('?') ? base : `${base}?id=`;
    });
}

function setActiveNav(html, tplPath) {
  const current = tplPath.replace(/^templates\//, '');
  return html.replace(/<a href="([^"]+)" class="sidebar-link([^"]*)"/g, (match, href) => {
    const tplMatch = href.match(/tpl=([^&]+)/);
    const isActive = tplMatch && tplMatch[1] === tplPath;
    return `<a href="${href}" class="sidebar-link${isActive ? ' active' : ''}"`;
  });
}

export async function renderTemplate(tplPath) {
  const baseUrl = new URL('/templates/base.html', window.location.origin).href;
  const childUrl = new URL(`/${tplPath}`, window.location.origin).href;

  const [childHtml, baseHtml] = await Promise.all([
    fetchText(childUrl),
    fetchText(baseUrl)
  ]);

  const blocks = {
    title: parseBlock(childHtml, 'title') || 'Dashboard',
    page_module: parseBlock(childHtml, 'page_module') || 'dashboard',
    body_attrs: parseBlock(childHtml, 'body_attrs'),
    content: parseBlock(childHtml, 'content'),
    extra_js: parseBlock(childHtml, 'extra_js')
  };

  blocks.content = resolveDjangoTags(blocks.content);

  let rendered = resolveDjangoTags(baseHtml)
    .replace(/\{%\s*block\s+title\s*%\}[\s\S]*?\{%\s*endblock\s+title\s*%\}/, blocks.title)
    .replace(/\{%\s*block\s+page_module\s*%\}[\s\S]*?\{%\s*endblock\s+page_module\s*%\}/, blocks.page_module)
    .replace(/\{%\s*block\s+body_attrs\s*%\}[\s\S]*?\{%\s*endblock\s+body_attrs\s*%\}/, blocks.body_attrs)
    .replace(/\{%\s*block\s+content\s*%\}[\s\S]*?\{%\s*endblock\s+content\s*%\}/, blocks.content)
    .replace(/\{%\s*block\s+extra_js\s*%\}[\s\S]*?\{%\s*endblock\s+extra_js\s*%\}/, blocks.extra_js);
  rendered = setActiveNav(rendered, tplPath);
  rendered = rendered.replace(/<title>[^<]*<\/title>/, `<title>${blocks.title} | Prayush Academy</title>`);

  document.open();
  document.write(rendered);
  document.close();
}

const params = new URLSearchParams(window.location.search);
const tpl = params.get('tpl') || 'templates/dashboard/dashboard.html';

renderTemplate(tpl).catch(err => {
  document.body.innerHTML = `<div style="padding:2rem;font-family:sans-serif;max-width:600px;margin:2rem auto">
    <h1>Loading Error</h1>
    <p>Run <code>npx serve .</code> from the project root, then open <code>http://localhost:3000</code></p>
    <pre style="background:#f1f5f9;padding:1rem;border-radius:8px">${err.message}</pre>
  </div>`;
});
