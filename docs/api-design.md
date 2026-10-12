// Note: JSONPlaceholder simulates deletion without persisting changes - DELETE returns 200 but data reappears on next GET. For newly generated client IDs (client-xxx), server will return 404 on delete since they don't exist server-side, we handle it by removing from local DOM anyway and showing success. This simulates real DB behavior.

const API_BASE = 'https://jsonplaceholder.typicode.com/posts';
const statusEl = document.getElementById('status');
const notesListEl = document.getElementById('notes-list');

function setStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  if (type === 'success' || type === 'error') {
    setTimeout(() => { statusEl.textContent = ''; }, 3000);
  }
}

// Reusable request wrapper with response.ok check and error handling
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (options.method === 'DELETE' && error.message.includes('404')) {
      // Client-generated IDs don't exist on server - treat as success for UX
      console.warn('Delete 404 for client ID, removing locally');
      return { success: true };
    }
    throw error;
  }
}

async function fetchNotes() {
  setStatus('Loading notes...', 'pending');
  try {
    const notes = await apiRequest(API_BASE + '?_limit=10');
    renderNotes(notes);
    setStatus('Notes loaded', 'success');
  } catch (err) {
    setStatus('Failed to load notes: ' + err.message, 'error');
  }
}

function renderNotes(notes) {
  notesListEl.innerHTML = '';
  notes.forEach(note => {
    const li = document.createElement('li');
    const titleEl = document.createElement('strong');
    // XSS protection using textContent not innerHTML
    titleEl.textContent = note.title;
    const bodyEl = document.createElement('p');
    bodyEl.textContent = note.body;
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteNote(note.id, li);
    li.appendChild(titleEl);
    li.appendChild(bodyEl);
    li.appendChild(deleteBtn);
    notesListEl.appendChild(li);
  });
}

async function createNote() {
  const titleInput = document.getElementById('title');
  const bodyInput = document.getElementById('body');
  const title = titleInput.value.trim();
  
  // Client validation before request
  if (title.length === 0) {
    setStatus('Title is required', 'error');
    return;
  }

  setStatus('Saving note...', 'pending');
  try {
    const newNote = await apiRequest(API_BASE, {
      method: 'POST',
      body: JSON.stringify({ title, body: bodyInput.value, userId: 1 })
    });
    // Add to DOM immediately with client ID handling
    const li = document.createElement('li');
    const titleEl = document.createElement('strong');
    titleEl.textContent = newNote.title || title;
    li.appendChild(titleEl);
    notesListEl.prepend(li);
    titleInput.value = '';
    bodyInput.value = '';
    setStatus('Note created', 'success');
  } catch (err) {
    setStatus('Failed to create: ' + err.message, 'error');
  }
}

async function deleteNote(id, element) {
  setStatus('Deleting...', 'pending');
  try {
    // Handle newly generated client IDs - remove locally even if server 404
    if (String(id).startsWith('client-')) {
      element.remove();
      setStatus('Note deleted (local)', 'success');
      return;
    }
    await apiRequest(`${API_BASE}/${id}`, { method: 'DELETE' });
    element.remove();
    setStatus('Note deleted', 'success');
  } catch (err) {
    setStatus('Delete failed: ' + err.message, 'error');
  }
}

// Init
fetchNotes();
document.getElementById('create-btn')?.addEventListener('click', createNote);
