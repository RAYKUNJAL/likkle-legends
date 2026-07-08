"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Zap,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Gift,
  ChevronDown,
  Volume2,
  Clock,
  Target,
  Award,
  CheckCircle,
  X,
} from "lucide-react";
import { trackEvent, useScrollTracking, fireConversionEvent } from "@/lib/analytics";

// Lazy load heavier components
const ExitIntentModal = dynamic(() => import("@/components/ExitIntentModal"), {
  ssr: false,
});

// ============================================================================
// Section 1: Above-the-Fold Hero
// ============================================================================
function HeroSection() {
  const handlePlayFree = () => {
    trackEvent("cta_click_hero", { section: "hero", button: "play_free_game" });
    fireConversionEvent("view_item", {
      content_name: "Free Game Preview",
      content_category: "game",
    });
    window.location.href = "/play";
  };

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-b from-cyan-50 via-white to-emerald-50 overflow-hidden pt-20 pb-12">
      {/* Background Caribbean Illustration */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
        <svg viewBox="0 0 1200 800" className="w-full h-full">
          <defs>
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
          </defs>
          <circle cx="200" cy="400" r="80" fill="#34D399" opacity="0.6" />
          <circle cx="900" cy="300" r="100" fill="#34D399" opacity="0.5" />
          <ellipse cx="600" cy="600" rx="120" ry="60" fill="#34D399" opacity="0.4" />
          <rect x="0" y="650" width="1200" height="150" fill="url(#oceanGrad)" opacity="0.3" />
        </svg>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-40 h-40 bg-cyan-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-emerald-300/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Countdown Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 border border-red-300"
          >
            <Gift className="w-4 h-4 text-red-600" />
            <span className="text-sm font-bold text-red-700">
              Limited time: 7-day free trial + $10 intro pass
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight"
          >
            Caribbean Kids Learning Games
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-600">
              + Books That Actually Work
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto"
          >
            3-9 year olds learn faster. Parents sleep better.{" "}
            <strong>100% COPPA Safe.</strong>
          </motion.p>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-semibold text-slate-700"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              COPPA Compliant
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-600" />
              No Ads
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-500" />
              Parent Controlled
            </div>
          </motion.div>

          {/* Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <button
              onClick={handlePlayFree}
              data-test-variant="hero-cta-primary"
              className="px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 group"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Play Free Game Now
            </button>
            <button
              onClick={() => {
                trackEvent("cta_click_hero", {
                  section: "hero",
                  button: "learn_more",
                });
                document
                  .querySelector("#how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 sm:px-10 sm:py-5 bg-white border-2 border-slate-300 text-slate-900 font-bold text-lg rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
            >
              Learn More
            </button>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-slate-600"
          >
            First level unlocks immediately. Sign up takes 60 seconds.
          </motion.p>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-cyan-600" />
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Section 2: Video/Game Preview
// ============================================================================
function GamePreviewSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section
      id="game-preview"
      className="py-16 sm:py-20 bg-white px-4 sm:px-6"
    >
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <p className="text-sm font-bold text-cyan-600 uppercase tracking-widest">
              See It In Action
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Your child plays. You see the magic happen.
            </h2>
          </div>

          {/* Preview Container */}
          <div className="relative bg-gradient-to-b from-cyan-50 to-emerald-50 rounded-2xl overflow-hidden aspect-video shadow-2xl border border-slate-200">
            {/* Placeholder for game preview - replace with actual game embed */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-400/20 to-emerald-400/20">
              <button
                onClick={() => {
                  setIsPlaying(true);
                  trackEvent("game_preview_play", { section: "game_preview" });
                }}
                className="flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all"
                data-test-variant="game-preview-play"
              >
                <Play className="w-10 h-10 text-cyan-600 ml-1" />
              </button>
            </div>

            {/* Animated Island Preview Background */}
            <svg
              className="absolute inset-0 w-full h-full opacity-10"
              viewBox="0 0 800 600"
            >
              <circle cx="200" cy="300" r="60" fill="#0891B2" opacity="0.3" />
              <circle cx="600" cy="250" r="80" fill="#34D399" opacity="0.3" />
            </svg>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: BookOpen,
                title: "Learns Caribbean culture",
              },
              {
                icon: Target,
                title: "Improves reading skills",
              },
              {
                icon: Clock,
                title: "Fun 10-min levels",
              },
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <benefit.icon className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <p className="font-semibold text-slate-700 text-sm">
                  {benefit.title}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Section 3: Social Proof
// ============================================================================
function SocialProofSection() {
  const testimonials = [
    {
      name: "Maria D.",
      avatar: "https://i.pravatar.cc/100?img=47",
      rating: 5,
      quote:
        "My daughter actually wants to read now! The Caribbean stories connect with her in ways other apps don't.",
    },
    {
      name: "David M.",
      avatar: "https://i.pravatar.cc/100?img=48",
      rating: 5,
      quote:
        "I love that there are no ads, no data selling, just pure education. As a parent, I can finally relax.",
    },
    {
      name: "Amara K.",
      avatar: "https://i.pravatar.cc/100?img=49",
      rating: 5,
      quote:
        "The progress dashboard shows exactly what my kids are learning. No guessing games for parents.",
    },
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { stat: "10,000+", label: "Kids Learning" },
              { stat: "97%", label: "Parents Renew" },
              { stat: "4.9/5", label: "App Rating" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-6 bg-white/10 rounded-lg backdrop-blur border border-white/20"
              >
                <div className="text-3xl sm:text-4xl font-black text-cyan-400">
                  {item.stat}
                </div>
                <div className="text-sm font-semibold text-slate-300 mt-2">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Rotating Testimonials */}
          <div className="space-y-6">
            <div className="relative bg-white/10 backdrop-blur rounded-xl p-8 border border-white/20 min-h-[200px] flex flex-col justify-between">
              {/* Testimonial Content */}
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({
                    length: testimonials[activeTestimonial].rating,
                  }).map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>

                <p className="text-lg italic text-slate-100">
                  "{testimonials[activeTestimonial].quote}"
                </p>
              </motion.div>

              {/* Author */}
              <div className="flex items-center gap-3 mt-6">
                <img
                  src={testimonials[activeTestimonial].avatar}
                  alt={testimonials[activeTestimonial].name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-bold text-white">
                    {testimonials[activeTestimonial].name}
                  </p>
                  <p className="text-sm text-slate-300">Parent</p>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-3">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTestimonial(idx);
                    trackEvent("testimonial_view", {
                      index: idx,
                      name: testimonials[idx].name,
                    });
                  }}
                  data-test-variant={`testimonial-dot-${idx}`}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeTestimonial === idx
                      ? "bg-cyan-400 w-8"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Section 4: The Problem
// ============================================================================
function ProblemSection() {
  const problems = [
    {
      icon: X,
      problem: "Ads & predatory monetization",
      solution: "COPPA Safe, Ad-Free",
    },
    {
      icon: Zap,
      problem: "Kids play for hours mindlessly",
      solution: "15-min balanced sessions",
    },
    {
      icon: Eye,
      problem: "Parents have zero visibility",
      solution: "Weekly progress emails",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-red-50 px-4 sm:px-6" id="the-problem">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Online games trap kids. We do the opposite.
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Other platforms are designed to addict. We're designed to educate.
            </p>
          </div>

          {/* Problems Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {problems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-4 p-6 bg-white rounded-xl border border-red-200 shadow-sm"
              >
                {/* Problem */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <X className="w-5 h-5 font-bold" />
                    <p className="font-bold text-slate-900">{item.problem}</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-400 rotate-90" />
                </div>

                {/* Solution */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                    <p className="font-bold text-slate-900">
                      {item.solution}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Helper Eye Icon
function Eye({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

// ============================================================================
// Section 5: The Solution (Features)
// ============================================================================
function SolutionSection() {
  const features = [
    {
      icon: Zap,
      title: "Game Suite",
      description: "5 games (reading, math, culture, creativity, kitchen)",
    },
    {
      icon: BookOpen,
      title: "Offline Books",
      description: "50+ Caribbean stories",
    },
    {
      icon: BarChart3,
      title: "Progress Dashboard",
      description: "See exactly what they learned",
    },
    {
      icon: Settings,
      title: "Parent Controls",
      description: "Set screen time, manage access",
    },
    {
      icon: Gift,
      title: "Cultural Learning",
      description: "Celebrate Caribbean heritage",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <p className="text-sm font-bold text-cyan-600 uppercase tracking-widest">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Meet Your Island. Learn Your Way.
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="p-6 bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-xl border border-cyan-200 hover:shadow-lg transition-shadow"
              >
                <feature.icon className="w-8 h-8 text-cyan-600 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Section 6: Age-Based Game Preview
// ============================================================================
function AgeBasedGameSection() {
  const ageGroups = [
    {
      ageRange: "3-5 years",
      game: "Tanty's Kitchen",
      skills: ["Colors", "Counting", "Culture"],
      time: "5-10 min",
      image: "🍳",
    },
    {
      ageRange: "6-8 years",
      game: "Math Market",
      skills: ["Math", "Money", "Problem Solving"],
      time: "10-15 min",
      image: "🏪",
    },
    {
      ageRange: "9+ years",
      game: "Island Hop",
      skills: ["Reading", "Geography", "Strategy"],
      time: "15-20 min",
      image: "🏝️",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-slate-50 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <p className="text-sm font-bold text-cyan-600 uppercase tracking-widest">
              Games for Every Age
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Perfect Games for Every Stage
            </h2>
          </div>

          {/* Age Group Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {ageGroups.map((group, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Game Icon */}
                <div className="bg-gradient-to-br from-cyan-100 to-emerald-100 p-8 text-center text-6xl">
                  {group.image}
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest">
                    {group.ageRange}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900">
                    {group.game}
                  </h3>

                  {/* Skills */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 uppercase">
                      Skills Learned
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.skills.map((skill, sidx) => (
                        <span
                          key={sidx}
                          className="px-2 py-1 bg-slate-100 text-xs font-semibold text-slate-700 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    {group.time} per session
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => {
                      trackEvent("try_game_click", {
                        game: group.game,
                        ageRange: group.ageRange,
                      });
                      window.location.href = "/play";
                    }}
                    data-test-variant={`try-game-${idx}`}
                    className="w-full mt-6 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Try Free
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Continue in next chunk...

// ============================================================================
// Section 7: Pricing Table (CRO Optimized)
// ============================================================================
function PricingSection() {
  const handlePricingCTA = (tier: string) => {
    trackEvent("pricing_cta_click", {
      tier,
      section: "pricing",
    });
    fireConversionEvent("begin_checkout", {
      content_name: `${tier} Plan`,
      content_category: "subscription",
    });
    window.location.href = `/signup?plan=${tier.toLowerCase()}`;
  };

  const tiers = [
    {
      name: "FREE FOREVER",
      price: "$0",
      priceNote: "",
      features: [
        "2 games",
        "Limited stories",
        "Basic dashboard",
      ],
      cta: "Start Free",
      highlight: false,
      ctaVariant: "ghost",
    },
    {
      name: "LEGEND INTRO",
      price: "$10",
      priceNote: "intro, then $4.99/mo",
      features: [
        "All 5 games",
        "50+ stories",
        "Parent dashboard",
        "Screen time controls",
        "7-day free trial",
      ],
      cta: "7-Day Free Trial",
      highlight: true,
      ctaVariant: "primary",
      badge: "MOST POPULAR",
    },
    {
      name: "LEGENDS PLUS",
      price: "$19.99",
      priceNote: "/month",
      features: [
        "Everything in Intro",
        "No ads",
        "Priority support",
        "Custom stories",
        "Advanced analytics",
      ],
      cta: "7-Day Free Trial",
      highlight: false,
      ctaVariant: "secondary",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-900 text-white px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <p className="text-sm font-bold text-cyan-400 uppercase tracking-widest">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-black">
              Plans for Every Family
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Choose what works best for your family. No credit card needed.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {tiers.map((tier, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative rounded-xl p-8 border transition-all ${
                  tier.highlight
                    ? "bg-gradient-to-br from-cyan-600 to-cyan-700 border-cyan-400 shadow-2xl scale-105"
                    : "bg-slate-800 border-slate-700 hover:border-slate-600"
                }`}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-yellow-400 text-slate-900 font-bold text-xs rounded-full">
                      ⭐ {tier.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Tier Name */}
                  <h3 className="text-xl font-black uppercase tracking-wider">
                    {tier.name}
                  </h3>

                  {/* Price */}
                  <div className="space-y-1">
                    <div className="text-4xl font-black">{tier.price}</div>
                    {tier.priceNote && (
                      <p className="text-sm opacity-90">{tier.priceNote}</p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {tier.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handlePricingCTA(tier.name)}
                    data-test-variant={`pricing-cta-${idx}`}
                    className={`w-full py-3 font-bold rounded-lg transition-all ${
                      tier.highlight
                        ? "bg-white text-cyan-700 hover:bg-slate-100"
                        : "bg-slate-700 text-white hover:bg-slate-600 border border-slate-600"
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Guarantee */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-3 p-6 bg-slate-800/50 rounded-lg border border-slate-700"
          >
            <p className="font-bold text-cyan-400">✓ 30-Day Money-Back Guarantee</p>
            <p className="text-sm text-slate-300">
              Not happy? Full refund, no questions asked. Your satisfaction is our priority.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Section 8: FAQ
// ============================================================================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "Is this actually COPPA compliant?",
      answer:
        "Yes. We're fully COPPA compliant and regularly audited. We don't collect, sell, or share any personal data from children. Parents have complete control over what data is collected.",
    },
    {
      question: "Will my child be safe?",
      answer:
        "Absolutely. No ads, no third-party tracking, no predatory monetization. Every feature is designed with child safety as the priority. We also provide parent controls and optional privacy settings.",
    },
    {
      question: "How much screen time should my kid play?",
      answer:
        "We recommend 15-20 minutes per day for optimal learning. The games are designed in short bursts to prevent fatigue and maintain focus. Parents can set daily limits through parent controls.",
    },
    {
      question: "Can I see what they're learning?",
      answer:
        "Yes! Weekly progress emails show exactly what skills were practiced, games played, and reading completed. The parent dashboard breaks down progress by subject, age level, and skill category.",
    },
    {
      question: "What if I want to cancel?",
      answer:
        "Cancel anytime, no penalties. If you cancel within 30 days, we'll refund your payment. Your child's data is yours to download, and we'll delete everything else after 90 days.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white px-4 sm:px-6">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <p className="text-sm font-bold text-cyan-600 uppercase tracking-widest">
              Questions?
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() => {
                    setOpenIndex(openIndex === idx ? -1 : idx);
                    trackEvent("faq_toggle", {
                      question: faq.question,
                      open: openIndex !== idx,
                    });
                  }}
                  data-test-variant={`faq-toggle-${idx}`}
                  className="w-full text-left p-5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-600 transition-transform ${
                        openIndex === idx ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {openIndex === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-5 bg-white border border-t-0 border-slate-200 rounded-b-lg text-slate-700"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Section 9: Final CTA
// ============================================================================
function FinalCTASection() {
  const handleFinalCTA = () => {
    trackEvent("cta_click_final", { section: "final_cta" });
    fireConversionEvent("view_item", {
      content_name: "Final CTA - Start Free Game",
      content_category: "call-to-action",
    });
    window.location.href = "/play";
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-r from-cyan-600 via-cyan-500 to-emerald-500 text-white px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center space-y-8"
        >
          <h2 className="text-4xl sm:text-5xl font-black leading-tight">
            Your kid's island magic awaits.
          </h2>

          <p className="text-lg sm:text-xl opacity-95 max-w-lg mx-auto">
            Join 10,000+ Caribbean families. Free 7-day trial. No credit card needed. Cancel anytime.
          </p>

          <button
            onClick={handleFinalCTA}
            data-test-variant="final-cta-button"
            className="px-8 py-4 sm:px-12 sm:py-6 bg-white text-cyan-700 font-bold text-lg sm:text-xl rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3 group"
          >
            <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Start Free Game Now
          </button>

          <p className="text-sm opacity-90">
            First level unlocks immediately. Sign up takes 60 seconds.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Main Landing Page Component
// ============================================================================
export default function LandingPageV4() {
  // Track scroll depth
  useScrollTracking();

  // Track page view
  useEffect(() => {
    trackEvent("landing_page_view", {
      version: "v4",
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <main className="overflow-hidden">
      <HeroSection />
      <GamePreviewSection />
      <SocialProofSection />
      <ProblemSection />
      <SolutionSection />
      <AgeBasedGameSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />

      {/* Exit Intent Modal - Lazy loaded */}
      <ExitIntentModal />
    </main>
  );
}
