export async function generateAIResponse(prompt: string, model: string = "gemini-3-flash-preview") {
    // This is a mock implementation. In a real app, you'd call the Gemini API via a secure backend route.
    console.log(`Generating response with ${model} for prompt: ${prompt}`);

    const responses = [
        "Fix your face, little one! Tanty Spice is here. Tell me, what's on your heart today?",
        "Oh gosh, that sounds like a grand adventure! When I was your age, we used to run through the mango patches...",
        "Sweetness, you have to be proud of where you from! Your roots are deep like a silk cotton tree.",
        "You feeling a bit 'mish-mash'? Don't worry, even the sea has rough days before the calm.",
        "That is too sweet! You making Tanty proud. Keep learning your culture, it's your superpower.",
        "Listen to me, child. Every legend starts with a single letter. You are doing great!",
        "Dilly Doubles was just telling me about the best street food... what's your favorite snack?",
        "Mango Moko says you've been standing tall today! I agree, you are a true legend."
    ];

    if (prompt.toLowerCase().includes("feeling") || prompt.toLowerCase().includes("sad") || prompt.toLowerCase().includes("happy")) {
        return "Tanty knows hearts best. Tell me more, my darling. Your feelings are like the tides - they come and go, but you stay strong.";
    }

    if (prompt.toLowerCase().includes("culture") || prompt.toLowerCase().includes("caribbean")) {
        return "The Caribbean is a big, beautiful family! From the steelpan to the carnival, we have so much to celebrate.";
    }

    return responses[Math.floor(Math.random() * responses.length)];
}
