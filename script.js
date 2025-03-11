function createTableFromObjects(data) {
    if (!data || data.length === 0) {
        return "No data to display.";
    }

    const table = document.createElement('table');
    const thead = table.createTHead();
    const tbody = table.createTBody();
    const headerRow = thead.insertRow();
    const headers = [
        { text: "Photo", key: "photo", sortable: false },
        { text: "Name", key: "name" },
        { text: "Title", key: "professionalTitle" },
        { text: "Email", key: "email" },
        { text: "Website", key: "website", sortable: false },
        { text: "Phone", key: "phone" },
        { text: "Address", key: "address" },
        { text: "Note", key: "note" },
        { text: "Research Area", key: "researchArea" },
        { text: "", key: "remove", sortable: false }
    ].map(header => {
        const th = document.createElement('th');

        const label = document.createElement('label');
        label.textContent = header.text;
        th.appendChild(label);
        const filterContainer = document.createElement('div');
        filterContainer.style.display = 'flex';
        filterContainer.style.flexDirection = 'column';
        th.appendChild(filterContainer);

        if (header.text === "Title") {
            const select = createTitleFilter(data);
            filterContainer.appendChild(select);
            select.addEventListener('change', () => filterTable(data));
        } else if (header.text === "Research Area") {
            th.style.whiteSpace = 'normal';
            const input = createResearchAreaFilter();
            filterContainer.appendChild(input);
            input.addEventListener('input', () => filterTable(data));
        } else if (header.text === "Note") {
            const input = createNoteFilter();
            filterContainer.appendChild(input);
            input.addEventListener('input', () => filterTable(data));
        } else if (header.text === "Name") {
            const input = createNameFilter();
            filterContainer.appendChild(input);
            input.addEventListener('input', () => filterTable(data));
        }
        headerRow.appendChild(th);
        return { th, key: header.key, sortable: header.sortable !== false };
    });

    populateTbody(tbody, data);

    headers.forEach(({ th, key, sortable }) => {
        if (!sortable) return;
        const labels = th.getElementsByTagName('label');
        const header = labels.length > 0 ? labels[0] : th;
        header.addEventListener('click', () => {
            const sortDirection = header.dataset.sortDirection || 'asc';
            const sortedData = data.sort((a, b) => {
                const valueA = getValueForSorting(a, key);
                const valueB = getValueForSorting(b, key);

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
    input.placeholder = "Filter...";
    return input;
}

function createNoteFilter() {
    const input = document.createElement('input');
    input.id = 'note-filter';
    input.type = 'text';
    input.placeholder = "Filter...";
    return input;
}

function createNameFilter() {
    const input = document.createElement('input');
    input.id = 'name-filter';
    input.type = 'text';
    input.placeholder = "Filter...";
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
    const nameFilter = document.getElementById('name-filter');
    const titleFilterValue = titleFilter?.value || "<all>";
    const researchFilterValue = new RegExp(researchFilter?.value, 'i') || /.*/;
    const noteFilterValue = new RegExp(noteFilter?.value, 'i') || /.*/;
    const nameFilterValue = new RegExp(nameFilter?.value, 'i') || /.*/;

    const filteredData = originalData.filter(person => {
        const titleMatch = titleFilterValue === "<all>" || ((person.professionalTitle || "") === titleFilterValue);
        const researchMatch = (person.researchArea || []).some(area => researchFilterValue.test(area));
        const noteMatch = noteFilterValue.test(person.note || '');
        const nameMatch = nameFilterValue.test(person.name || '');
        return titleMatch && researchMatch && noteMatch && nameMatch;
    });

    populateTbody(tbody, filteredData);
}

function populateTbody(tbody, data) {
    tbody.innerHTML = '';
    data.forEach((person, index) => {
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
        researchCell.style.whiteSpace = 'normal';

        (person.researchArea || []).forEach(area => {
            const span = document.createElement('span');
            span.textContent = area;
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
            }
        });
        removeCell.appendChild(removeButton);
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
    } catch (error) {
        console.error('Error saving file:', error);
    }
}

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', handleFileSelect);