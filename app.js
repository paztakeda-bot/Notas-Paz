import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://tcegyyzqzvzmvnjhrjup.supabase.co",
  "sb_publishable_bUlnNauZAHkzZWtkNbKGmQ_WHnp2zJw"
);

// =============================
// STATE
// =============================
let notes = [];
let history = [];
let editingId = null;

// =============================
// UI ELEMENTS
// =============================
const notesContainer = document.getElementById("notesContainer");
const historyContainer = document.getElementById("historyContainer");

const newNoteBtn = document.getElementById("newNoteBtn");
const modal = document.getElementById("modal");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");

const noteText = document.getElementById("noteText");
const categoryInput = document.getElementById("categoryInput");
const statusInput = document.getElementById("statusInput");

const searchInput = document.getElementById("searchInput");

const notesTab = document.getElementById("notesTab");
const historyTab = document.getElementById("historyTab");

// =============================
// LOAD NOTES
// =============================
async function loadNotes() {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error) {
    notes = data;
    renderNotes();
  } else {
    console.error(error);
  }
}

// =============================
// SAVE NOTE (CREATE / UPDATE)
// =============================
async function saveNote() {
  const note = {
    text: noteText.value,
    category: categoryInput.value || "sin categoría",
    status: statusInput.value || "pendiente",
  };

  if (editingId) {
    await supabase.from("notes").update(note).eq("id", editingId);
  } else {
    await supabase.from("notes").insert([note]);
  }

  closeModal();
  await loadNotes();
}

// =============================
// DELETE
// =============================
async function deleteNote(id) {
  await supabase.from("notes").delete().eq("id", id);
  await loadNotes();
}

// =============================
// UPDATE STATUS
// =============================
async function completeNote(id) {
  await supabase
    .from("notes")
    .update({ status: "completado" })
    .eq("id", id);

  await loadNotes();
}

// =============================
// RENDER NOTES
// =============================
function renderNotes() {
  const q = searchInput.value?.toLowerCase() || "";

  const filtered = notes.filter(n =>
    n.text.toLowerCase().includes(q) ||
    n.category.toLowerCase().includes(q) ||
    n.status.toLowerCase().includes(q)
  );

  notesContainer.innerHTML = "";

  filtered.forEach(note => {
    const card = document.createElement("div");
    card.className = "noteCard";

    card.innerHTML = `
      <div class="noteText">${note.text}</div>

      <div class="tags">
        <span class="category">${note.category}</span>
        <span class="status">${note.status}</span>
      </div>

      <div class="buttons">
        <button class="editBtn">Editar</button>
        <button class="completeBtn">Completar</button>
        <button class="deleteBtn">Eliminar</button>
      </div>
    `;

    card.querySelector(".editBtn").onclick = () => {
      editingId = note.id;
      openModal(note);
    };

    card.querySelector(".completeBtn").onclick = () => {
      completeNote(note.id);
    };

    card.querySelector(".deleteBtn").onclick = () => {
      deleteNote(note.id);
    };

    notesContainer.appendChild(card);
  });
}

// =============================
// MODAL
// =============================
function openModal(note = null) {
  modal.classList.remove("hidden");

  if (note) {
    noteText.value = note.text;
    categoryInput.value = note.category;
    statusInput.value = note.status;
  } else {
    noteText.value = "";
    categoryInput.value = "";
    statusInput.value = "";
    editingId = null;
  }
}

function closeModal() {
  modal.classList.add("hidden");
}

// =============================
// EVENTS
// =============================
newNoteBtn.onclick = () => openModal();
cancelBtn.onclick = closeModal;
saveBtn.onclick = saveNote;
searchInput.oninput = renderNotes;

// =============================
// INIT
// =============================
loadNotes();