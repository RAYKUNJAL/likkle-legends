export const CARIBBEAN_ISLANDS = [
    { name: "Anguilla", flag: "🇦🇮" },
    { name: "Antigua and Barbuda", flag: "🇦🇬" },
    { name: "Aruba", flag: "🇦🇼" },
    { name: "Bahamas", flag: "🇧🇸" },
    { name: "Barbados", flag: "🇧🇧" },
    { name: "Belize", flag: "🇧🇿" },
    { name: "Bermuda", flag: "🇧🇲" },
    { name: "Bonaire", flag: "🇧🇶" },
    { name: "British Virgin Islands", flag: "🇻🇬" },
    { name: "Cayman Islands", flag: "🇰🇾" },
    { name: "Cuba", flag: "🇨🇺" },
    { name: "Curaçao", flag: "🇨🇼" },
    { name: "Dominica", flag: "🇩🇲" },
    { name: "Dominican Republic", flag: "🇩🇴" },
    { name: "Grenada", flag: "🇬🇩" },
    { name: "Guadeloupe", flag: "🇬🇵" },
    { name: "Guyana", flag: "🇬🇾" },
    { name: "Haiti", flag: "🇭🇹" },
    { name: "Jamaica", flag: "🇯🇲" },
    { name: "Martinique", flag: "🇲🇶" },
    { name: "Montserrat", flag: "🇲🇸" },
    { name: "Puerto Rico", flag: "🇵🇷" },
    { name: "Saba", flag: "🇧🇶" },
    { name: "Saint Barthélemy", flag: "🇧🇱" },
    { name: "Saint Kitts and Nevis", flag: "🇰🇳" },
    { name: "Saint Lucia", flag: "🇱🇨" },
    { name: "Saint Martin", flag: "🇲🇫" },
    { name: "Saint Vincent and the Grenadines", flag: "🇻🇨" },
    { name: "Sint Eustatius", flag: "🇧🇶" },
    { name: "Sint Maarten", flag: "🇸🇽" },
    { name: "Suriname", flag: "🇸🇷" },
    { name: "Trinidad and Tobago", flag: "🇹🇹" },
    { name: "Turks and Caicos Islands", flag: "🇹🇨" },
    { name: "US Virgin Islands", flag: "🇻🇮" },
].sort((a, b) => a.name.localeCompare(b.name));

// Backwards-compatible plain string list (name only)
export const CARIBBEAN_ISLANDS_LIST = CARIBBEAN_ISLANDS.map(i => i.name);


export const islandData = {
    "JAM-001": {
        name: "Jamaica",
        cultural_training_data: {
            sensory_calibration: {
                sounds: ["Steelpan", "Reggae", "Wave crash"],
            },
            dialect_patois: [
                { word: "Wah Gwan", meaning: "What's going on / Hello" },
                { word: "Likkle", meaning: "Little", phrase: "Likkle but tallawah" }
            ]
        },
        parent_analytics_logic: {
            milestone_alert: "Kai just learned 5 new Patois words! High five! 🖐️"
        }
    }
};
