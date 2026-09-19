/**
 * Guards shared and homepage footers against undefined React elements.
 *
 * lucide-react 1.x removed Instagram / Twitter / Facebook. Footer.tsx and
 * FooterV2 used to import those names and render them as <Icon />, which
 * crashed SSR with: "Element type is invalid ... got: undefined".
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

    for (const relPath of [
        "components/landing-v2/FooterV2.tsx",
        "components/Footer.tsx",
    ]) {
        const source = readFileSync(resolve(process.cwd(), relPath), "utf8");
        assert(
            !/\{[^}]*\b(Instagram|Twitter|Facebook)\b[^}]*\}\s+from\s+["']lucide-react["']/.test(
                source
            ),
            `${relPath} must not import Instagram, Twitter, or Facebook from lucide-react`
        );
        assert(
            source.includes("InstagramIcon") &&
                source.includes("TwitterIcon") &&
                source.includes("FacebookIcon"),
            `${relPath} must render the local SocialBrandIcons replacements`
        );
    }

    const sharedFooter = readFileSync(
        resolve(process.cwd(), "components/Footer.tsx"),
        "utf8"
    );
    assert(
        /\{[^}]*\bMail\b[^}]*\}\s+from\s+["']lucide-react["']/.test(sharedFooter),
        "Footer.tsx must keep Mail on lucide-react"
    );

    console.log("footer social icons: ok");
}

main();
