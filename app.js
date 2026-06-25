(function () {

    // =============================
    // STORAGE
    // =============================

    const STORAGE_KEY = "notas_paz_v1";

    let data = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!data) {
        data = {
            notes: [],
            history: []
        };
    }

    // =============================
    // ELEMENTOS UI
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

    let editingIndex = null;
    let activeTab = "notes";

    // =============================
    // SAVE
    // =============================

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // =============================
    // OPEN / CLOSE MODAL
    // =============================

    function openModal(note = null, index = null) {
        modal.classList.remove("hidden");

        if (note) {
            noteText.value = note.text;
            categoryInput.value = note.category;
            statusInput.value = note.status;
            editingIndex = index;
        } else {
            noteText.value = "";
            categoryInput.value = "";
            statusInput.value = "";
            editingIndex = null;
        }
    }

    function closeModal() {
        modal.classList.add("hidden");
    }

    // =============================
    // ADD HISTORY ENTRY
    // =============================

    function addHistory(action, note) {
        data.history.unshift({
            action,
            note: JSON.parse(JSON.stringify(note)),
            date: new Date().toISOString()
        });
    }

    // =============================
    // CREATE / UPDATE NOTE
    // =============================

    function saveNote() {

        const note = {
            text: noteText.value,
            category: categoryInput.value || "sin categoría",
            status: statusInput.value || "pendiente",
            date: new Date().toISOString(),
            completed: false
        };

        if (editingIndex !== null) {

            const old = data.notes[editingIndex];

            addHistory("edit", {
                before: old,
                after: note
            });

            data.notes[editingIndex] = note;

        } else {

            data.notes.unshift(note);

            addHistory("create", note);
        }

        save();
        closeModal();
        render();
    }

    // =============================
    // GROUP BY DATE
    // =============================

    function groupByDate(notes) {

        const groups = {};

        notes.forEach(n => {

            const date = new Date(n.date).toLocaleDateString();

            if (!groups[date]) groups[date] = [];

            groups[date].push(n);
        });

        return groups;
    }

    // =============================
    // RENDER NOTES
    // =============================

    function renderNotes() {

        notesContainer.innerHTML = "";

        const filtered = filterNotes(data.notes);
        const grouped = groupByDate(filtered);

        Object.keys(grouped).forEach(date => {

            const title = document.createElement("div");
            title.className = "dateTitle";
            title.textContent = date;

            notesContainer.appendChild(title);

            grouped[date].forEach((note, index) => {

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

                // EDIT
                card.querySelector(".editBtn").onclick = () => {
                    openModal(note, index);
                };

                // COMPLETE
                card.querySelector(".completeBtn").onclick = () => {
                    note.status = "completado";
                    note.completed = true;

                    addHistory("complete", note);

                    save();
                    render();
                };

                // DELETE
                card.querySelector(".deleteBtn").onclick = () => {

                    addHistory("delete", note);

                    data.notes = data.notes.filter(n => n !== note);

                    save();
                    render();
                };

                notesContainer.appendChild(card);
            });
        });
    }

    // =============================
    // FILTER
    // =============================

    function filterNotes(notes) {

        const q = searchInput.value.toLowerCase();

        if (!q) return notes;

        return notes.filter(n =>
            n.text.toLowerCase().includes(q) ||
            n.category.toLowerCase().includes(q) ||
            n.status.toLowerCase().includes(q)
        );
    }

    // =============================
    // RENDER HISTORY
    // =============================

    function renderHistory() {

        historyContainer.innerHTML = "";

        data.history.forEach(h => {

            const div = document.createElement("div");
            div.className = "historyItem";

            div.innerHTML = `
                <strong>${h.action}</strong><br>
                <small>${new Date(h.date).toLocaleString()}</small>
                <pre>${JSON.stringify(h.note, null, 2)}</pre>
            `;

            historyContainer.appendChild(div);
        });
    }

    // =============================
    // TAB SYSTEM
    // =============================

    function switchTab(tab) {

        activeTab = tab;

        if (tab === "notes") {
            notesContainer.style.display = "block";
            historyContainer.style.display = "none";
            notesTab.classList.add("active");
            historyTab.classList.remove("active");
        } else {
            notesContainer.style.display = "none";
            historyContainer.style.display = "block";
            notesTab.classList.remove("active");
            historyTab.classList.add("active");
        }
    }

    // =============================
    // RENDER ALL
    // =============================

    function render() {
        renderNotes();
        renderHistory();
    }

    // =============================
    // EVENTS
    // =============================

    newNoteBtn.onclick = () => openModal();

    cancelBtn.onclick = closeModal;

    saveBtn.onclick = saveNote;

    searchInput.oninput = renderNotes;

    notesTab.onclick = () => switchTab("notes");

    historyTab.onclick = () => switchTab("history");

    // =============================
    // INIT
    // =============================

    switchTab("notes");
    render();

})();