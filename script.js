function createTableFromObjects(data) {
    if (!data || data.length === 0) {
        return "No data to display.";
    }

    const table = document.createElement('table');
    const thead = table.createTHead();
    const tbody = table.createTBody();
    const headerRow = thead.insertRow();

    const headers = ["Name", "Title", "Email", "Website", "Phone", "Address", "Note", "Research Area"].map(headerText => {
        const th = document.createElement('th');

        if (headerText === "Title") {
            const label = document.createElement('label');
            label.textContent = headerText;
            th.appendChild(label);
            const select = createTitleFilter(data);
            th.appendChild(select);
            select.addEventListener('change', () => filterTable(data));
        } else if (headerText === "Research Area") {
            const label = document.createElement('label');
            label.textContent = headerText;
            th.appendChild(label);
            const input = createResearchAreaFilter();
            th.appendChild(input);
            input.addEventListener('input', () => filterTable(data));
        } else if (headerText === "Note") {
            const label = document.createElement('label');
            label.textContent = headerText;
            th.appendChild(label);
            const input = createNoteFilter();
            th.appendChild(input);
            input.addEventListener('input', () => filterTable(data));
        } else {
            th.textContent = headerText;
        }
        headerRow.appendChild(th);
        return th;
    });

    populateTbody(tbody, data);

    headers.forEach((header, columnIndex) => {
        const labels = header.getElementsByTagName('label');
        if(labels.length > 0) {
            header = labels[0];
        }
        header.addEventListener('click', () => {
            const sortDirection = header.dataset.sortDirection || 'asc';
            const sortedData = [...data].sort((a, b) => {
                const valueA = getValueForSorting(a, columnIndex);
                const valueB = getValueForSorting(b, columnIndex);

                if (valueA < valueB) {
                    return sortDirection === 'asc' ? -1 : 1;
                }
                if (valueA > valueB) {
                    return sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });

            populateTbody(tbody, sortedData);
            header.dataset.sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

        });
    });

    return table;
}

function getValueForSorting(person, columnIndex) {
    switch (columnIndex) {
        case 0:
            return person.name ? person.name.toLowerCase() : '';
        case 1:
            return person.professionalTitle || '';
        case 2:
            return person.contact && person.contact.email || '';
        case 3:
            return person.contact && person.contact.website || '';
        case 4:
            return person.contact && person.contact.phone || '';
        case 5:
            return person.contact && person.contact.address || '';
        case 6:
            return person.researchArea ? person.researchArea.join(', ') : '';
        case 7:
            return person.note || '';
        default:
            return '';
    }
}

function createTitleFilter(data) {
    const select = document.createElement('select');
    select.id = 'title-filter';
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
    const input = document.createElement('input');
    input.id = 'research-filter';
    input.type = 'text';
    input.placeholder = "Filter..."; // Shorter placeholder
    return input;
}

function createNoteFilter() {
    const input = document.createElement('input');
    input.id = 'note-filter';
    input.type = 'text';
    input.placeholder = "Filter..."; // Shorter placeholder
    return input;
}

function filterTable(originalData) {
    const tableContainer = document.getElementById('table-container')
    const table = tableContainer.querySelector('table')

    if (!table) {
        return;
    }
    const tbody = table.querySelector('tbody')

    const titleFilter = document.getElementById('title-filter'); 
    const researchFilter = document.getElementById('research-filter');
    const noteFilter = document.getElementById('note-filter');
    const titleFilterValue = titleFilter?.value || "<all>";
    const researchFilterValue = new RegExp(researchFilter?.value, 'i') || /.*/;
    const noteFilterValue = new RegExp(noteFilter?.value, 'i') || /.*/;

    const filteredData = originalData.filter(person => {
        const titleMatch = titleFilterValue === "<all>" || ((person.professionalTitle || "") === titleFilterValue);
        const researchMatch = (person.researchArea || []).some(area => researchFilterValue.test(area));
        const noteMatch = noteFilterValue.test(person.note || '');
        return titleMatch && researchMatch && noteMatch;
    });

    populateTbody(tbody, filteredData);
}

function populateTbody(tbody, data) {
    tbody.innerHTML = '';
    data.forEach(person => {
        const row = tbody.insertRow();

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
        const noteInput = document.createElement('input');
        noteInput.type = 'text';
        noteInput.value = person.note || "";
        noteInput.addEventListener('input', (event) => {
            person.note = event.target.value;
        });
        noteCell.appendChild(noteInput);

        const researchCell = row.insertCell();
        researchCell.classList.add("research-tags");

        (person.researchArea || []).forEach(area => {
            const span = document.createElement('span');
            span.textContent = area;
            researchCell.appendChild(span);
        });
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const fileInput = event.target;
    const tableContainer = document.getElementById('table-container');
    const saveButton = document.getElementById('saveButton');

    reader.onload = (e) => {
        var data;
        try {
            data = JSON.parse(e.target.result);
        } catch (error) {
            console.error("Error parsing JSON:", error);
            tableContainer.innerHTML = "<p>Error parsing the JSON file.</p>";
            fileInput.value = '';
            return;
        }
        const table = createTableFromObjects(data);
        tableContainer.appendChild(table);
        fileInput.style.display = 'none';
        saveButton.style.display = 'block';
        saveButton.addEventListener('click', () => saveData(data));
    };

    reader.readAsText(file);
}

function saveData(data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'updated_data.json';
    a.click();
    URL.revokeObjectURL(url);
}

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', handleFileSelect);