let isDirty = false;


window.addEventListener('beforeunload', (event) => {
    if (isDirty) {
        event.preventDefault();
    }
});

window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 's' && isDirty) {
        event.preventDefault();
        const saveButton = document.getElementById('saveButton');
        if (saveButton && saveButton.style.display !== 'none') {
            saveButton.click();
        }
    }
});

function markDirty() {
    isDirty = true;
    if (!document.title.startsWith('• ')) {
        document.title = '• ' + document.title;
    }
}

function markClean() {
    isDirty = false;
    if (document.title.startsWith('• ')) {
        document.title = document.title.substring(2);
    }
}

function createTableFromObjects(data) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = '';
    dropZone.style.display = 'none';
    
    const saveButton = document.getElementById('saveButton');
    saveButton.style.display = 'block';
    saveButton.addEventListener('click', () => {
        saveData(data);
    });

    if (!data || data.length === 0) {
        tableContainer.innerHTML = "No data to display.";
    }
    
    const table = document.createElement('table');
    tableContainer.appendChild(table);
    const thead = table.createTHead();
    const tbody = table.createTBody();
    const headerRow = thead.insertRow();
    [
        { text: "Photo", key: "photo", sortable: false },
        { text: "Name", key: "name", filter: () => createNameFilter() },
        { text: "Title", key: "professionalTitle", filter: () => createTitleFilter(data) },
        { text: "Email", key: "email" },
        { text: "Website", key: "website" },
        { text: "Phone", key: "phone" },
        { text: "Address", key: "address" },
        { text: "Note", key: "note", filter: () => createNoteFilter() },
        { text: "Research Area", key: "researchArea", filter: () => createResearchAreaFilter() },
        { text: "", key: "remove", sortable: false }
    ].map(header => {
        const th = document.createElement('th');

        const label = document.createElement('label');
        label.textContent = header.text;
        th.appendChild(label);
        if (header.filter) {
            const filterContainer = document.createElement('div');
            filterContainer.style.display = 'flex';
            filterContainer.style.flexDirection = 'column';
            th.appendChild(filterContainer);
            const filter = header.filter();
            filterContainer.appendChild(filter);
            filter.addEventListener('change', () => populateTbody(tbody, data));
            filter.addEventListener('input', () => populateTbody(tbody, data));
        }
        headerRow.appendChild(th);
        if (header.sortable !== false) {
            label.addEventListener('click', () => {
                const sortDirection = label.dataset.sortDirection || 'asc';
                const sortedData = data.sort((a, b) => {
                    const valueA = getValueForSorting(a, header.key);
                    const valueB = getValueForSorting(b, header.key);
    
                    if (valueA < valueB) {
                        return sortDirection === 'asc' ? -1 : 1;
                    }
                    if (valueA > valueB) {
                        return sortDirection === 'asc' ? 1 : -1;
                    }
                    return 0;
                });
    
                populateTbody(tbody, sortedData);
                label.dataset.sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            });
        }
        return { th, key: header.key};
    });

    populateTbody(tbody, data);

    return table;
}

function getValueForSorting(person, key) {
    switch (key) {
        case "name":
            return person.name ? person.name.toLowerCase() : '';
        case "professionalTitle":
            return person.professionalTitle || '';
        case "email":
            return person.contact && person.contact.email || '';
        case "website":
            return person.contact && person.contact.website || '';
        case "phone":
            return person.contact && person.contact.phone || '';
        case "address":
            return person.contact && person.contact.address || '';
        case "note":
            return person.note || '';
        case "researchArea":
            return person.researchArea ? person.researchArea.join(', ') : '';
        default:
            return '';
    }
}

function createTitleFilter(data) {
    const select = document.createElement('select');
    select.id = 'title-filter';
    select.classList.add('filter');
    const uniqueTitles = [...new Set(data.map(person => person.professionalTitle || ""))];
    const allOption = document.createElement('option');
    allOption.value = "<all>";
    allOption.textContent = "All";
    select.appendChild(allOption);
    uniqueTitles.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        option.textContent = title;
        select.appendChild(option);
    });
    return select;
}

function createResearchAreaFilter() {
    return createTextFilter('research-filter');
}

function createNoteFilter() {
    return createTextFilter('note-filter');
}

function createNameFilter() {
    return createTextFilter('name-filter');
}

function createTextFilter(id){
    const input = document.createElement('input');
    input.id = id;
    input.type = 'text';
    input.placeholder = "Filter...";
    input.classList.add('filter');
    return input;
}

function filterTable(originalData) {
    const titleFilter = document.getElementById('title-filter'); 
    const researchFilter = document.getElementById('research-filter');
    const noteFilter = document.getElementById('note-filter');
    const nameFilter = document.getElementById('name-filter');
    const titleFilterValue = titleFilter ? titleFilter.value : "<all>";
    const researchFilterValue = new RegExp(researchFilter?.value, 'i') || /.*/;
    const noteFilterValue = new RegExp(noteFilter?.value, 'i') || /.*/;
    const nameFilterValue = new RegExp(nameFilter?.value, 'i') || /.*/;

    const filteredData = originalData.filter(person => {
        const titleMatch = titleFilterValue === "<all>" || ((person.professionalTitle || "") === titleFilterValue);
        const researchMatch = !researchFilter?.value || (person.researchArea || []).some(area => researchFilterValue.test(area));
        const noteMatch = noteFilterValue.test(person.note || '');
        const nameMatch = nameFilterValue.test(person.name || '');
        return titleMatch && researchMatch && noteMatch && nameMatch;
    });
    return filteredData;
}

function populateTbody(tbody, data) {
    tbody.innerHTML = '';
    filterTable(data).forEach((person, index) => {
        const row = tbody.insertRow();

        const photoCell = row.insertCell();
        if (person.photo){
            const photoImg = document.createElement('img');
            photoImg.src = person.photo;
            photoImg.alt = person.name || "";
            photoImg.width = 50;
            photoCell.appendChild(photoImg);
        }

        const nameCell = row.insertCell();
        const nameLink = document.createElement('a');
        nameLink.target = '_blank';
        nameLink.href = person.profileLink || "#";
        nameLink.textContent = person.name || "-";
        nameCell.appendChild(nameLink);

        row.insertCell().textContent = person.professionalTitle || "";

        const emailCell = row.insertCell();
        if (person.contact && person.contact.email) {
            const emailLink = document.createElement('a');
            emailLink.target = '_blank';
            emailLink.href = `mailto:${person.contact.email}`;
            emailLink.textContent = person.contact.email;
            emailCell.appendChild(emailLink);
        }

        const websiteCell = row.insertCell();
        if (person.contact && person.contact.website) {
            const websiteLink = document.createElement('a');
            websiteLink.target = '_blank';
            websiteLink.href = person.contact.website;
            websiteLink.textContent = "Website";
            websiteCell.appendChild(websiteLink);
        }

        row.insertCell().textContent = person.contact && person.contact.phone || "";
        row.insertCell().textContent = person.contact && person.contact.address || "";

        const noteCell = row.insertCell();
        const noteSpan = document.createElement('span');
        noteSpan.textContent = person.note || "";
        noteSpan.classList.add('note-span');
        noteSpan.title = "Click to edit";
        noteSpan.addEventListener('click', () => openNoteEditor(person, noteSpan));
        noteCell.appendChild(noteSpan);

        const researchCell = row.insertCell();
        researchCell.classList.add("research-tags");
        researchCell.style.whiteSpace = 'normal';

        (person.researchArea || []).forEach(area => {
            const span = document.createElement('span');
            span.textContent = area;
            span.addEventListener('click', () => {
                const researchFilter = document.getElementById('research-filter');
                if (researchFilter) {
                    researchFilter.value = area;
                    populateTbody(tbody, data);
                }
            });
            researchCell.appendChild(span);
        });

        const removeCell = row.insertCell();
        const removeButton = document.createElement('span');
        removeButton.innerHTML = "&#10060;";
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', () => {
            if (confirm("Are you sure you want to remove this entry?")) {
                data.splice(index, 1);
                populateTbody(tbody, data);
                markDirty();
            }
        });
        removeCell.appendChild(removeButton);
    });
}

function reshapeEditor(editor) {
    const style = getComputedStyle(editor);
    let paddingW = parseInt(style.paddingLeft) + parseInt(style.paddingRight);
    let width = parseInt(style.width);
    let paddingH = parseInt(style.paddingTop) + parseInt(style.paddingBottom);
    let height = parseInt(style.height);
    editor.style.width = '10px';
    let newWidth = editor.scrollWidth;
    if (newWidth > width + paddingW) {
        editor.style.width = newWidth + 'px';
    }
    else {
        editor.style.width = width + 'px';
    }
    editor.style.height = '10px';
    let newHeight = editor.scrollHeight;
    if (newHeight >= height + paddingH) {
        editor.style.height = newHeight + 'px';
    }
    else {
        editor.style.height = height + 'px';
    }
}

function openNoteEditor(person, noteSpan) {
    const editor = document.createElement('textarea');
    editor.classList.add('note-editor');
    editor.addEventListener('input', ()=>reshapeEditor(editor));
    editor.value = person.note || '';
    document.body.appendChild(editor);
    reshapeEditor(editor);
    
    const rect = noteSpan.getBoundingClientRect();
    editor.style.top = `${rect.top + window.scrollY}px`;
    editor.style.left = `${rect.left + window.scrollX}px`;

    let editorClosed = false;

    const closeEditor = (save=true) => {
        if (editorClosed) return;
        editorClosed = true;

        const newNote = editor.value.trim();
        if (save && (person.note !== newNote)) {
            noteSpan.textContent = person.note = newNote;
            markDirty();
        }
        document.body.removeChild(editor);
        document.removeEventListener('keydown', handleKeyDown);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            closeEditor(false);
        } else if (event.ctrlKey && event.key === 'Enter') {
            closeEditor();
        }
    };

    // editor.addEventListener('blur', closeEditor);
    document.addEventListener('keydown', handleKeyDown);

    editor.focus();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        var data;
        try {
            data = JSON.parse(e.target.result);
        } catch (error) {
            console.error("Error parsing JSON:", error);
            document.getElementById('table-container').innerHTML = "<p>Error parsing the JSON file.</p>";
            fileInput.value = '';
            return;
        }
        createTableFromObjects(data);
    };

    reader.readAsText(file);
}

async function saveData(data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    const options = {
        types: [
            {
                description: 'JSON Files',
                accept: { 'application/json': ['.json'] },
            },
        ],
    };

    try {
        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        markClean();
    } catch (error) {
        console.error('Error saving file:', error);
    }
}

async function addPresets() {
    const presets = [
        { url: 'racah.json', name: 'Racah Researches' }
        // Add more presets here if needed
    ];

    let hasPresets = false;
    const presetList = document.getElementById('preset-list');
    presetList.innerHTML = ''; // Clear existing items

    for (const preset of presets) {
        try {
            const response = await fetch(preset.url, { method: 'HEAD' });
            if (response.ok) {
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = preset.name;
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    loadPresetData(preset.url);
                });
                listItem.appendChild(link);
                presetList.appendChild(listItem);
                hasPresets = true;
            }
        } catch (error) {
            console.error(`Error checking preset file (${preset.name}):`, error);
        }
    }

    const presetSection = document.querySelector('.preset');
    const separator = document.querySelector('.separator');
    if (hasPresets) {
        presetSection.style.display = 'block';
        separator.style.display = 'block';
    } else {
        presetSection.style.display = 'none';
        separator.style.display = 'none';
    }
}

async function loadPresetData(url) {
    var data
    try {
        const response = await fetch(url);
        data = await response.json();
    } catch (error) {
        console.error(`Error loading preset data from ${url}:`, error);
    }
    createTableFromObjects(data);
}

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', handleFileSelect);

const dropZone = document.getElementById('drop-zone');
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    if (file) {
        handleFileSelect({ target: { files: [file] } });
    }
});

document.addEventListener('DOMContentLoaded', addPresets);

dropZone.style.display = 'flex';