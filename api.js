const API_URL = "https://jsonplaceholder.typicode.com/posts";
const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const notesList = document.getElementById("notes-list");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    ...options
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response;
}
function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = type;
}
function renderNotes(notes) {
  notesList.innerHTML = "";
  if (!notes || notes.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No notes yet. Create one above or load from server.";
    empty.className = "empty-state";
    notesList.appendChild(empty);
    return;
  }
  notes.forEach(note => {
    const li = document.createElement("li");
    li.dataset.id = note.id;
    const title = document.createElement("h3");
    title.textContent = note.title;
    const body = document.createElement("p");
    body.textContent = note.body || "";
    const meta = document.createElement("small");
    meta.textContent = `ID: ${note.id} | User: ${note.userId || 1}`;
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.addEventListener("click", () => deleteNote(note.id, li, delBtn));
    li.append(title, body, meta, delBtn);
    notesList.appendChild(li);
  });
}
async function loadNotes() {
  try {
    loadBtn.disabled = true;
    setStatus("Loading notes...", "loading");
    const response = await request(`${API_URL}?_limit=10`);
    const data = await response.json();
    renderNotes(data);
    setStatus(data.length===0 ? "No notes found on server." : `Loaded ${data.length} notes from the server.`, data.length===0 ? "empty" : "success");
  } catch (error) {
    setStatus(`Failed to load notes: ${error.message}. Please check your connection and try again.`, "error");
  } finally {
    loadBtn.disabled = false;
  }
}
async function createNote(title, body) {
  if (!title || title.trim() === "") { setStatus("Title is required.", "error"); return; }
  if (title.length > 100) { setStatus("Title must be at most 100 characters.", "error"); return; }
  try {
    submitBtn.disabled = true;
    setStatus("Creating note...", "loading");
    const response = await request(API_URL, {
      method: "POST",
      body: JSON.stringify({ title: title.trim(), body: body.trim(), userId: 1 })
    });
    const newNote = await response.json();
    if (notesList.querySelector(".empty-state")) notesList.innerHTML = "";
    const li = document.createElement("li");
    const h3 = document.createElement("h3"); h3.textContent = newNote.title;
    const p = document.createElement("p"); p.textContent = newNote.body || "";
    const small = document.createElement("small"); small.textContent = `ID: ${newNote.id} | User: ${newNote.userId}`;
    const delBtn = document.createElement("button"); delBtn.textContent="Delete"; delBtn.className="delete-btn";
    delBtn.addEventListener("click", () => deleteNote(newNote.id, li, delBtn));
    li.append(h3,p,small,delBtn);
    notesList.prepend(li);
    setStatus(`Note created (status ${response.status}, id ${newNote.id}).`, "success");
    noteForm.reset();
  } catch (error) {
    setStatus(`Failed to create note: ${error.message}`, "error");
  } finally {
    submitBtn.disabled = false;
  }
}
async function deleteNote(id, liElement, btn) {
  try {
    btn.disabled = true;
    setStatus(`Deleting note ${id}...`, "loading");
    const response = await request(`${API_URL}/${id}`, { method: "DELETE" });
    liElement.remove();
    if (notesList.children.length===0) renderNotes([]);
    setStatus(`Note ${id} deleted (status ${response.status}).`, "success");
  } catch (error) {
    setStatus(`Failed to delete note ${id}: ${error.message}`, "error");
    btn.disabled = false;
  }
}
loadBtn.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", (e) => { e.preventDefault(); createNote(titleInput.value, bodyInput.value); });
