const fs = require("fs");
const path = require("path");

const {
    render
} = require("./template");

function buildSubnav(
    siteRoot,
    project,
    currentFile
) {
    if (!project) {
        return "";
    }

    const template = fs.readFileSync(
        path.join(
            siteRoot,
            "templates",
            "subnav.html"
        ),
        "utf8"
    );

    const projectRoot = path.resolve(
        siteRoot,
        "." + project.root
    );

    const links = project.navigation
        .map((item) => {
            const target = path.resolve(
                siteRoot,
                "." + project.root,
                item.href
            );

            const href = path
                .relative(
                    path.dirname(currentFile),
                    target
                )
                .replaceAll(
                    path.sep,
                    "/"
                );

            return `
                <a
                    class="subnav__link"
                    href="${href}"
                >
                    ${item.label}
                </a>
            `;
        })
        .join("\n");

    const projectHref = path
        .relative(
            path.dirname(currentFile),
            projectRoot
        )
        .replaceAll(
            path.sep,
            "/"
        );

    return render(
        template,
        {
            PROJECT_NAME: project.name,
            PROJECT_ROOT: projectHref,
            LINKS: links
        }
    );
}

module.exports = {
    buildSubnav
};