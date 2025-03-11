function createTableFromObjects(data) {
    if (!data || data.length === 0) {
        return "No data to display."; 
    }

    const table = document.createElement('table');
    const thead = table.createTHead();
    const tbody = table.createTBody();
    const headerRow = thead.insertRow();

    const headers = ["Name", "Title", "Email", "Website", "Phone", "Address", "Research Area"].map(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
        return th; 
    });

    function populateTbody(data) {
        tbody.innerHTML = '';
    data.forEach(person => {
        const row = tbody.insertRow();

        const nameCell = row.insertCell();
        const nameLink = document.createElement('a');
            nameLink.href = person.profileLink || "#"; 
            nameLink.textContent = person.name || "";
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
             websiteLink.href = person.contact.website;
                websiteLink.textContent = "Website";
             websiteCell.appendChild(websiteLink);
        }

            row.insertCell().textContent = person.contact && person.contact.phone || ""; //check that contact and phone exists
            row.insertCell().textContent = person.contact && person.contact.address || ""; //check that contact and address exists


        const researchCell = row.insertCell();
            researchCell.classList.add("research-tags");

            (person.researchArea || []).forEach(area => {
            const span = document.createElement('span');
            span.textContent = area;
            researchCell.appendChild(span);
        });
    });
    }

    populateTbody(data);

    headers.forEach((header, columnIndex) => {
        header.addEventListener('click', () => {
           const sortDirection = header.dataset.sortDirection || 'asc';
            const sortedData = [...data].sort((a, b) => {
                const valueA = getValueForSorting(a, columnIndex);
                const valueB = getValueForSorting(b, columnIndex);

                // Correct sorting logic
                 if (valueA < valueB) {
                    return sortDirection === 'asc' ? -1 : 1;
                }
                if (valueA > valueB) {
                    return sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });

            populateTbody(sortedData);
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
            return person.contact && person.contact.email || ''; //check that contact and email exists
        case 3:
            return person.contact && person.contact.website || '';  //check that contact and website exists
        case 4:
            return person.contact && person.contact.phone || '';  //check that contact and phone exists
        case 5:
            return person.contact && person.contact.address || '';  //check that contact and address exists
        case 6:
            return person.researchArea ? person.researchArea.join(', ') : ''; // Handle researchArea potentially being null or undefined
        default:
            return '';
    }
}


function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            const table = createTableFromObjects(data);
            const tableContainer = document.getElementById('table-container');
            tableContainer.appendChild(table);
        } catch (error) {
            console.error("Error parsing JSON:", error);
             const tableContainer = document.getElementById('table-container');
            tableContainer.innerHTML = "<p>Error parsing the JSON file.</p>";
        }

    };

    reader.readAsText(file);
}



// Example usage (assuming file input is how you're loading data)
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', handleFileSelect);