"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface AnansiGameState {
    level: number;
    history: string[]; // Keep track of previous riddles to avoid repeats
    currentRiddle?: {
        question: string;
        targetCategory: string; // e.g. "fruit", "animal" - hidden context for AI validation
        difficulty: "easy" | "medium" | "hard";
    };
    score: number;
    isComplete: boolean;
}

export async function startAnansiGame(difficulty: "easy" | "medium" | "hard" = "easy"): Promise<AnansiGameState> {
    const prompt = `You are Anansi the Spider, the trickster and storyteller of Caribbean folklore.
    Generate a simple, fun riddle for a child (age 6-8) to help you build your web.
    The riddle should ask for a specific TYPE of object (e.g., a red fruit, a loud animal).
    
    Output JSON format:
    {
        "question": "The riddle text, spoken in a playful Caribbean dialect (e.g. 'Eh heh! I need someting...')",
        "targetCategory": "The category/constraint for validation (e.g. 'red fruit')"
    }`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");

        const data = JSON.parse(jsonMatch[0]);

        return {
            level: 1,
            history: [data.question],
            currentRiddle: {
                question: data.question,
                targetCategory: data.targetCategory,
                difficulty
            },
            score: 0,
            isComplete: false
        };
    } catch (e) {
        console.error("Anansi Game Start Error:", e);
        // Fallback
        return {
            level: 1,
            history: [],
            currentRiddle: {
                question: "Eh heh! I need someting Sweet to eat that grows on a tree. What could it be?",
                targetCategory: "sweet fruit",
                difficulty
            },
            score: 0,
            isComplete: false
        };
    }
}

export async function submitAnansiAnswer(currentState: AnansiGameState, answer: string): Promise<{
    newState: AnansiGameState;
    feedback: string;
    isCorrect: boolean;
}> {
    if (!currentState.currentRiddle) return { newState: currentState, feedback: "Error!", isCorrect: false };

    const prompt = `You are Anansi.
    Context: You asked: "${currentState.currentRiddle.question}" (Category: ${currentState.currentRiddle.targetCategory}).
    Child answered: "${answer}".
    
    Task:
    1. Determine if the answer fits the category/riddle. Be generous! Creative answers are good.
    2. If Correct: Generate a short celebratory phrase in dialect ("Bup bup! You smart for true!").
    3. If Incorrect: Generate a gentle hint in dialect.
    
    Output JSON:
    {
        "isCorrect": boolean,
        "feedback": "The string response",
        "nextRiddle": { "question": "...", "targetCategory": "..." } // Only if correct and level < 3
    }`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");

        const data = JSON.parse(jsonMatch[0]);

        if (data.isCorrect) {
            const nextLevel = currentState.level + 1;
            const isWin = nextLevel > 3; // 3 rounds to win

            let nextRiddle = undefined;
            if (!isWin) {
                // Generate next riddle here if the model didn't return one or to ensure freshness
                // Actually the model might have returned it, let's trust it or regen if missing
                if (data.nextRiddle) {
                    nextRiddle = {
                        ...data.nextRiddle,
                        difficulty: currentState.currentRiddle.difficulty
                    };
                } else {
                    // Quick regen if missing
                    const newRiddlePrompt = `You are Anansi. Generate another DIFFERENT riddle (Level ${nextLevel}/3). JSON: { "question": "...", "targetCategory": "..." }`;
                    const newRes = await model.generateContent(newRiddlePrompt);
                    const newJson = JSON.parse(newRes.response.text().match(/\{[\s\S]*\}/)?.[0] || "{}");
                    nextRiddle = { ...newJson, difficulty: currentState.currentRiddle.difficulty };
                }
            }

            return {
                isCorrect: true,
                feedback: data.feedback,
                newState: {
                    ...currentState,
                    level: nextLevel,
                    score: currentState.score + 100,
                    isComplete: isWin,
                    currentRiddle: isWin ? undefined : nextRiddle,
                    history: [...currentState.history, answer]
                }
            };
        } else {
            return {
                isCorrect: false,
                feedback: data.feedback,
                newState: currentState // No change in state, just feedback
            };
        }

    } catch (e) {
        console.error("Anansi Check Error:", e);
        return {
            isCorrect: false,
            feedback: "Anansi scratchin' his head... try again?",
            newState: currentState
        };
    }
}
