const grid = document.querySelector('#article-grid');
const featuredWrap = document.querySelector('#featured-wrap');
const filters = document.querySelector('#filters');
const search = document.querySelector('#search');
const emptyState = document.querySelector('#empty-state');
const dialog = document.querySelector('#article-dialog');
const dialogContent = document.querySelector('#dialog-content');
const categories = ['Усі теми'];
let posts = [];
let activeCategory = 'Усі теми';

const dateLabel = value => new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
const metaMarkup = post => `<div class="article-meta"><span class="category-label">${post.category}</span><span>${dateLabel(post.date)}</span><span>${post.readTime}</span></div>`;

function renderFilters() {
  filters.replaceChildren();
  const allCategories = [...categories, ...new Set(posts.map(post => post.category))];
  allCategories.forEach(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter-button${category === activeCategory ? ' active' : ''}`;
    button.textContent = category;
    button.setAttribute('aria-pressed', String(category === activeCategory));
    button.addEventListener('click', () => { activeCategory = category; render(); });
    filters.append(button);
  });
}

function cardMarkup(post) {
  return `<article class="article-card" tabindex="0" role="button" data-post="${post.id}" aria-label="Відкрити матеріал: ${post.title}">
    <div class="card-art ${post.tone || 'tone-green'}" aria-hidden="true"><span>${post.symbol || '✳'}</span></div>
    ${metaMarkup(post)}<h3>${post.title}</h3><p>${post.excerpt}</p><span class="card-read">Читати матеріал <span aria-hidden="true">↗</span></span>
  </article>`;
}

function openPost(id) {
  const post = posts.find(item => item.id === id);
  if (!post) return;
  const blocks = post.content.map(block => {
    if (block.type === 'h2') return `<h2>${block.text}</h2>`;
    if (block.type === 'ul') return `<ul>${block.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    if (block.type === 'sources') return `<div class="source-list"><h2>Джерела й актуальні ресурси</h2><ul>${block.items.map(item => `<li><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title} <span aria-hidden="true">↗</span></a></li>`).join('')}</ul></div>`;
    return `<p>${block.text}</p>`;
  }).join('');
  dialogContent.innerHTML = `<div class="dialog-content">${metaMarkup(post)}<h1>${post.title}</h1><div class="article-body">${blocks}</div></div>`;
  if (!dialog.open) dialog.showModal();
  history.replaceState(null, '', `#article-${post.id}`);
}

function render() {
  renderFilters();
  const term = search.value.trim().toLocaleLowerCase('uk');
  const matching = posts.filter(post => (activeCategory === 'Усі теми' || post.category === activeCategory) && `${post.title} ${post.excerpt} ${post.category}`.toLocaleLowerCase('uk').includes(term));
  const featured = matching.find(post => post.featured);
  featuredWrap.innerHTML = featured ? `<article class="featured">
    <div class="featured-visual ${featured.tone || 'tone-green'}" aria-hidden="true"><span class="featured-glyph">${featured.symbol || '✳'}</span></div>
    <div class="featured-info">${metaMarkup(featured)}<h3>${featured.title}</h3><p>${featured.excerpt}</p><a class="read-link" href="#article-${featured.id}" data-post="${featured.id}">Читати матеріал <span aria-hidden="true">↗</span></a></div>
  </article>` : '';
  grid.innerHTML = matching.filter(post => post !== featured).map(cardMarkup).join('');
  emptyState.hidden = matching.length > 0;
  document.querySelectorAll('[data-post]').forEach(element => {
    element.addEventListener('click', event => { event.preventDefault(); openPost(element.dataset.post); });
    if (element.matches('.article-card')) element.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPost(element.dataset.post); } });
  });
}

search.addEventListener('input', render);
document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => { if (location.hash.startsWith('#article-')) history.replaceState(null, '', '#articles'); });
document.querySelector('#theme-toggle').addEventListener('click', event => {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('uroky-theme', isDark ? 'dark' : 'light');
  event.currentTarget.setAttribute('aria-label', isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему');
});
if (localStorage.getItem('uroky-theme') === 'dark') document.body.classList.add('dark');
document.querySelector('#year').textContent = new Date().getFullYear();

fetch('posts.json')
  .then(response => { if (!response.ok) throw new Error('Не вдалося завантажити дописи'); return response.json(); })
  .then(data => { posts = data.sort((a, b) => b.date.localeCompare(a.date)); render(); })
  .catch(() => { emptyState.hidden = false; emptyState.textContent = 'Не вдалося завантажити матеріали. Перевірте, що posts.json розміщений поруч із сайтом.'; });
