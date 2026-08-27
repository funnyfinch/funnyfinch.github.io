const fs = require("fs");
const path = require("path");

const siteRoot = __dirname;
const outputRoot = path.join(
    siteRoot,
    "_site"
);

const buildDirectory = path.join(
    siteRoot,
    "tools",
    "build"
);

function loadBuilders() {
    return fs
        .readdirSync(buildDirectory)
        .filter((file) =>
            file.endsWith(".js")
        )
        .map((file) =>
            require(
                path.join(
                    buildDirectory,
                    file
                )
            )
        )
        .filter((module) =>
            typeof module.build === "function"
        )
        .sort(
            (a, b) =>
                (a.order ?? 0) -
                (b.order ?? 0)
        );
}

function copyDirectory(source, destination) {
    fs.mkdirSync(destination, {
        recursive: true
    });

    for (const entry of fs.readdirSync(source, {
        withFileTypes: true
    })) {
        const sourcePath = path.join(
            source,
            entry.name
        );

        const destinationPath = path.join(
            destination,
            entry.name
        );

        if (entry.isDirectory()) {
            copyDirectory(
                sourcePath,
                destinationPath
            );
        } else {
            fs.copyFileSync(
                sourcePath,
                destinationPath
            );
        }
    }
}

function copyStaticFiles() {
    const files = [
        "style.css",
        "script.js"
    ];

    for (const file of files) {
        fs.copyFileSync(
            path.join(siteRoot, file),
            path.join(outputRoot, file)
        );
    }

    copyDirectory(
        path.join(siteRoot, "assets"),
        path.join(outputRoot, "assets")
    );
}

function main() {
    fs.rmSync(outputRoot, {
        recursive: true,
        force: true
    });

    fs.mkdirSync(outputRoot, {
        recursive: true
    });

    copyStaticFiles();

    const context = {
        siteRoot,
        outputRoot
    };

    for (const builder of loadBuilders()) {
        console.log(
            `Building ${builder.name}...`
        );

        builder.build(context);
    }
}

main();