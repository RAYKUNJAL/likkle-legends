"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/storage';
import { Loader2, Music4, Check, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CustomSongFormProps {
    onSuccess: (requestId: string) => void;
}

interface FormData {
    childName: string;
    occasion: string; // birthday, milestone, just because
    details: string; // favorite color, pet name, etc.
    mood: string; // energetic, calm, lullaby
}

export default function CustomSongForm({ onSuccess }: CustomSongFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Please log in first");

            const { data: request, error } = await supabase
                .from('custom_song_requests')
                .insert({
                    user_id: user.id,
                    child_name: data.childName,
                    occasion: data.occasion,
                    details: data.details,
                    mood: data.mood,
                    status: 'pending_payment'
                })
                .select()
                .single();

            if (error) throw error;

            toast.success("Request saved! Proceeding to payment...");
            onSuccess(request.id);
        } catch (error: any) {
            toast.error(error.message || "Failed to save request");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Child's Name</label>
                    <input
                        {...register("childName", { required: "Name is required" })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="e.g. Maya"
                    />
                    {errors.childName && <span className="text-red-500 text-xs">{errors.childName.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Occasion</label>
                    <select
                        {...register("occasion", { required: true })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    >
                        <option value="birthday">Birthday</option>
                        <option value="milestone">Milestone (Potty, School)</option>
                        <option value="encouragement">Encouragement</option>
                        <option value="just_because">Just Because</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Song Mood</label>
                <div className="grid grid-cols-3 gap-3">
                    {['energetic', 'calm', 'lullaby'].map((m) => (
                        <label key={m} className="cursor-pointer">
                            <input
                                type="radio"
                                value={m}
                                {...register("mood", { required: true })}
                                className="peer sr-only"
                            />
                            <div className="p-3 text-center border-2 border-gray-100 rounded-xl peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-gray-50 transition-all font-medium capitalize">
                                {m}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    Special Details <span className="text-gray-400 font-normal">(hobbies, favorite things, message)</span>
                </label>
                <textarea
                    {...register("details", { required: "Please add some details!", minLength: 20 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none"
                    placeholder="Tell us what makes them special..."
                />
                {errors.details && <span className="text-red-500 text-xs">{errors.details.message}</span>}
            </div>

            <button
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <>
                        Review & Pay <ArrowRight size={20} />
                    </>
                )}
            </button>
        </form>
    );
}
