/**
 * Guards the homepage footer against undefined React elements.
 *
 * lucide-react 1.x removed Instagram / Twitter / Facebook. FooterV2 used to
 * import those names and render them as <Icon />, which crashed homepage SSR
 * with: "Element type is invalid ... got: undefined".
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
    InstagramIcon,
    TwitterIcon,
    FacebookIcon,
} from "../components/landing-v2/SocialBrandIcons";

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

function main() {
    const replacements = { InstagramIcon, TwitterIcon, FacebookIcon };
    for (const [name, Icon] of Object.entries(replacements)) {
        assert(typeof Icon === "function", `${name} must be a React component, got ${typeof Icon}`);
        const html = renderToStaticMarkup(createElement(Icon, { size: 20 }));
        assert(html.includes("<svg"), `${name} must render an <svg>, got: ${html}`);
    }

    const footerSource = readFileSync(
        resolve(process.cwd(), "components/landing-v2/FooterV2.tsx"),
        "utf8"
    );
    assert(
        !footerSource.includes('from "lucide-react"') ||
            !/\{[^}]*\b(Instagram|Twitter|Facebook)\b[^}]*\}\s+from\s+["']lucide-react["']/.test(
                footerSource
            ),
        "FooterV2 must not import Instagram, Twitter, or Facebook from lucide-react"
    );
    assert(
        footerSource.includes("InstagramIcon") &&
            footerSource.includes("TwitterIcon") &&
            footerSource.includes("FacebookIcon"),
        "FooterV2 must render the local SocialBrandIcons replacements"
    );

    console.log("homepage footer social icons: ok");
}

main();
