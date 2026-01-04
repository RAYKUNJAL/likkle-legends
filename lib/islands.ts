export const CARIBBEAN_ISLANDS = [
    "Anguilla",
    "Antigua and Barbuda",
    "Aruba",
    "Bahamas",
    "Barbados",
    "Belize", // Culturally Caribbean
    "Bermuda", // Often associated
    "Bonaire",
    "British Virgin Islands",
    "Cayman Islands",
    "Cuba",
    "Curaçao",
    "Dominica",
    "Dominican Republic",
    "Grenada",
    "Guadeloupe",
    "Guyana", // Culturally Caribbean
    "Haiti",
    "Jamaica",
    "Martinique",
    "Montserrat",
    "Puerto Rico",
    "Saba",
    "Saint Barthélemy",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Martin",
    "Saint Vincent and the Grenadines",
    "Sint Eustatius",
    "Sint Maarten",
    "Suriname", // Culturally Caribbean
    "Trinidad and Tobago",
    "Turks and Caicos Islands",
    "US Virgin Islands"
].sort();

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
