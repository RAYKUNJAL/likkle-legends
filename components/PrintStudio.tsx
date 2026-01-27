"use client";

import { useState } from 'react';
import { Download, Printer, BookOpen, Crown, Sticker, FileText, Check, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface PrintStudioProps {
    mode: 'story_book' | 'certificate' | 'sticker_sheet' | 'report';
    data: {
        title?: string;     // For Story
        content?: string;   // For Story
        childName: string;
        milestone?: string; // For Certificate
        stats?: any;        // For Report
    };
    variant?: 'home_print' | 'pod_kdp' | 'digital';
    label?: string;
    className?: string;
}

export default function PrintStudio({ mode, data, variant = 'home_print', label, className = '' }: PrintStudioProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');

    const generatePDF = () => {
        // 1. Configure Layout based on Variant (Physical Synergy Module)
        let format = 'a4';
        let orientation: 'p' | 'l' = 'p';
        let width = 210;
        let height = 297;

        if (mode === 'certificate') {
            orientation = 'l';
        }

        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: format === 'custom' ? [width, height] : format
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // 2. Select Font (Asset Logic: Kid-friendly High-Contrast Serif)
        // jsPDF 'times' is a standard serif font accessible everywhere
        pdf.setFont('times', 'normal');

        // 3. Render Content Logic
        if (mode === 'story_book') {
            // COVER PAGE
            pdf.setFillColor(255, 107, 53); // Primary Color
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(36);
            pdf.setFont('times', 'bold');
            pdf.text(data.title || 'My Island Story', pageWidth / 2, pageHeight / 3, { align: 'center', maxWidth: pageWidth - 40 });

            pdf.setFontSize(18);
            pdf.text(`Written for ${data.childName}`, pageWidth / 2, pageHeight / 2, { align: 'center' });

            pdf.setFontSize(12);
            pdf.text('Likkle Legends Mail Club', pageWidth / 2, pageHeight - 20, { align: 'center' });

            // CONTENT PAGES
            if (data.content) {
                pdf.addPage();
                pdf.setTextColor(30, 30, 30);
                pdf.setFontSize(16); // High legibility
                pdf.setFont('times', 'normal');

                // Split content into paragraphs
                // Replace <br> or \n with newlines
                const cleanContent = data.content.replace(/✨/g, '').replace(/\[READING ASSISTANT TRIGGER\]/g, '');
                const paragraphs = cleanContent.split(/\n\n|\r\n\r\n/);

                let y = 30;
                const margin = 20;
                const maxWidth = pageWidth - (margin * 2);

                paragraphs.forEach((para) => {
                    const lines = pdf.splitTextToSize(para, maxWidth);
                    if (y + lines.length * 10 > pageHeight - 20) {
                        pdf.addPage();
                        y = 30;
                    }
                    pdf.text(lines, margin, y);
                    y += (lines.length * 10) + 10;
                });
            }

        } else if (mode === 'certificate') {
            // ISLAND GRADUATE CERTIFICATE
            // Border
            pdf.setLineWidth(3);
            pdf.setDrawColor(255, 107, 53); // Orange Border
            pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

            pdf.setLineWidth(1);
            pdf.setDrawColor(30, 58, 68); // Inner Blue Border
            pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

            // Title
            pdf.setFontSize(48);
            pdf.setFont('times', 'bold');
            pdf.setTextColor(30, 58, 68);
            pdf.text('ISLAND GRADUATE', pageWidth / 2, 60, { align: 'center' });

            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'normal'); // Sans-serif for secondary text
            pdf.setTextColor(100, 100, 100);
            pdf.text('This certifies that', pageWidth / 2, 85, { align: 'center' });

            // Name
            pdf.setFontSize(42);
            pdf.setFont('times', 'bolditalic');
            pdf.setTextColor(255, 107, 53); // Accent Color
            pdf.text(data.childName, pageWidth / 2, 110, { align: 'center' });

            // Milestone
            pdf.setFontSize(18);
            pdf.setTextColor(30, 58, 68);
            pdf.text('Has officially completed the milestone:', pageWidth / 2, 135, { align: 'center' });

            pdf.setFontSize(24);
            pdf.setFont('times', 'bold');
            pdf.text(data.milestone || 'Folklore Master', pageWidth / 2, 150, { align: 'center' });

            // Footer
            pdf.setFontSize(12);
            pdf.setTextColor(150, 150, 150);
            pdf.text(new Date().toLocaleDateString(), 40, 170);
            pdf.text('Tanty Spice', pageWidth - 60, 170);
            pdf.line(pageWidth - 80, 165, pageWidth - 40, 165); // Signature line
        } else if (mode === 'sticker_sheet') {
            // LEGENDS STICKER SHEET
            pdf.setFontSize(24);
            pdf.text('Legends Sticker Sheet', pageWidth / 2, 20, { align: 'center' });

            // Grid of Circles
            const radius = 25;
            const gap = 10;
            const startX = 30;
            const startY = 40;

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 4; j++) {
                    const cx = startX + (radius * 2 + gap) * i;
                    const cy = startY + (radius * 2 + gap) * j;

                    pdf.setDrawColor(200, 200, 200);
                    pdf.setLineWidth(0.5);
                    pdf.circle(cx, cy, radius);

                    pdf.setFontSize(10);
                    pdf.setTextColor(200, 200, 200);
                    pdf.text('Sticker', cx, cy, { align: 'center' });
                }
            }
        }

        return pdf.output('blob');
    };

    const handleAction = async () => {
        setIsGenerating(true);
        setStatus('generating');

        try {
            const blob = generatePDF();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            let filename = `likkle-${mode}.pdf`;
            if (data.childName) filename = `${data.childName}-${mode}.pdf`;

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatus('done');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (e) {
            console.error(e);
            setStatus('idle');
        } finally {
            setIsGenerating(false);
        }
    };

    // UI Configuration
    let Icon = Printer;
    let btnText = label || "Print";
    let btnClass = "bg-primary text-white hover:bg-primary/90";

    if (mode === 'story_book') {
        Icon = BookOpen;
        btnText = label || "Print Storybook";
    } else if (mode === 'certificate') {
        Icon = Crown;
        btnText = label || "Download Certificate";
        btnClass = "bg-green-600 text-white hover:bg-green-700";
    } else if (mode === 'sticker_sheet') {
        Icon = Sticker;
        btnText = label || "Get Stickers";
        btnClass = "bg-indigo-600 text-white hover:bg-indigo-700";
    }

    return (
        <button
            onClick={handleAction}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${btnClass} ${className}`}
        >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : status === 'done' ? <Check size={20} /> : <Icon size={20} />}
            <span>{status === 'done' ? 'Downloaded!' : btnText}</span>
        </button>
    );
}
