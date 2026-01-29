"use client";

import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function ClientDebugPage() {
    const [status, setStatus] = useState<string>("Ready to test");
    const [apiKey, setApiKey] = useState<string>("");
    const [detectedKey, setDetectedKey] = useState<string>("");
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const checkEnv = () => {
        const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        setDetectedKey(key ? `${key.substring(0, 5)}...` : "Missing");
        addLog(`Checking Env: ${key ? "Found" : "Missing"}`);
    };

    const runTest = async () => {
        const keyToUse = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!keyToUse) {
            setStatus("Error: No API Key found");
            addLog("Error: No API Key found");
            return;
        }

        setStatus("Testing...");
        addLog("Initializing GoogleGenerativeAI...");

        try {
            const genAI = new GoogleGenerativeAI(keyToUse);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            addLog("Sending request to Gemini 2.0 Flash...");
            const result = await model.generateContent("Reply with 'Hello from Client'");
            const response = await result.response;
            const text = response.text();

            setStatus("Success!");
            addLog(`Success! Response: "${text}"`);
        } catch (e: any) {
            setStatus("Failed");
            addLog(`Error: ${e.message}`);
            console.error(e);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Client-Side AI Debugger</h1>

            <div className="p-4 bg-gray-100 rounded-lg">
                <p><strong>Env Key Status:</strong> {detectedKey || <button onClick={checkEnv} className="text-blue-500 underline">Check</button>}</p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Manual API Key Override (Optional)</label>
                <input
                    type="text"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Paste AIza... key here"
                    className="w-full p-2 border rounded"
                />
            </div>

            <button
                onClick={runTest}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
            >
                Run Client Test
            </button>

            <div className="p-4 bg-black text-green-400 font-mono text-sm rounded h-64 overflow-y-auto">
                <div className="font-bold border-b border-gray-700 mb-2 pb-2">Logs ({status})</div>
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
        </div>
    );
}
