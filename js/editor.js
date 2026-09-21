/* The file is the database.
   #db holds a JSON overlay: text edits live there, and Save writes it back into this HTML file.
   Keys are derived from the DOM at load, so the HTML stays the single source of truth. */
const db = document.getElementById('db'),
      page = { key: 'home', refs: new Map(), store: {}, seed: {} };

/* Every visible text node gets a stable key: slug of its section + ordinal. */
const text = n => n.nodeValue.trim() && !n.parentElement.closest('script,style,svg,#cms,#edit,#y');
const keyFor = (n, i) => n.parentElement.closest('[id],section,header,footer')
        .textContent.trim().slice(0, 32).replace(/\W+/g, '-').toLowerCase() + '.' + i;
const walker = document.createTreeWalker(document.body, 0x4, { acceptNode: n => text(n) ? 1 : 2 });
for (let n; n = walker.nextNode();)
  page.refs.set(keyFor(n, page.refs.size), n);

const read = s => { try { return JSON.parse(s) } catch { return {} } };
const apply = d => { for (const k in d) page.refs.get(k) && (page.refs.get(k).nodeValue = page.store[k] = d[k]) };
const sync = () => { for (const [k, n] of page.refs) if (n.isConnected) page.store[k] = n.nodeValue };
for (const [k, n] of page.refs) page.seed[k] = n.nodeValue;          /* original copy, always */
apply({ ...(read(db.textContent).home ?? {}), ...(read(localStorage.getItem('cms:' + page.key)) ?? {}) });

const box = document.querySelector('#cms textarea'),
      note = document.querySelector('#cms h3+p'),
      [save, applyBtn, reset, shut] = document.querySelectorAll('#cms [data-btn]'),
      say = m => note.textContent = m,
      mirror = () => box.value = JSON.stringify(page.store, null, 2);
mirror();

const mode = (p => { try { p.contentEditable = 'plaintext-only'; return 'plaintext-only' } catch { return 'true' } })(document.createElement('p'));
const setEdit = on => {
  document.body.toggleAttribute('data-edit', on);
  page.refs.forEach((n, k) => n.parentElement && (n.parentElement.contentEditable = on ? mode : 'inherit'));
  on && (sync(), mirror());
};

let file;
edit.onclick = () => setEdit(true);
shut.onclick = () => setEdit(false);
onkeydown = e => e.key === 'e' && (e.metaKey || e.ctrlKey) && (e.preventDefault(), setEdit(!document.body.hasAttribute('data-edit')));
document.body.oninput = e => {
  if (document.body.hasAttribute('data-edit') && !e.target.closest('#cms')) sync(), mirror();
};
applyBtn.onclick = () => {
  const d = read(box.value);
  d && Object.values(d).every(v => typeof v === 'string')
    ? (apply(d), mirror(), say('Applied to the page.'))
    : say('That JSON has a syntax error or unexpected values.');
};
reset.onclick = () => {
  db.textContent = JSON.stringify({ [page.key]: {} });
  localStorage.removeItem('cms:' + page.key);
  for (const [k, n] of page.refs) n.nodeValue = page.seed[k];
  page.store = {}; sync(); mirror(); say('Back to the original copy.');
};
save.onclick = async () => {
  sync();
  db.textContent = JSON.stringify({ [page.key]: page.store }, null, 1);
  try { localStorage.setItem('cms:' + page.key, JSON.stringify(page.store)) } catch {}
  const copy = document.documentElement.cloneNode(true);
  copy.querySelectorAll('#cms,#edit,#db+script,button[aria-label=Menu]').forEach(el => el.remove());
  copy.querySelectorAll('[contenteditable],[data-stuck],[data-open]').forEach(el =>
    ['contenteditable', 'data-stuck', 'data-open'].forEach(a => el.removeAttribute(a)));
  copy.querySelector('#y').textContent = '';
  const src = '<!doctype html>\n' + copy.outerHTML;
  try {
    file ??= await showSaveFilePicker({ suggestedName: location.pathname.split('/').pop(), types: [{ description: 'Web page', accept: { 'text/html': ['.html'] } }] });
    const w = await file.createWritable(); await w.write(src); await w.close();
    say('Saved to ' + file.name + '.');
  } catch (err) {
    if (err.name === 'AbortError') return;
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([src], { type: 'text/html' })), download: location.pathname.split('/').pop() });
    a.click(); URL.revokeObjectURL(a.href);
    say('Downloaded ' + a.download + ' (in Chrome, bind the file to write in place).');
  }
};
