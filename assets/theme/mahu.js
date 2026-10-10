/* Mahu清绿：只增强导航、目录和评论外观；数据由XBlog与原有Artalk接入处理。 */
(() => {
  const navigation = document.getElementById('site-navigation');
  const groups = navigation ? [...navigation.querySelectorAll('.nav-group')] : [];
  const mobile = matchMedia('(max-width: 760px)');
  const resetGroups = () => groups.forEach(group => { group.open = mobile.matches; });
  resetGroups();
  mobile.addEventListener('change', resetGroups);
  window.addEventListener('pageshow', resetGroups);
  groups.forEach(group => group.addEventListener('toggle', () => {
    if (!mobile.matches && group.open) groups.forEach(other => { if (other !== group) other.open = false; });
  }));
  const dismiss = event => {
    if (!mobile.matches && navigation && !navigation.contains(event.target)) {
      groups.forEach(group => { group.open = false; });
    }
  };
  document.addEventListener('pointerdown', dismiss);
  document.addEventListener('focusin', dismiss);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || mobile.matches) return;
    const opened = groups.find(group => group.open);
    if (opened) { opened.open = false; opened.querySelector('summary')?.focus(); event.preventDefault(); }
  });

  const tags = document.getElementById('mahu-tag-list');
  if (tags && tags.querySelectorAll('a').length > 6) {
    tags.classList.add('mahu-tags-ready');
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'tag-expand';
    toggle.textContent = '展开全部标签';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', tags.id);
    toggle.addEventListener('click', () => {
      const expanded = tags.classList.toggle('is-expanded');
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.textContent = expanded ? '收起标签' : '展开全部标签';
    });
    tags.after(toggle);
  }

  const scroller = document.querySelector('.article-scroll');
  const links = [...document.querySelectorAll('.toc a[href^="#"], .mobile-toc a[href^="#"]')];
  if (scroller && links.length) {
    const headings = [...document.querySelectorAll('.prose h2[id], .prose h3[id], .prose h4[id], .prose h5[id], .prose h6[id]')];
    let scheduled = false;
    const highlight = () => {
      scheduled = false;
      const threshold = scroller.getBoundingClientRect().top + 100;
      let current = headings[0];
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= threshold) current = heading;
        else break;
      }
      if (!current) return;
      links.forEach(link => {
        const active = link.hash === '#' + current.id;
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      links.filter(link => link.hash === '#' + current.id).forEach(link => {
        const parent = link.closest('.toc-section')?.querySelector('a.level-2');
        if (parent) parent.setAttribute('aria-current', 'location');
      });
    };
    scroller.addEventListener('scroll', () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(highlight); }
    }, { passive: true });
    window.addEventListener('resize', highlight);
    window.addEventListener('hashchange', highlight);
    highlight();
  }

  // CSS controls the layout; these DOM edits only supply concise Chinese labels.
  const comments = document.getElementById('comments');
  if (comments) {
    const enhance = () => {
      const send = comments.querySelector('.atk-send-btn');
      if (send && send.textContent.trim() === '发送') send.textContent = '发布评论';
      const empty = comments.querySelector('.atk-list-no-comment');
      if (empty && /此时无声胜有声/.test(empty.textContent)) empty.textContent = '还没有评论，欢迎分享你的实践或问题。';
      const textarea = comments.querySelector('textarea.atk-textarea');
      if (textarea) {
        textarea.setAttribute('aria-label', '评论内容');
        textarea.placeholder = '例如：按第二步操作后，出现了……';
        if (!textarea.dataset.mahuReady) {
          textarea.dataset.mahuReady = 'true';
          const fit = () => { textarea.style.height = 'auto'; textarea.style.height = Math.min(360, Math.max(116, textarea.scrollHeight)) + 'px'; };
          textarea.addEventListener('input', fit);
          fit();
        }
      }
      const nickname = comments.querySelector('input[name="name"]');
      if (nickname) { nickname.placeholder = '怎么称呼你？'; nickname.setAttribute('aria-label', '昵称'); }
      const actions = comments.querySelectorAll('.atk-plug-btn');
      actions.forEach(action => { if (!action.hasAttribute('aria-label') && action.title) action.setAttribute('aria-label', action.title); });
    };
    enhance();
    new MutationObserver(enhance).observe(comments, { childList: true, subtree: true });
  }
})();
