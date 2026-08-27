const fs = require("fs");
const path = require("path");

function relativeUrl(targetPath, fromFile) {
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

function siteUrlToRelativeUrl(
    siteUrl,
    outputRoot,
    fromFile
) {
    const targetPath = path.resolve(
        outputRoot,
        siteUrl
    );

    return relativeUrl(
        targetPath,
        fromFile
    );
}

function buildProject({
    projectDir,
    outputRoot,
    siteRoot
}) {
    const projectConfigPath = path.join(
        projectDir,
        "project.json"
    );

    if (!fs.existsSync(projectConfigPath)) {
        return;
    }

    const project = JSON.parse(
        fs.readFileSync(
            projectConfigPath,
            "utf8"
        )
    );

    const sourcePath = path.join(
        projectDir,
        "index.html"
    );

    if (!fs.existsSync(sourcePath)) {
        return;
    }

    const template = fs.readFileSync(
        path.join(
            siteRoot,
            "templates",
            "page.html"
        ),
        "utf8"
    );

    const mainNavTemplate = fs.readFileSync(
        path.join(
            siteRoot,
            "templates",
            "nav.html"
        ),
        "utf8"
    );

    const subNavTemplate = fs.readFileSync(
        path.join(
            siteRoot,
            "templates",
            "subnav.html"
        ),
        "utf8"
    );

    const relativeProjectPath =
        path.relative(
            siteRoot,
            projectDir
        );

    const outputDir = path.join(
        outputRoot,
        relativeProjectPath
    );

    const outputPath = path.join(
        outputDir,
        "index.html"
    );

    /*
     * URL from this generated page back
     * to the root of the site.
     *
     * Example:
     *
     * _site/flightframework/index.html
     *             ↓
     * ../../
     */
    const root =
        relativeUrl(
            siteRoot,
            outputPath
        ) + "/";

    /*
     * Main navigation
     */

    const mainNav =
        mainNavTemplate
            .replaceAll(
                "{{ROOT}}",
                root
            )
            .replaceAll(
                "{{HOME_CURRENT}}",
                ""
            )
            .replaceAll(
                "{{PROJECTS_CURRENT}}",
                'aria-current="page"'
            )
            .replaceAll(
                "{{TUTORIALS_CURRENT}}",
                ""
            )
            .replaceAll(
                "{{PLUGINS_CURRENT}}",
                ""
            );

    /*
     * Project navigation
     *
     * project.json stores hrefs relative
     * to the site root.
     *
     * Example:
     *
     * "flightframework/docs/index.html"
     *
     * becomes:
     *
     * "docs/index.html"
     *
     * when generated inside:
     *
     * flightframework/index.html
     */

    const subNavLinks =
    (project.navigation ?? [])
        .map((item) => {
            const targetPath =
                path.normalize(
                    path.resolve(
                        outputRoot,
                        item.href
                    )
                );

            const href =
                relativeUrl(
                    targetPath,
                    outputPath
                );

            const currentPath =
                path.normalize(
                    outputPath
                );

            const projectOutputDirectory =
                path.normalize(
                    outputDir
                );

            const targetDirectory =
                path.dirname(
                    targetPath
                );

            const isExactPage =
                currentPath ===
                targetPath;

            const isSubsection =
                targetDirectory !==
                    projectOutputDirectory &&
                currentPath.startsWith(
                    targetDirectory +
                    path.sep
                );

            const isActive =
                isExactPage ||
                isSubsection;

            return `
<a
    class="subnav__link${
        isActive
            ? " is-active"
            : ""
    }"
    href="${href}"
    ${
        isActive
            ? 'aria-current="page"'
            : ""
    }
>
    ${item.label}
</a>
`;
        })
        .join("\n");

    /*
     * Link back to the project's root.
     */

    const projectRoot =
        siteUrlToRelativeUrl(
            project.root,
            outputRoot,
            outputPath
        );

    const subNav =
        subNavTemplate
            .replaceAll(
                "{{ROOT}}",
                root
            )
            .replaceAll(
                "{{PROJECT_NAME}}",
                project.name
            )
            .replace(
                "{{PROJECT_ROOT}}",
                projectRoot
            )
            .replace(
                "{{LINKS}}",
                subNavLinks
            );

    /*
     * Project content
     */

    const content =
        fs.readFileSync(
            sourcePath,
            "utf8"
        );

    /*
     * Assemble the final page.
     */

    const html =
        template
            .replace(
                "{{TITLE}}",
                project.name
            )
            .replace(
                "{{DESCRIPTION}}",
                project.description ?? ""
            )
            .replace(
                "{{MAIN_NAV}}",
                mainNav
            )
            .replace(
                "{{SUB_NAV}}",
                subNav
            )
            .replace(
                "{{CONTENT}}",
                content
            )
            .replaceAll(
                "{{ROOT}}",
                root
            );

    fs.mkdirSync(
        outputDir,
        {
            recursive: true
        }
    );

    fs.writeFileSync(
        outputPath,
        html
    );

    console.log(
        `  → ${path.relative(siteRoot, outputPath)}`
    );
}

module.exports = {
    name: "projects",

    order: 20,

    build({
        siteRoot,
        outputRoot
    }) {
        const projectsRoot =
            path.join(
                siteRoot,
                "flightframework"
            );

        if (!fs.existsSync(projectsRoot)) {
            return;
        }

        buildProject({
            projectDir: projectsRoot,
            outputRoot,
            siteRoot
        });
    }
};