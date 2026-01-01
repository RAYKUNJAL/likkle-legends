"use client";

import { useState } from 'react';
import { Download, Share2, Loader2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFShareProps {
    childName: string;
    stats: {
        totalXP: number;
        level: string;
        levelIcon: string;
        storiesRead: number;
        songsListened: number;
        streak: number;
        patoisWords: string[];
        badges: { name: string; icon: string }[];
    };
    className?: string;
}

export default function PDFShare({ childName, stats, className = '' }: PDFShareProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isShared, setIsShared] = useState(false);

    const generatePDF = async (): Promise<Blob> => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();

        // Colors
        const primaryColor = '#FF6B35';
        const deepColor = '#1E3A44';

        // Header
        pdf.setFillColor(30, 58, 68); // deep color
        pdf.rect(0, 0, pageWidth, 40, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Likkle Legends', pageWidth / 2, 18, { align: 'center' });

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Progress Report', pageWidth / 2, 28, { align: 'center' });

        // Child Info Section
        pdf.setTextColor(30, 58, 68);
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${childName}'s Journey`, pageWidth / 2, 60, { align: 'center' });

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Level: ${stats.levelIcon} ${stats.level}`, pageWidth / 2, 72, { align: 'center' });

        // Stats Grid
        const startY = 90;
        const boxWidth = 45;
        const boxHeight = 35;
        const gap = 5;
        const startX = (pageWidth - (boxWidth * 4 + gap * 3)) / 2;

        const statBoxes = [
            { label: 'Total XP', value: stats.totalXP.toLocaleString(), emoji: '⭐' },
            { label: 'Stories', value: stats.storiesRead.toString(), emoji: '📚' },
            { label: 'Songs', value: stats.songsListened.toString(), emoji: '🎵' },
            { label: 'Streak', value: `${stats.streak} days`, emoji: '🔥' },
        ];

        statBoxes.forEach((stat, i) => {
            const x = startX + (boxWidth + gap) * i;

            // Box background
            pdf.setFillColor(255, 247, 237); // Warm background
            pdf.roundedRect(x, startY, boxWidth, boxHeight, 3, 3, 'F');

            // Emoji
            pdf.setFontSize(20);
            pdf.text(stat.emoji, x + boxWidth / 2, startY + 14, { align: 'center' });

            // Value
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 58, 68);
            pdf.text(stat.value, x + boxWidth / 2, startY + 24, { align: 'center' });

            // Label
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text(stat.label, x + boxWidth / 2, startY + 31, { align: 'center' });
        });

        // Badges Section
        if (stats.badges.length > 0) {
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 58, 68);
            pdf.text('Badges Earned', pageWidth / 2, startY + 50, { align: 'center' });

            const badgeY = startY + 60;
            const badgeSize = 20;
            const badgeGap = 5;
            const totalBadgeWidth = stats.badges.slice(0, 5).length * (badgeSize + badgeGap);
            let badgeX = (pageWidth - totalBadgeWidth) / 2;

            stats.badges.slice(0, 5).forEach((badge) => {
                pdf.setFillColor(255, 243, 224);
                pdf.roundedRect(badgeX, badgeY, badgeSize, badgeSize, 2, 2, 'F');
                pdf.setFontSize(12);
                pdf.text(badge.icon, badgeX + badgeSize / 2, badgeY + 14, { align: 'center' });
                badgeX += badgeSize + badgeGap;
            });
        }

        // Patois Words Section
        if (stats.patoisWords.length > 0) {
            const patoisY = startY + 90;
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 58, 68);
            pdf.text('Patois Words Learned', pageWidth / 2, patoisY, { align: 'center' });

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            const wordsText = stats.patoisWords.slice(0, 10).join(' • ');
            pdf.text(wordsText, pageWidth / 2, patoisY + 10, { align: 'center', maxWidth: pageWidth - 40 });
        }

        // Footer
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
            `Generated on ${new Date().toLocaleDateString()} | likkle-legends.com`,
            pageWidth / 2,
            280,
            { align: 'center' }
        );

        return pdf.output('blob');
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const pdfBlob = await generatePDF();
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${childName}-likkle-legends-progress.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        setIsGenerating(true);
        try {
            const pdfBlob = await generatePDF();
            const file = new File([pdfBlob], `${childName}-progress.pdf`, { type: 'application/pdf' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `${childName}'s Likkle Legends Progress`,
                    text: `Check out ${childName}'s learning journey on Likkle Legends! 🌴`,
                    files: [file],
                });
                setIsShared(true);
                setTimeout(() => setIsShared(false), 2000);
            } else {
                // Fallback to download
                handleDownload();
            }
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Share failed:', error);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={`flex gap-3 ${className}`}>
            <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
                {isGenerating ? (
                    <Loader2 className="animate-spin" size={18} />
                ) : (
                    <Download size={18} />
                )}
                Download PDF
            </button>

            <button
                onClick={handleShare}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
                {isShared ? (
                    <>
                        <Check size={18} />
                        Shared!
                    </>
                ) : isGenerating ? (
                    <Loader2 className="animate-spin" size={18} />
                ) : (
                    <>
                        <Share2 size={18} />
                        Share Progress
                    </>
                )}
            </button>
        </div>
    );
}
