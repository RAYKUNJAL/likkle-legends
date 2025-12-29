"use client";

import { useState, useEffect } from 'react';

export default function AnnouncementBar() {
    return (
        <div className="bg-deep text-white py-2 text-center text-sm font-bold tracking-tight px-4">
            <div className="container flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                <span>🎉 Limited Time: Get 15% OFF your first month with code <span className="text-secondary bg-white/10 px-2 py-0.5 rounded">LEGEND15</span></span>
                <div className="flex items-center gap-2">
                    <span className="text-white/60 font-normal">Offer ends in:</span>
                    <span className="text-secondary tabular-nums">11:45:02</span>
                </div>
            </div>
        </div>
    );
}
