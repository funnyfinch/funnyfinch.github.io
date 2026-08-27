const navToggle = document.querySelector(".js-nav-toggle");
const siteNav = document.querySelector(".js-site-nav");

if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
        const expanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!expanded));
        siteNav.classList.toggle("is-open", !expanded);
    });
}

const contentRoot = document.querySelector(".js-doc-content");
const headingContainer = document.querySelector(".js-generated-headings");

if (contentRoot && headingContainer) {
    const headings = Array.from(contentRoot.querySelectorAll("h2, h3"));

    headings.forEach((heading, index) => {
        if (!heading.id) {
            heading.id = `section-${index + 1}`;
        }

        const link = document.createElement("a");
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;
        link.className = "sidebar-heading-link";
        link.dataset.depth = heading.tagName === "H3" ? "3" : "2";
        link.dataset.target = heading.id;
        headingContainer.appendChild(link);
    });

    const sidebarLinks = Array.from(headingContainer.querySelectorAll(".sidebar-heading-link"));

    if ("IntersectionObserver" in window && sidebarLinks.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                sidebarLinks.forEach((link) => {
                    link.classList.toggle("is-current", link.dataset.target === entry.target.id);
                });
            });
        }, {
            rootMargin: "-25% 0px -60% 0px",
            threshold: 0.1
        });

        headings.forEach((heading) => observer.observe(heading));
    }
}

const themeToggle = document.querySelector(".theme-toggle");

if (themeToggle) {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light" || savedTheme === "dark") {
        document.documentElement.dataset.theme = savedTheme;
    } else {
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        document.documentElement.dataset.theme =
            prefersDark ? "dark" : "light";
    }

    themeToggle.addEventListener("click", () => {
        const currentTheme =
            document.documentElement.dataset.theme;

        const nextTheme =
            currentTheme === "dark"
                ? "light"
                : "dark";

        document.documentElement.dataset.theme =
            nextTheme;

        localStorage.setItem(
            "theme",
            nextTheme
        );
    });
}