const fs = require("fs");
const path = require("path");

const {
    render
} = require("./template");

function buildNav({
    siteRoot,
    root,
    currentPage
}) {
    const template = fs.readFileSync(
        path.join(
            siteRoot,
            "templates",
            "nav.html"
        ),
        "utf8"
    );

    return render(
        template,
        {
            ROOT: root,

            HOME_CURRENT:
                currentPage === "home"
                    ? 'aria-current="page"'
                    : "",

            PROJECTS_CURRENT:
                currentPage === "projects"
                    ? 'aria-current="page"'
                    : "",

            TUTORIALS_CURRENT:
                currentPage === "tutorials"
                    ? 'aria-current="page"'
                    : "",

            PLUGINS_CURRENT:
                currentPage === "plugins"
                    ? 'aria-current="page"'
                    : ""
        }
    );
}

module.exports = {
    buildNav
};