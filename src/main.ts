type theme = "light" | "dark";

const themeToggle = document.querySelector(".theme-toggle")
if (themeToggle) {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme == "light" || savedTheme == "dark") {
        document.documentElement.dataset.theme = savedTheme;
    } else {
        const prefersDark = window.matchMedia("prefers-color-scheme: dark").matches;
        document.documentElement.dataset.theme = prefersDark ? "dark" : "light";
    }

    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.dataset.theme;
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem("theme", nextTheme)
    })
}

const TYPE_SPEED = 45;
const DELETE_SPEED = 25;
const PAUSE_AFTER_TYPE = 1800;
const PAUSE_AFTER_DELETE = 400;

document.querySelectorAll<HTMLElement>("[data-typewriter]").forEach((element) => {
    const raw = element.dataset.typewriter;

    if (!raw) {
        return;
    }

    let phrases: string[];

    try {
        phrases = JSON.parse(raw);
    } catch {
        console.error("Invalid data-typewriter JSON:", raw);
        return;
    }

    if (phrases.length === 0) {
        return;
    }

    let phraseIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let deleteTarget = 0;

    function getSharedPrefixLength(a: string, b: string): number {
        const length = Math.min(a.length, b.length);

        let i = 0;

        while (i < length && a[i] === b[i]) {
            i++;
        }

        return i;
    }

    function tick() {
        const phrase: string = phrases[phraseIndex];

        if (!deleting) {
            characterIndex++;

            element.textContent = phrase.slice(0, characterIndex);

            if (characterIndex >= phrase.length) {
                deleting = true;

                const nextPhrase = phrases[(phraseIndex + 1) % phrases.length];
                deleteTarget = getSharedPrefixLength(phrase, nextPhrase);

                setTimeout(tick, PAUSE_AFTER_TYPE);
                return;
            }

            setTimeout(tick, TYPE_SPEED);
            return;
        }

        characterIndex--;

        element.textContent = phrase.slice(0, characterIndex);

        if (characterIndex <= deleteTarget) {
            deleting = false;

            phraseIndex = (phraseIndex + 1) % phrases.length;

            setTimeout(tick, PAUSE_AFTER_DELETE);
            return;
        }

        setTimeout(tick, DELETE_SPEED);
    }

    tick();
})