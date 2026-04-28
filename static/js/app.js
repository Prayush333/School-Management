// --- Application Bootstrap ---

import { initSidebar, initTheme, initGlobalSearch } from './ui.js';

// -- Initialize Core UI --

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSidebar();
  initGlobalSearch();

  const pageModule = document.body.dataset.page;
  if (pageModule) {
    import(`./modules/${pageModule}.js`)
      .then(module => {
        if (module.init) module.init();
      })
      .catch(err => console.error(`Failed to load module: ${pageModule}`, err));
  }
});
