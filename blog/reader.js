(() => {
  const chapters = [...document.querySelectorAll('.reader-chapter')];
  const controls = document.querySelector('.reader-controls');
  const picker = document.querySelector('#chapter-select');
  const mode = document.querySelector('#reader-mode');
  const pager = document.querySelector('.chapter-pager');
  const previous = document.querySelector('#previous-chapter');
  const next = document.querySelector('#next-chapter');
  let active = 0;
  let readAll = false;

  function render(focus = false) {
    chapters.forEach((chapter, index) => { chapter.hidden = !readAll && index !== active; });
    picker.value = chapters[active].id;
    document.querySelectorAll('.chapter-links a').forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    document.querySelector('#chapter-status').textContent = readAll ? 'All 5 sections · scroll to read' : `Section ${active + 1} of ${chapters.length}`;
    document.querySelector('#chapter-progress').value = active + 1;
    mode.textContent = readAll ? 'One section at a time' : 'Read all';
    mode.setAttribute('aria-pressed', String(readAll));
    pager.hidden = readAll;
    previous.disabled = active === 0;
    next.disabled = active === chapters.length - 1;
    next.textContent = active === chapters.length - 1 ? 'End of article' : `Next: ${picker.options[active + 1].textContent.replace(/^\d+\. /, '')} →`;
    if (focus) {
      const heading = chapters[active].querySelector('h2');
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start' });
    }
  }

  function followHash(focus = false) {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    const chapter = target?.closest('.reader-chapter');
    if (!chapter) return;
    active = chapters.indexOf(chapter);
    let parent = target;
    while (parent && parent !== chapter) {
      if (parent.tagName === 'DETAILS') parent.open = true;
      parent = parent.parentElement;
    }
    render(focus);
    if (target !== chapter && focus) target.scrollIntoView({ block: 'start' });
  }

  function go(index) {
    active = index;
    history.pushState(null, '', `#${chapters[active].id}`);
    render(true);
  }
  picker.addEventListener('change', () => go(chapters.findIndex(chapter => chapter.id === picker.value)));
  previous.addEventListener('click', () => { if (active > 0) go(active - 1); });
  next.addEventListener('click', () => { if (active < chapters.length - 1) go(active + 1); });
  mode.addEventListener('click', () => {
    readAll = !readAll;
    document.querySelectorAll('.chapter-topic').forEach(topic => { topic.open = readAll; });
    render(true);
  });
  window.addEventListener('hashchange', () => followHash(true));
  window.addEventListener('popstate', () => { if (!location.hash) { active = 0; render(true); } else followHash(true); });
  controls.hidden = false;
  document.querySelectorAll('.chapter-links a').forEach((link, index) => {
    link.addEventListener('click', event => { event.preventDefault(); go(index); });
  });
  render();
  followHash(Boolean(location.hash));
})();
