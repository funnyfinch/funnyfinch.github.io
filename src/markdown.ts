import fs from "node:fs"
import path from "node:path"
import { marked } from "marked"

function walk(directory: string) {
    const entries = fs.readdirSync(directory, {
        withFileTypes: true,
    })

    const files: string[] = []

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name)

        if (entry.isDirectory()) {
            files.push(...walk(fullPath))
        } else if (entry.name.endsWith(".md")) {
            files.push(fullPath)
        }
    }

    return files
}

export function getMarkdownFiles(directory: string) {
    return walk(directory).map((filePath) => {
        const relative = path.relative(directory, filePath)

        const slug = relative
            .replace(/\.md$/, "")
            .replace(/\\/g, "/")

        return {
            path: filePath,
            slug,
        }
    })
}

export function loadMarkdown(filePath: string) {
    const source = fs.readFileSync(filePath, "utf8")

    return {
        html: marked.parse(source),
    }
}