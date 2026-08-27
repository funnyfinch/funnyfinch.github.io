function render(template, values) {
    let result = template;

    for (const [key, value] of Object.entries(values)) {
        result = result.replaceAll(
            `{{${key}}}`,
            value ?? ""
        );
    }

    return result;
}

module.exports = {
    render
};