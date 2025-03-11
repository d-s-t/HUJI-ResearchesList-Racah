function createTableFromObjects(data) {
    if (!data || data.length === 0) {
        return "No data to display."; // Or an empty table element, if you prefer
    }

    const table = document.createElement('table');
    const thead = table.createTHead();
    const tbody = table.createTBody();
    const headerRow = thead.insertRow();

    // Header cells
    ["Name", "Title", "Email", "Website", "Phone", "Address", "Research Area"].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    // Data rows
    data.forEach(person => {
        const row = tbody.insertRow();

        // Name with link
        const nameCell = row.insertCell();
        const nameLink = document.createElement('a');
        nameLink.href = person.profileLink || "#"; // Handle missing profile link
        nameLink.textContent = person.name || ""; // Handle missing name
        nameCell.appendChild(nameLink);



        //Other cells:
        row.insertCell().textContent = person.professionalTitle || "";
        const emailCell = row.insertCell()
        if(person.contact.email) {
             const emailLink = document.createElement('a');
             emailLink.href = `mailto:${person.contact.email}`;
             emailLink.textContent = person.contact.email;
             emailCell.appendChild(emailLink);
        }


        const websiteCell = row.insertCell()
        if(person.contact.website) {
             const websiteLink = document.createElement('a');
             websiteLink.href = person.contact.website;
             websiteLink.textContent =  "Website"; // Or the full URL if you prefer
             websiteCell.appendChild(websiteLink);
        }

        row.insertCell().textContent = person.contact.phone || "";
        row.insertCell().textContent = person.contact.address || "";


        // Research Area (as spans within a cell)
        const researchCell = row.insertCell();
        researchCell.classList.add("research-tags"); // Add class for styling if needed

        (person.researchArea || []).forEach(area => { // Handles the case where researchArea is null or undefined
            const span = document.createElement('span');
            span.textContent = area;
            researchCell.appendChild(span);
        });
    });


    return table;
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