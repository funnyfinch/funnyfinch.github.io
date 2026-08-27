const fs = require("fs");
const path = require("path");

const {
    render
} = require("./template");

const {
    buildNav
} = require("./nav");

const STATIC_DIRECTORIES = [
    "projects",
    "tutorials",
    "plugins"
];

function relativeUrl(
    targetPath,
    fromFile
) {
    let relative = path.relative(
        path.dirname(fromFile),
        targetPath
    );

    if (!relative) {
        relative = ".";
    }

    return relative.replaceAll(
        path.sep,
        "/"
    );
}

function buildPage({
    sourcePath,
    outputPath,
    siteRoot,
    outputRoot,
    currentPage
}) {
    const content =
        fs.readFileSync(
            sourcePath,
            "utf8"
        );

    const template =
        fs.readFileSync(
            path.join(
                siteRoot,
                "templates",
                "page.html"
            ),
            "utf8"
        );

    const root =
        relativeUrl(
            outputRoot,
            outputPath
        ) + "/";

    const nav =
        buildNav({
            siteRoot,
            root,
            currentPage
        });

    const html =
        render(
            template,
            {
                ROOT: root,
                MAIN_NAV: nav,
                SUB_NAV: "",
                CONTENT: content,
                TITLE: currentPage,
                DESCRIPTION: ""
            }
        );

    fs.mkdirSync(
        path.dirname(outputPath),
        {
            recursive: true
        }
    );

    fs.writeFileSync(
        outputPath,
        html
    );
}

function copyDirectory({
    source,
    destination,
    siteRoot,
    outputRoot,
    currentPage
}) {
    for (
        const entry of fs.readdirSync(
            source,
            { withFileTypes: true }
        )
    ) {
        const sourcePath =
            path.join(
                source,
                entry.name
            );

        const destinationPath =
            path.join(
                destination,
                entry.name
            );

        if (entry.isDirectory()) {
            copyDirectory({
                source: sourcePath,
                destination: destinationPath,
                siteRoot,
                outputRoot,
                currentPage
            });

            continue;
        }

        if (
            !entry.name.endsWith(".html")
        ) {
            continue;
        }

        buildPage({
            sourcePath,
            outputPath: destinationPath,
            siteRoot,
            outputRoot,
            currentPage
        });
    }
}

module.exports = {
    name: "static pages",

    order: 20,

    build({
        siteRoot,
        outputRoot
    }) {
        for (
            const directory
            of STATIC_DIRECTORIES
        ) {
            const source =
                path.join(
                    siteRoot,
                    directory
                );

            if (!fs.existsSync(source)) {
                continue;
            }

            copyDirectory({
                source,
                destination:
                    path.join(
                        outputRoot,
                        directory
                    ),
                siteRoot,
                outputRoot,
                currentPage: directory
            });
        }
    }
};