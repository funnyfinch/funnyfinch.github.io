const fs = require("fs");
const path = require("path");
const { marked } = require("marked");


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


function findDocumentationConfigs(directory) {
    const configs = [];

    for (const entry of fs.readdirSync(
        directory,
        { withFileTypes: true }
    )) {
        const entryPath = path.join(
            directory,
            entry.name
        );

        if (
            entry.isDirectory() &&
            entry.name !== "_site" &&
            entry.name !== "node_modules" &&
            entry.name !== ".git"
        ) {
            configs.push(
                ...findDocumentationConfigs(
                    entryPath
                )
            );

            continue;
        }

        if (
            entry.isFile() &&
            entry.name === "docs.json"
        ) {
            configs.push(entryPath);
        }
    }

    return configs;
}


function findProjectConfig(
    documentationDir,
    siteRoot
) {
    let directory =
        documentationDir;

    while (
        directory.startsWith(siteRoot)
    ) {
        const projectPath =
            path.join(
                directory,
                "project.json"
            );

        if (
            fs.existsSync(projectPath)
        ) {
            return projectPath;
        }

        const parent =
            path.dirname(directory);

        if (
            parent === directory
        ) {
            break;
        }

        directory = parent;
    }

    return null;
}


function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
}


function getPageLabel(source) {
    return path.basename(
        source,
        path.extname(source)
    );
}


function getHeadings(markdown) {
    const tokens =
        marked.lexer(markdown);

    const headings = [];
    const usedIds = new Map();

    for (const token of tokens) {
        if (token.type !== "heading") {
            continue;
        }

        const text =
            token.text.trim();

        let id =
            slugify(text);

        if (!id) {
            id = "section";
        }

        const count =
            usedIds.get(id) ?? 0;

        usedIds.set(
            id,
            count + 1
        );

        if (count > 0) {
            id = `${id}-${count + 1}`;
        }

        headings.push({
            text,
            depth: token.depth,
            id
        });
    }

    return headings;
}


function buildHeadingTree(headings) {
    const root = [];
    const stack = [];

    for (const heading of headings) {
        const item = {
            ...heading,
            children: []
        };

        while (
            stack.length > 0 &&
            stack[stack.length - 1].depth >= heading.depth
        ) {
            stack.pop();
        }

        if (stack.length === 0) {
            root.push(item);
        } else {
            stack[
                stack.length - 1
            ].children.push(item);
        }

        stack.push(item);
    }

    return root;
}


function renderHeadingTree(
    nodes,
    maxDepth = 4
) {
    if (!nodes.length) {
        return "";
    }

    return `
<ul class="toc-list">
${nodes
    .map((node) => {
        const relativeDepth =
            Math.min(
                node.depth,
                maxDepth
            );

        const children =
            node.children.length > 0
                ? renderHeadingTree(
                    node.children,
                    maxDepth
                )
                : "";

        return `
    <li class="toc-list__item toc-list__item--depth-${relativeDepth}">
        <a
            class="toc-list__link"
            href="#${node.id}"
        >
            ${node.text}
        </a>

        ${children}
    </li>
`;
    })
    .join("")}
</ul>
`;
}


function createMarkdownRenderer(headings) {
    let headingIndex = 0;

    const renderer =
        new marked.Renderer();

    renderer.heading =
        function (token) {
            const heading =
                headings[headingIndex++];

            const text =
                this.parser.parseInline(
                    token.tokens
                );

            const id =
                heading?.id ??
                slugify(token.text);

            return `
<h${token.depth} id="${id}">
    ${text}
</h${token.depth}>
`;
        };

    return renderer;
}


function buildSidebar({
    config,
    documentationDir,
    outputPath,
    activePage,
    activeHeadings
}) {
    const pageLinks =
        config.pages ?? [];

    const links =
        pageLinks
            .map((source) => {
                const targetPath =
                    path.join(
                        documentationDir,
                        source
                    );

                const htmlTarget =
                    targetPath.replace(
                        path.extname(targetPath),
                        ".html"
                    );

                const href =
                    relativeUrl(
                        htmlTarget,
                        outputPath
                    );

                const isActive =
                    source === activePage;

                const toc =
                    isActive
                        ? renderHeadingTree(
                            buildHeadingTree(
                                activeHeadings
                            )
                        )
                        : "";

                return `
<li class="docs-sidebar__item">

    <a
        class="docs-sidebar__link${
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
        ${getPageLabel(source)}
    </a>

    ${
        isActive
            ? `
        <div class="docs-sidebar__toc">
            ${toc}
        </div>
        `
            : ""
    }

</li>
`;
            })
            .join("\n");

    return `
<nav
    class="docs-sidebar__nav"
    aria-label="${config.title}"
>
    <ul class="docs-sidebar__list">
        ${links}
    </ul>
</nav>
`;
}


function buildSubNav({
    projectConfig,
    siteRoot,
    outputRoot,
    outputPath
}) {
    if (!projectConfig) {
        return "";
    }

    const project =
        JSON.parse(
            fs.readFileSync(
                projectConfig,
                "utf8"
            )
        );

    const projectDirectory =
        path.dirname(projectConfig);

    const projectOutputDirectory =
        path.normalize(
            path.join(
                outputRoot,
                path.relative(
                    siteRoot,
                    projectDirectory
                )
            )
        );

    const currentPath =
        path.normalize(
            outputPath
        );

    const links =
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

                const targetDirectory =
                    path.dirname(
                        targetPath
                    );

                const isExactPage =
                    currentPath === targetPath;

                const isProjectHome =
                    targetPath ===
                        path.join(
                            projectOutputDirectory,
                            "index.html"
                        ) &&
                    currentPath === targetPath;

                const isSubsection =
                    targetDirectory !==
                        projectOutputDirectory &&
                    currentPath.startsWith(
                        targetDirectory +
                        path.sep
                    );

                const isActive =
                    isExactPage ||
                    isProjectHome ||
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

    const root =
        relativeUrl(
            siteRoot,
            outputPath
        ) + "/";

    return fs
        .readFileSync(
            path.join(
                siteRoot,
                "templates",
                "subnav.html"
            ),
            "utf8"
        )
        .replaceAll(
            "{{ROOT}}",
            root
        )
        .replace(
            "{{PROJECT_NAME}}",
            project.name
        )
        .replace(
            "{{LINKS}}",
            links
        );
}


function buildDocumentation({
    configPath,
    outputRoot,
    siteRoot
}) {
    const documentationDir =
        path.dirname(configPath);

    const config =
        JSON.parse(
            fs.readFileSync(
                configPath,
                "utf8"
            )
        );

    const projectConfig =
        findProjectConfig(
            documentationDir,
            siteRoot
        );

    for (
        const source of
        config.pages ?? []
    ) {
        buildPage({
            documentationDir,
            outputRoot,
            siteRoot,
            config,
            source,
            projectConfig
        });
    }
}


function buildPage({
    documentationDir,
    outputRoot,
    siteRoot,
    config,
    source,
    projectConfig
}) {
    const sourcePath =
        path.join(
            documentationDir,
            source
        );

    if (!fs.existsSync(sourcePath)) {
        throw new Error(
            `Documentation source does not exist: ${sourcePath}`
        );
    }

    const relativeDirectory =
        path.relative(
            siteRoot,
            documentationDir
        );

    const outputDir =
        path.join(
            outputRoot,
            relativeDirectory
        );

    const outputName =
        path.basename(
            source,
            path.extname(source)
        ) + ".html";

    const outputPath =
        path.join(
            outputDir,
            outputName
        );

    const markdown =
        fs.readFileSync(
            sourcePath,
            "utf8"
        );

    const headings =
        getHeadings(markdown);

    const renderer =
        createMarkdownRenderer(
            headings
        );

    const content =
        marked.parse(
            markdown,
            { renderer }
        );

    const template =
        fs.readFileSync(
            path.join(
                siteRoot,
                "templates",
                "docs.html"
            ),
            "utf8"
        );

    const mainNavTemplate =
        fs.readFileSync(
            path.join(
                siteRoot,
                "templates",
                "nav.html"
            ),
            "utf8"
        );

    const root =
        relativeUrl(
            siteRoot,
            outputPath
        ) + "/";

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
                projectConfig
                    ? 'aria-current="page"'
                    : ""
            )
            .replaceAll(
                "{{TUTORIALS_CURRENT}}",
                ""
            )
            .replaceAll(
                "{{PLUGINS_CURRENT}}",
                ""
            );

    const subNav =
        buildSubNav({
            projectConfig,
            siteRoot,
            outputRoot,
            outputPath
        });

    const sidebar =
        buildSidebar({
            config,
            documentationDir,
            outputPath,
            activePage: source,
            activeHeadings: headings
        });

    const html =
        template
            .replace(
                "{{TITLE}}",
                getPageLabel(source)
            )
            .replace(
                "{{DESCRIPTION}}",
                ""
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
                "{{SIDEBAR}}",
                sidebar
            )
            .replace(
                "{{SECTION_TITLE}}",
                config.title
            )
            .replace(
                "{{SECTION_LABEL}}",
                "documentation"
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
        `  → ${path.relative(
            siteRoot,
            outputPath
        )}`
    );
}


module.exports = {
    name: "documentation",

    order: 30,

    build({
        siteRoot,
        outputRoot
    }) {
        const configs =
            findDocumentationConfigs(
                siteRoot
            );

        for (
            const configPath of configs
        ) {
            buildDocumentation({
                configPath,
                outputRoot,
                siteRoot
            });
        }
    }
};