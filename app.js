const grid = document.querySelector('#article-grid');
const featuredWrap = document.querySelector('#featured-wrap');
const filters = document.querySelector('#filters');
const search = document.querySelector('#search');
const emptyState = document.querySelector('#empty-state');
const dialog = document.querySelector('#article-dialog');
const dialogContent = document.querySelector('#dialog-content');
const languageToggle = document.querySelector('#language-toggle');
const allTopics = '__all__';
let ukrainianPosts = [];
let englishPosts = [];
let posts = [];
let language = localStorage.getItem('uroky-language') === 'en' ? 'en' : 'uk';
let activeCategory = allTopics;

const ui = {
  uk: {
    skip: 'Перейти до матеріалів', nav: ['Головна', 'Усі матеріали', 'Про блог'],
    heroEyebrow: 'Нотатки про освіту, що змінюється', heroTitle: 'Вчитися — це<br><span>бути в русі.</span>',
    heroText: 'Досліджую, яким буде навчання завтра: від штучного інтелекту до звички вчитися все життя. Тут — ідеї, які можна застосувати вже сьогодні.',
    readMaterials: 'Читати матеріали', formula: 'МОЯ ФОРМУЛА', formulaEnd: '= нові можливості', artCaption: 'Навчання не має фінішу',
    heroFoot: ['ІДЕЇ ДЛЯ ТИХ, ХТО НАВЧАЄТЬСЯ', 'ГОРТАЙТЕ ВНИЗ'], library: 'Бібліотека ідей', fresh: 'Свіжі думки',
    sectionNote: 'Менше теорії заради теорії.<br>Більше того, що працює.', search: 'Знайти матеріал…',
    empty: 'Поки що нічого не знайшлося. Спробуйте іншу тему або запит.', read: 'Читати матеріал',
    sources: 'Джерела й актуальні ресурси', aboutEyebrow: 'Навіщо цей блог', aboutTitle: 'Майбутнє освіти<br>починається з <em>цікавості.</em>',
    aboutP1: 'Я вірю, що найкраща освіта — не та, що дає всі відповіді, а та, що допомагає ставити кращі запитання.',
    aboutP2: 'Цей блог — простір для роздумів про нові інструменти, людські навички та сміливі способи вчитися.',
    contact: 'Написати автору', footer: 'Думати. Пробувати. Вчитися.', title: 'Education in Motion — блог про навчання майбутнього',
    description: 'Блог про навчання майбутнього: ідеї, технології та практики, які допомагають вчитися все життя.',
    searchLabel: 'Знайти матеріал', categoryLabel: 'Фільтр за темою', dialogLabel: 'Матеріал', close: 'Закрити',
    themeDark: 'Увімкнути темну тему', themeLight: 'Увімкнути світлу тему', all: 'Усі теми',
    loadError: 'Не вдалося завантажити матеріали. Перевірте, що posts.json і posts-en.json розміщені поруч із сайтом.',
    languageAction: 'Switch to English', contactSubject: 'Привіт, Education in Motion'
  },
  en: {
    skip: 'Skip to articles', nav: ['Home', 'Articles', 'About'],
    heroEyebrow: 'Notes on an education in motion', heroTitle: 'Learning is<br><span>always in motion.</span>',
    heroText: 'Exploring the future of learning: from artificial intelligence to the habit of lifelong learning. Ideas here are meant to be put into practice today.',
    readMaterials: 'Explore the articles', formula: 'MY FORMULA', formulaEnd: '= new possibilities', artCaption: 'Learning has no finish line',
    heroFoot: ['IDEAS FOR CURIOUS LEARNERS', 'SCROLL DOWN'], library: 'A library of ideas', fresh: 'Fresh perspectives',
    sectionNote: 'Less theory for theory’s sake.<br>More of what works.', search: 'Search articles…',
    empty: 'No articles found. Try another topic or search term.', read: 'Read article',
    sources: 'Sources and further reading', aboutEyebrow: 'Why this blog', aboutTitle: 'The future of learning<br>begins with <em>curiosity.</em>',
    aboutP1: 'I believe the best education is not the kind that gives every answer, but the kind that helps us ask better questions.',
    aboutP2: 'This blog is a space to explore new tools, human skills and thoughtful ways to learn.',
    contact: 'Write to the author', footer: 'Think. Try. Keep learning.', title: 'Education in Motion — learning for the future',
    description: 'A blog about the future of learning: ideas, technology and practices for lifelong learning.',
    searchLabel: 'Search articles', categoryLabel: 'Filter by topic', dialogLabel: 'Article', close: 'Close',
    themeDark: 'Switch to dark theme', themeLight: 'Switch to light theme', all: 'All topics',
    loadError: 'Could not load articles. Make sure posts.json and posts-en.json are next to the site.',
    languageAction: 'Switch to Ukrainian', contactSubject: 'Hello, Education in Motion'
  }
};

function applyLanguage() {
  const t = ui[language];
  document.documentElement.lang = language;
  document.title = t.title;
  document.querySelector('meta[name="description"]').content = t.description;
  document.querySelector('.skip-link').textContent = t.skip;
  document.querySelectorAll('.nav a').forEach((link, index) => { link.textContent = t.nav[index]; });
  document.querySelector('.nav').setAttribute('aria-label', language === 'uk' ? 'Основна навігація' : 'Main navigation');
  document.querySelector('.hero-copy .eyebrow').innerHTML = `<span class="eyebrow-dot"></span> ${t.heroEyebrow}`;
  document.querySelector('.hero h1').innerHTML = t.heroTitle;
  document.querySelector('.hero-text').textContent = t.heroText;
  document.querySelector('.hero-copy .button').innerHTML = `${t.readMaterials} <span aria-hidden="true">↘</span>`;
  document.querySelector('.hero-art').setAttribute('aria-label', language === 'uk' ? 'Ілюстрація: навчання як шлях уперед' : 'Illustration: learning as a journey forward');
  document.querySelector('.art-card-label').textContent = t.formula;
  document.querySelector('.art-card-foot').innerHTML = `${t.formulaEnd} <b>↗</b>`;
  document.querySelector('.art-caption').textContent = t.artCaption;
  document.querySelectorAll('.hero-bottom > span').forEach((node, i) => { node.innerHTML = i ? `${t.heroFoot[i]} <span aria-hidden="true">↓</span>` : t.heroFoot[i]; });
  document.querySelector('#filters').setAttribute('aria-label', t.categoryLabel);
  document.querySelector('.articles-section .section-heading .eyebrow').textContent = t.library;
  document.querySelector('.section-heading h2').innerHTML = `${t.fresh}<span class="heading-period">.</span>`;
  document.querySelector('.section-note').innerHTML = t.sectionNote;
  search.placeholder = t.search;
  search.setAttribute('aria-label', t.searchLabel);
  emptyState.textContent = t.empty;
  document.querySelector('.manifesto .eyebrow').textContent = t.aboutEyebrow;
  document.querySelector('.manifesto h2').innerHTML = t.aboutTitle;
  document.querySelector('.manifesto-copy p:first-child').textContent = t.aboutP1;
  document.querySelector('.manifesto-copy p:nth-child(2)').textContent = t.aboutP2;
  const contact = document.querySelector('.manifesto .text-link');
  contact.innerHTML = `${t.contact} <span aria-hidden="true">↗</span>`;
  contact.href = `mailto:hello@example.com?subject=${encodeURIComponent(t.contactSubject)}`;
  document.querySelector('.site-footer > span:nth-child(2)').textContent = t.footer;
  document.querySelector('#article-dialog').setAttribute('aria-label', t.dialogLabel);
  document.querySelector('#dialog-close').setAttribute('aria-label', t.close);
  languageToggle.textContent = language === 'uk' ? 'EN' : 'УКР';
  languageToggle.setAttribute('aria-label', t.languageAction);
  document.querySelector('#theme-toggle').setAttribute('aria-label', document.body.classList.contains('dark') ? t.themeLight : t.themeDark);
}

const dateLabel = value => new Intl.DateTimeFormat(language === 'uk' ? 'uk-UA' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
const metaMarkup = post => `<div class="article-meta"><span class="category-label">${post.category}</span><span>${dateLabel(post.date)}</span><span>${post.readTime}</span></div>`;

function renderFilters() {
  filters.replaceChildren();
  const allCategories = [allTopics, ...new Set(posts.map(post => post.category))];
  allCategories.forEach(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter-button${category === activeCategory ? ' active' : ''}`;
    button.textContent = category === allTopics ? ui[language].all : category;
    button.setAttribute('aria-pressed', String(category === activeCategory));
    button.addEventListener('click', () => { activeCategory = category; render(); });
    filters.append(button);
  });
}

function cardMarkup(post) {
  return `<article class="article-card" tabindex="0" role="button" data-post="${post.id}" aria-label="${ui[language].read}: ${post.title}">
    <div class="card-art ${post.tone || 'tone-green'}" aria-hidden="true"><span>${post.symbol || '✳'}</span></div>
    ${metaMarkup(post)}<h3>${post.title}</h3><p>${post.excerpt}</p><span class="card-read">${ui[language].read} <span aria-hidden="true">↗</span></span>
  </article>`;
}

function openPost(id) {
  const post = posts.find(item => item.id === id);
  if (!post) return;
  const blocks = post.content.map(block => {
    if (block.type === 'h2') return `<h2>${block.text}</h2>`;
    if (block.type === 'ul') return `<ul>${block.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    if (block.type === 'sources') return `<div class="source-list"><h2>${ui[language].sources}</h2><ul>${block.items.map(item => `<li><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title} <span aria-hidden="true">↗</span></a></li>`).join('')}</ul></div>`;
    return `<p>${block.text}</p>`;
  }).join('');
  dialogContent.innerHTML = `<div class="dialog-content">${metaMarkup(post)}<h1>${post.title}</h1><div class="article-body">${blocks}</div></div>`;
  if (!dialog.open) dialog.showModal();
  history.replaceState(null, '', `#article-${post.id}`);
}

function render() {
  renderFilters();
  const term = search.value.trim().toLocaleLowerCase(language);
  const matching = posts.filter(post => (activeCategory === allTopics || post.category === activeCategory) && `${post.title} ${post.excerpt} ${post.category}`.toLocaleLowerCase(language).includes(term));
  const featured = matching.find(post => post.featured);
  featuredWrap.innerHTML = featured ? `<article class="featured">
    <div class="featured-visual ${featured.tone || 'tone-green'}" aria-hidden="true"><span class="featured-glyph">${featured.symbol || '✳'}</span></div>
    <div class="featured-info">${metaMarkup(featured)}<h3>${featured.title}</h3><p>${featured.excerpt}</p><a class="read-link" href="#article-${featured.id}" data-post="${featured.id}">${ui[language].read} <span aria-hidden="true">↗</span></a></div>
  </article>` : '';
  grid.innerHTML = matching.filter(post => post !== featured).map(cardMarkup).join('');
  emptyState.hidden = matching.length > 0;
  document.querySelectorAll('[data-post]').forEach(element => {
    element.addEventListener('click', event => { event.preventDefault(); openPost(element.dataset.post); });
    if (element.matches('.article-card')) element.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPost(element.dataset.post); } });
  });
}

search.addEventListener('input', render);
languageToggle.addEventListener('click', () => {
  const openId = dialog.open ? location.hash.replace('#article-', '') : '';
  language = language === 'uk' ? 'en' : 'uk';
  localStorage.setItem('uroky-language', language);
  activeCategory = allTopics;
  applyLanguage();
  posts = language === 'en'
    ? ukrainianPosts.map(post => ({ ...post, ...(englishPosts.find(item => item.id === post.id) || {}), id: post.id, date: post.date, tone: post.tone, symbol: post.symbol, featured: post.featured }))
    : ukrainianPosts;
  render();
  if (openId) openPost(openId);
});
document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => { if (location.hash.startsWith('#article-')) history.replaceState(null, '', '#articles'); });
document.querySelector('#theme-toggle').addEventListener('click', event => {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('uroky-theme', isDark ? 'dark' : 'light');
  applyLanguage();
});
if (localStorage.getItem('uroky-theme') === 'dark') document.body.classList.add('dark');
document.querySelector('#year').textContent = new Date().getFullYear();
applyLanguage();

Promise.all([fetch('posts.json'), fetch('posts-en.json')])
  .then(async responses => {
    if (responses.some(response => !response.ok)) throw new Error('Could not load post files');
    return Promise.all(responses.map(response => response.json()));
  })
  .then(([ukData, enData]) => {
    ukrainianPosts = ukData.sort((a, b) => b.date.localeCompare(a.date));
    englishPosts = enData;
    posts = language === 'en'
      ? ukrainianPosts.map(post => ({ ...post, ...(englishPosts.find(item => item.id === post.id) || {}), id: post.id, date: post.date, tone: post.tone, symbol: post.symbol, featured: post.featured }))
      : ukrainianPosts;
    render();
    const articleId = location.hash.startsWith('#article-') ? location.hash.slice(9) : '';
    if (articleId) openPost(articleId);
  })
  .catch(() => { emptyState.hidden = false; emptyState.textContent = ui[language].loadError; });
