"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminComponents";
import { createClient } from "@/lib/supabase/client";
import {
    getAICostSnapshot,
    saveAICostControls,
    type AICostSnapshot,
    type AICostControls,
} from "@/app/actions/admin";
import { RefreshCw, Save, AlertTriangle, CheckCircle2, Ban } from "lucide-react";

const EMPTY_CONTROLS: AICostControls = {
    monthlyBudgetUSD: 300,
    warnThresholdPct: 80,
    hardStopThresholdPct: 100,
    taskRouting: {
        classification: "gemini-3.1-flash-preview",
        extraction: "gemini-3.1-flash-preview",
        moderation: "gemini-3.1-flash-preview",
        chat: "gemini-3.1-flash-preview",
        creative: "gemini-3.1-pro-preview",
        long_form: "gemini-3.1-pro-preview",
        coding: "gpt-5-codex",
    },
    modelPricesUSDPer1M: {
        "gpt-5-codex": { inputPer1M: 1.25, outputPer1M: 10, cachedInputPer1M: 0.125 },
        "gemini-3.1-flash-preview": { inputPer1M: 0, outputPer1M: 0 },
        "gemini-3.1-pro-preview": { inputPer1M: 0, outputPer1M: 0 },
    },
};

export default function AdminAICostsPage() {
    const [snapshot, setSnapshot] = useState<AICostSnapshot | null>(null);
    const [controls, setControls] = useState<AICostControls>(EMPTY_CONTROLS);
    const [windowDays, setWindowDays] = useState(30);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async (days = windowDays) => {
        setIsLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) throw new Error("Admin session not found.");

            const data = await getAICostSnapshot(session.access_token, days);
            setSnapshot(data);
            setControls(data.controls);
        } catch (e: any) {
            setError(e?.message || "Failed to load AI cost data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void load(30);
    }, []);

    const budgetTone = useMemo(() => {
        if (!snapshot) return "text-gray-700";
        if (snapshot.budget.status === "over") return "text-red-600";
        if (snapshot.budget.status === "warn") return "text-amber-600";
        return "text-green-600";
    }, [snapshot]);

    const saveControls = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const supabase = createClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) throw new Error("Admin session not found.");
            await saveAICostControls(session.access_token, controls);
            await load(windowDays);
        } catch (e: any) {
            setError(e?.message || "Failed to save controls.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout activeSection="ai-costs">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">AI Cost Tracker</h1>
                        <p className="text-gray-500 mt-1">Token usage, model spend, and budget guardrails.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            title="Window"
                            value={windowDays}
                            onChange={(e) => setWindowDays(Number(e.target.value))}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                        <button
                            onClick={() => void load(windowDays)}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold flex items-center gap-2"
                        >
                            <RefreshCw className={isLoading ? "animate-spin" : ""} size={16} />
                            Refresh
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-8 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold">
                        {error}
                    </div>
                )}

                {snapshot && (
                    <section className="grid md:grid-cols-4 gap-4">
                        <Card label={`Estimated Cost (${snapshot.windowDays}d)`} value={`$${snapshot.estimatedCostUSD.toFixed(2)}`} />
                        <Card label="Projected Monthly Cost" value={`$${snapshot.estimatedCostMonthlyUSD.toFixed(2)}`} />
                        <Card label="Input Tokens" value={snapshot.tokensIn.toLocaleString()} />
                        <Card label="Output Tokens" value={snapshot.tokensOut.toLocaleString()} />
                    </section>
                )}

                {snapshot && (
                    <section className="bg-white border border-gray-100 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-black text-gray-900">Budget Status</h2>
                            <div className={`font-black ${budgetTone}`}>
                                {snapshot.budget.pctUsed.toFixed(1)}% of ${snapshot.budget.monthlyBudgetUSD.toFixed(2)}
                            </div>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${snapshot.budget.status === "over" ? "bg-red-500" : snapshot.budget.status === "warn" ? "bg-amber-500" : "bg-green-500"}`}
                                style={{ width: `${Math.min(snapshot.budget.pctUsed, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Warn at {snapshot.budget.warnThresholdPct}% | Hard stop at {snapshot.budget.hardStopThresholdPct}%
                        </p>
                    </section>
                )}

                {snapshot && (
                    <section className="bg-white border border-gray-100 rounded-2xl p-6">
                        <h2 className="text-xl font-black text-gray-900 mb-4">Model Breakdown</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-400 uppercase text-xs">
                                        <th className="py-2">Model</th>
                                        <th className="py-2">Calls</th>
                                        <th className="py-2">Input</th>
                                        <th className="py-2">Output</th>
                                        <th className="py-2">Est. Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {snapshot.byModel.map((row) => (
                                        <tr key={row.model} className="border-t border-gray-100">
                                            <td className="py-2 font-bold text-gray-900">{row.model}</td>
                                            <td className="py-2">{row.calls}</td>
                                            <td className="py-2">{row.tokensIn.toLocaleString()}</td>
                                            <td className="py-2">{row.tokensOut.toLocaleString()}</td>
                                            <td className="py-2 font-bold">${row.estimatedCostUSD.toFixed(4)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
                    <h2 className="text-xl font-black text-gray-900">Model Routing Rules</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {Object.entries(controls.taskRouting).map(([task, model]) => (
                            <label key={task} className="text-sm font-bold text-gray-700">
                                <span className="block mb-1 capitalize">{task.replace("_", " ")}</span>
                                <input
                                    value={model}
                                    onChange={(e) =>
                                        setControls((prev) => ({
                                            ...prev,
                                            taskRouting: { ...prev.taskRouting, [task]: e.target.value },
                                        }))
                                    }
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                                />
                            </label>
                        ))}
                    </div>

                    <h3 className="text-lg font-black text-gray-900">Budget Guardrails</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <NumberField label="Monthly Budget (USD)" value={controls.monthlyBudgetUSD} onChange={(v) => setControls((p) => ({ ...p, monthlyBudgetUSD: v }))} />
                        <NumberField label="Warn Threshold (%)" value={controls.warnThresholdPct} onChange={(v) => setControls((p) => ({ ...p, warnThresholdPct: v }))} />
                        <NumberField label="Hard Stop Threshold (%)" value={controls.hardStopThresholdPct} onChange={(v) => setControls((p) => ({ ...p, hardStopThresholdPct: v }))} />
                    </div>

                    <h3 className="text-lg font-black text-gray-900">Model Prices (USD / 1M tokens)</h3>
                    <div className="space-y-3">
                        {Object.entries(controls.modelPricesUSDPer1M).map(([model, price]) => (
                            <div key={model} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                <label className="text-sm font-bold text-gray-700 md:col-span-1">
                                    Model
                                    <input
                                        value={model}
                                        disabled
                                        className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
                                    />
                                </label>
                                <NumberField
                                    label="Input"
                                    value={price.inputPer1M}
                                    onChange={(v) =>
                                        setControls((prev) => ({
                                            ...prev,
                                            modelPricesUSDPer1M: {
                                                ...prev.modelPricesUSDPer1M,
                                                [model]: { ...prev.modelPricesUSDPer1M[model], inputPer1M: v },
                                            },
                                        }))
                                    }
                                />
                                <NumberField
                                    label="Output"
                                    value={price.outputPer1M}
                                    onChange={(v) =>
                                        setControls((prev) => ({
                                            ...prev,
                                            modelPricesUSDPer1M: {
                                                ...prev.modelPricesUSDPer1M,
                                                [model]: { ...prev.modelPricesUSDPer1M[model], outputPer1M: v },
                                            },
                                        }))
                                    }
                                />
                                <NumberField
                                    label="Cached Input (optional)"
                                    value={price.cachedInputPer1M || 0}
                                    onChange={(v) =>
                                        setControls((prev) => ({
                                            ...prev,
                                            modelPricesUSDPer1M: {
                                                ...prev.modelPricesUSDPer1M,
                                                [model]: { ...prev.modelPricesUSDPer1M[model], cachedInputPer1M: v },
                                            },
                                        }))
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => void saveControls()}
                        disabled={isSaving}
                        className="px-5 py-3 rounded-xl bg-primary text-white font-black flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Cost Controls
                    </button>
                </section>

                {snapshot && (
                    <section className="bg-white border border-gray-100 rounded-2xl p-6">
                        <h2 className="text-xl font-black text-gray-900 mb-3">Notes</h2>
                        <ul className="space-y-2">
                            {snapshot.notes.map((note) => (
                                <li key={note} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="mt-0.5">
                                        {note.toLowerCase().includes("not automatically backfilled") ? (
                                            <Ban size={14} className="text-amber-600" />
                                        ) : note.toLowerCase().includes("0 in controls") ? (
                                            <AlertTriangle size={14} className="text-amber-600" />
                                        ) : (
                                            <CheckCircle2 size={14} className="text-green-600" />
                                        )}
                                    </span>
                                    <span>{note}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </AdminLayout>
    );
}

function Card({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest font-black text-gray-400 mb-2">{label}</p>
            <p className="text-3xl font-black text-gray-900">{value}</p>
        </div>
    );
}

function NumberField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
}) {
    return (
        <label className="text-sm font-bold text-gray-700">
            <span className="block mb-1">{label}</span>
            <input
                type="number"
                step="0.01"
                value={Number.isFinite(value) ? value : 0}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200"
            />
        </label>
    );
}
