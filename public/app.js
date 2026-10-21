const state = { current: '', backStack: [], forwardStack: [] };
const currentPage = document.querySelector('#currentPage');
const message = document.querySelector('#message');
const backButton = document.querySelector('#back');
const forwardButton = document.querySelector('#forward');
const input = document.querySelector('#pageInput');

function renderStack(elementId, items, label) {
  const element = document.querySelector(`#${elementId}`);
  element.classList.toggle('empty', items.length === 0);
  if (items.length === 0) {
    element.textContent = `No ${label} pages`;
    return;
  }
  element.innerHTML = items.map((item, index) =>
    `<div class="stack-item"><span>${escapeHtml(item)}</span><small>${index === items.length - 1 ? 'TOP' : ''}</small></div>`
  ).join('');
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[character]));
}

function render() {
  currentPage.textContent = state.current || 'New tab';
  document.querySelector('#backCount').textContent = state.backStack.length;
  document.querySelector('#forwardCount').textContent = state.forwardStack.length;
  backButton.disabled = state.backStack.length === 0;
  forwardButton.disabled = state.forwardStack.length === 0;
  renderStack('backStack', state.backStack, 'previous');
  renderStack('forwardStack', state.forwardStack, 'forward');
}

async function perform(action, url = '') {
  backButton.disabled = true;
  forwardButton.disabled = true;
  try {
    const response = await fetch('/api/browser/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...state, action, url }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Stack operation failed');
    state.current = result.current;
    state.backStack = result.backStack;
    state.forwardStack = result.forwardStack;
    message.textContent = result.message;
    render();
  } catch (error) {
    message.textContent = error.message;
    render();
  }
}

document.querySelector('#visitForm').addEventListener('submit', event => {
  event.preventDefault();
  const url = input.value.trim();
  if (!url) return;
  perform('visit', url);
  input.value = '';
});
backButton.addEventListener('click', () => perform('back'));
forwardButton.addEventListener('click', () => perform('forward'));
render();
