function parseHTML(doc) {
    return Array.from(doc.querySelectorAll('.view-content article.node-person'), parseArticle);
}

function parseArticle(article) {
    const person = {};
    const nameLink = article.querySelector('header h2 a');
    person.name = nameLink?.textContent.trim() ?? null;
    person.profileLink = nameLink?.href ?? null;
    const photoImg = article.querySelector('.field-name-field-person-photo img');
    person.photo = photoImg?.src ?? null;
    const professionalTitle = article.querySelector('.field-name-field-professional-title .field-item');
    person.professionalTitle = professionalTitle?.textContent.trim() ?? null;
    person.contact = parseContactInfo(article);
    person.researchArea = parseResearchArea(article);
    return person;
}

function parseContactInfo(article) {
    const contact = {};
    const contactInfoFields = article.querySelectorAll('.group-personal-information .field');
    contactInfoFields.forEach(field => {
        const fieldType = field.classList[1];
        const valueElement = field.querySelector('.field-item a');
        let value = null;
        if (fieldType.includes("field-website")) {
            value = valueElement?.href ?? null;
        } else if (fieldType.includes("field-phone")) {
            value = valueElement?.href.replace("tel:", "") ?? null;
        } else if (fieldType.includes("field-address")) {
            value = field.querySelector('.field-item')?.textContent.trim() ?? null;
        } else {
            value = valueElement?.textContent.trim() ?? null;
        }
        if (value) {
            const contactType = fieldType.replace('field-name-', '').replace('field-', '');
            contact[contactType] = value;
        }
    });
    return contact;
}

function parseResearchArea(article) {
    const bodyField = article.querySelector('.field-name-body .field-item');
    const researchText = bodyField?.textContent.trim().replace(/<strong>|<\/strong>/g, '') ?? null;
    return researchText?.split(/[,.]/).map(item => item.trim()).filter(item => item !== "") || [];
}