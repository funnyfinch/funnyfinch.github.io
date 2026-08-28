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
        .replace(/'/g, "&#39;")
}

const renderer = new marked.Renderer()

renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens)
    const slug = slugify(text)
    return `<h${depth} id="${slug}">${text}</h${depth}>\n`
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
            /^:::[ \t]*(tip|info|warn|danger|note)(?:[ \t]+(.+?))?[ \t]*\n([\s\S]*?)\n:::[ \t]*(?:\n|$)/
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
    renderer,
    extensions: [calloutExtension],
})

export async function parseMarkdown(
    source: string
): Promise<MarkdownDocument> {
    const toc: TocEntry[] = []

    const html = await marked.parse(source, {
        walkTokens(token) {
            if (token.type !== "heading") {
                return
            }

            const title = token.text
            const slug = slugify(title)

            toc.push({
                title,
                slug,
                depth: token.depth,
            })
        },
    })

    return {
        html,
        toc,
    }
}
