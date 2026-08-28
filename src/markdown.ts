import { marked } from "marked"

type CalloutType =
    | "tip"
    | "info"
    | "warn"
    | "danger"
    | "note"

type CalloutToken = {
    type: "callout"
    raw: string
    calloutType: CalloutType
    title: string
    text: string
}

export type TocEntry = {
    title: string
    slug: string
    depth: number
}

export type MarkdownDocument = {
    html: string
    toc: TocEntry[]
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}

function createSlugger() {
    const counts = new Map<string, number>()

    return (text: string): string => {
        const baseSlug = slugify(text)
        const count = counts.get(baseSlug) ?? 0

        counts.set(baseSlug, count + 1)

        return count === 0
            ? baseSlug
            : `${baseSlug}-${count + 1}`
    }
}

function preserveExtraBlankLines(source: string): string {
    return source.replace(
        /(?:\r?\n[ \t]*){3,}/g,
        (match) => {
            const newlineCount = (match.match(/\r?\n/g) ?? []).length

            const emptyLineCount = newlineCount - 1

            const brCount = emptyLineCount - 1

            if (brCount <= 0) {
                return match
            }

            return (
                "\n\n" +
                Array.from(
                    { length: brCount },
                    () => "<!--EXTRA_BR-->"
                ).join("\n") +
                "\n\n"
            )
        }
    )
}

const calloutExtension = {
    name: "callout",
    level: "block" as const,

    start(src: string) {
        const index = src.indexOf(":::")
        return index >= 0 ? index : undefined
    },

    tokenizer(src: string) {
        const match = src.match(
            /^:::[ \t]*\*(tip|info|warn|danger|note)(?:[ \t]+(.+?))?[ \t]*\*\n([\s\S]*?)\n:::[ \t]*(?:\n|$)/
        )

        if (!match) {
            return undefined
        }

        const calloutType = match[1] as CalloutType

        const token: CalloutToken = {
            type: "callout",
            raw: match[0],
            calloutType,
            title: match[2] ?? calloutType.toUpperCase(),
            text: match[3],
        }

        return token
    },

    renderer(token: unknown): string {
        const callout = token as CalloutToken

        return `
            <div class="callout callout-${callout.calloutType}">
                <div class="callout-title">
                    ${escapeHtml(callout.title)}
                </div>
                <div class="callout-content">
                    ${marked.parse(callout.text)}
                </div>
            </div>
        `
    },
}

marked.use({
    extensions: [calloutExtension],
})

export async function parseMarkdown(
    source: string
): Promise<MarkdownDocument> {
    source = preserveExtraBlankLines(source)

    const toc: TocEntry[] = []
    const slugger = createSlugger()

    const tokens = marked.lexer(source)

    for (const token of tokens) {
        if (token.type !== "heading") {
            continue
        }

        const title = token.text
        const slug = slugger(title)

        toc.push({
            title,
            slug,
            depth: token.depth,
        })
    }

    const headingSlugs = new Map<string, string[]>()

    for (const entry of toc) {
        const slugs = headingSlugs.get(entry.title) ?? []

        slugs.push(entry.slug)
        headingSlugs.set(entry.title, slugs)
    }

    const headingIndexes = new Map<string, number>()
    const renderer = new marked.Renderer()

    renderer.heading = function ({ tokens, depth }) {
        const text = this.parser.parseInline(tokens)
        const slugs = headingSlugs.get(text) ?? []
        const index = headingIndexes.get(text) ?? 0
        const slug = slugs[index] ?? slugify(text)

        headingIndexes.set(text, index + 1)

        return `<h${depth} id="${slug}">${text}</h${depth}>\n`
    }

    let html = await marked.parse(source, {
        renderer,
    })

    // Restore the markers AFTER marked has finished parsing.
    html = html.replace(
        /<!--EXTRA_BR-->/g,
        "<br>"
    )

    return {
        html,
        toc,
    }
}