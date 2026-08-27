const fs = require("fs");
const path = require("path");

const {
    render
} = require("./template");

const {
    buildNav
} = require("./nav");

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

module.exports = {
    name: "pages",

    order: 10,

    build({
        siteRoot,
        outputRoot
    }) {
        const sourcePath =
            path.join(
                siteRoot,
                "index.html"
            );

        const outputPath =
            path.join(
                outputRoot,
                "index.html"
            );

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
                currentPage: "home"
            });

        const html =
            render(
                template,
                {
                    ROOT: root,
                    TITLE: "finch",
                    DESCRIPTION:
                        "Builder of compact systems, helpful tools, and readable docs.",
                    MAIN_NAV: nav,
                    SUB_NAV: "",
                    CONTENT: content
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
};