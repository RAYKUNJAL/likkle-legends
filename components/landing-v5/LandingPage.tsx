'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, BookOpen, Check, ChevronRight, Gamepad2, Headphones, Heart, Map, Menu, Music2, Printer, ShieldCheck, Sparkles, X } from 'lucide-react';
import { LANDING_CAST } from '@/lib/landing-cast';
import RadioShowcase from './RadioShowcase';
import styles from './landing.module.css';

const experiences = [
  { icon: BookOpen, title: 'Stories with island heart', description: 'Meet familiar characters, discover Caribbean tales, and make reading a shared adventure.', href: '/signup', label: 'Discover story time', image: '/images/child_reading.png' },
  { icon: Gamepad2, title: 'A whole island of play', description: 'Flags, food, and island discoveries turn a quick game into a little connection to home.', href: '/games', label: 'Play a free game', image: '/offer/hero-characters.png' },
  { icon: Printer, title: 'Big ideas. Little hands.', description: 'Take the adventure off screen with coloring, creative activities, and printable learning resources.', href: '/signup', label: 'Explore the learning club', image: '/images/flashcard-coloring.png' },
];
const plans = [
  { name: 'Digital Island Starter', price: '$10', cadence: 'planned offer', note: 'A first taste of island learning', href: '/signup?plan=digital_starter', features: ['Personalized starter activities', 'Stories, music & printable discovery', 'A parent-guided first adventure'] },
  { name: 'Legends Digital', price: '$20', cadence: 'planned offer', note: 'Keep their curiosity growing', href: '/signup?plan=legends_plus', features: ['A weekly learning journey', 'Digital stories, games & island radio', 'Parent progress view & character guides'] },
  { name: 'Legends Discovery Pack', price: '$25', cadence: 'planned offer', note: 'More island discoveries ahead', href: '/signup?plan=mail_club', features: ['Planned digital learning adventures', 'More digital learning resources', 'Activities to share as a family'] },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <header className={styles.header}>
        <div className={styles.navbar}>
          <Link href="/" className={styles.brand} aria-label="Likkle Legends home">
            <Image src="/images/logo.png" alt="" width={100} height={100} priority />
            <span>Likkle Legends<small>Little people. Big heritage.</small></span>
          </Link>
          <nav className={styles.desktopNav} aria-label="Main navigation">
            <a href="#journey">How it works</a><a href="#radio">Island radio</a><a href="#characters">Our characters</a><Link href="/games">Games</Link><Link href="/schools">Schools</Link><Link className={styles.login} href="/login">Log in</Link>
          </nav>
          <button className={styles.menuButton} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <nav id="mobile-navigation" className={styles.mobileNav} aria-label="Mobile navigation" onClick={() => setMenuOpen(false)}><a href="#journey">How it works</a><a href="#radio">Island radio</a><a href="#characters">Our characters</a><Link href="/games">Games</Link><Link href="/schools">Schools</Link><Link href="/login">Log in</Link></nav>}
      </header>
      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroArt}><Image src="/images/landing/family-cast-hero.webp" alt="A mother and two children learning together, surrounded by all seven Likkle Legends island characters" fill priority sizes="(max-width: 760px) 100vw, 62vw" className={styles.heroImage} /></div>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Big roots. Brighter futures.</p>
              <h1 id="hero-heading">Bring the<br /><span>Caribbean</span><br /><em>Home.</em></h1>
              <p className={styles.heroDescription}>Stories, games, <strong>island music</strong> and learning adventures. A little connection to home, wherever your family lives.</p>
              <div className={styles.heroActions}><Link className={styles.primaryButton} href="/signup?plan=free_trial">Start your 7-day trial <ArrowRight size={20} /></Link><a className={styles.secondaryButton} href="#radio"><Headphones size={20} /> Listen to island radio</a></div>
              <p className={styles.trust}>No card. No automatic charge. Keep your free account afterward.</p>
              <p className={styles.trust}><ShieldCheck size={17} /> Parent-guided <span>·</span> Ad-free <span>·</span> Ages 3–9</p>
            </div>
          </div>
        </section>
        <section id="journey" className={styles.journey} aria-labelledby="journey-heading">
          <div className={styles.container}>
            <h2 id="journey-heading">A brighter tomorrow in three little steps</h2>
            <div className={styles.steps}>
              {[{ icon: Map, title: 'Choose their island', text: 'Start with your family’s heritage—or a place your child is curious about.' }, { icon: Heart, title: 'Meet their island friends', text: 'A familiar cast makes stories, songs, and discoveries feel like home.' }, { icon: Sparkles, title: 'Grow with pride', text: 'Build a joyful routine around reading, play, music, and making.' }].map((step, i) => <div className={styles.step} key={step.title}><span className={styles.stepNumber}>{i + 1}</span><step.icon size={30} strokeWidth={1.7} /><div><h3>{step.title}</h3><p>{step.text}</p></div></div>)}
            </div>
          </div>
        </section>

        <RadioShowcase />

        <section id="characters" className={styles.characters} aria-labelledby="characters-heading">
          <div className={styles.container}>
            <div className={styles.sectionHeading}><p className={styles.eyebrow}>It takes a village</p><h2 id="characters-heading">A whole cast of island friends.</h2><p>The storytellers, rhythm-makers, curious explorers, and kind hearts of Likkle Legends. Every friend brings something special.</p></div>
            <div className={styles.castGrid}>
              {LANDING_CAST.map(character => <Dialog.Root key={character.id}><Dialog.Trigger asChild><button className={styles.characterCard} aria-label={`Meet ${character.name}`}><div className={styles.characterArt} style={{ backgroundColor: character.color }}><Image src={character.image} alt={character.name} fill sizes="(max-width: 600px) 44vw, (max-width: 1000px) 29vw, 20vw" className={styles.containedImage} /></div><div className={styles.characterCopy}><h3>{character.name}</h3><p>{character.role}</p><span>Meet your friend <ChevronRight size={16} /></span></div></button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className={styles.dialogOverlay} /><Dialog.Content className={styles.characterDialog}><Dialog.Close className={styles.closeButton} aria-label="Close character details"><X size={22} /></Dialog.Close><div className={styles.dialogArt} style={{ backgroundColor: character.color }}><Image src={character.image} alt={character.name} fill sizes="380px" className={styles.containedImage} /></div><div className={styles.dialogCopy}><p className={styles.eyebrow}>{character.role}</p><Dialog.Title>{character.name}</Dialog.Title><Dialog.Description>{character.description}</Dialog.Description><Link className={styles.primaryButton} href="/signup">Join the village <ArrowRight size={18} /></Link></div></Dialog.Content></Dialog.Portal></Dialog.Root>)}
              <article className={`${styles.characterCard} ${styles.mysteryCard}`} aria-labelledby="mystery-title">
                <div className={`${styles.characterArt} ${styles.mysteryArt}`}><Sparkles size={70} strokeWidth={1.25} aria-hidden="true" /><span>Coming soon</span></div>
                <div className={styles.characterCopy}><h3 id="mystery-title">Who’s next?</h3><p>Meet a new island friend every 1–2 months.</p><span>Our village keeps growing</span></div>
              </article>
            </div>
            <p className={styles.castReleaseNote}>Seven friends to meet today. More stories, discoveries, and special characters on the way.</p>
          </div>
        </section>

        <section className={styles.explore} aria-labelledby="explore-heading"><div className={styles.container}><div className={styles.sectionHeading}><p className={styles.eyebrow}>Explore. Learn. Belong.</p><h2 id="explore-heading">More ways to feel close to home.</h2><p>From a song in the car to a story at bedtime, make Caribbean culture part of their everyday.</p></div><div className={styles.experienceGrid}>{experiences.map(item => <article className={styles.experienceCard} key={item.title}><div className={styles.experienceArt}><Image src={item.image} alt="" fill sizes="(max-width: 760px) 90vw, 30vw" className={styles.containedImage} /></div><div className={styles.experienceCopy}><item.icon size={25} /><h3>{item.title}</h3><p>{item.description}</p><Link href={item.href}>{item.label} <ArrowRight size={18} /></Link></div></article>)}</div></div></section>

        <section className={styles.sampleSection}><div className={styles.sampleInner}><div><p className={styles.eyebrow}>Small moments. Lasting connections.</p><h2>What could their first week feel like?</h2><p>A story to share. A song to sing. Something to make. Something new to discover together.</p></div><div className={styles.sampleCard}><p className={styles.sampleLabel}>A sample island week</p><h3>One little adventure each day</h3><ul><li><BookOpen /><span><strong>Read together</strong>A Caribbean story with a familiar guide</span></li><li><Music2 /><span><strong>Sing & move</strong>Drinking Water on Likkle Legends Radio</span><a href="#radio" aria-label="Listen to island radio"><ArrowRight /></a></li><li><Gamepad2 /><span><strong>Play & discover</strong>A quick visit to the island arcade</span><Link href="/games" aria-label="Visit the island arcade"><ArrowRight /></Link></li><li><Printer /><span><strong>Make it your own</strong>A colorful activity away from the screen</span></li></ul><Link className={styles.primaryButton} href="/signup">Build their free journey <ArrowRight size={18} /></Link></div></div></section>

        <section id="plans" className={styles.plans}><div className={styles.container}><div className={styles.sectionHeading}><p className={styles.eyebrow}>Start free. Grow together.</p><h2>A little more island magic.</h2><p>Explore our free games while we prepare these digital offers. Paid checkout is not yet open.</p></div><div className={styles.planGrid}>{plans.map((plan, i) => <article key={plan.name} className={`${styles.planCard} ${i === 1 ? styles.featuredPlan : ''}`}><p className={styles.eyebrow}>{plan.note}</p><h3>{plan.name}</h3><div className={styles.price}>{plan.price}<span>{plan.cadence}</span></div><ul>{plan.features.map(feature => <li key={feature}><Check size={18} />{feature}</li>)}</ul><Link className={i === 1 ? styles.primaryButton : styles.secondaryButton} href={plan.href}>Start free <ArrowRight size={18} /></Link></article>)}</div></div></section>

        <section className={styles.finalCta}><p className={styles.eyebrow}>For little legends, everywhere</p><h2>Their roots travel with them.</h2><p>Let’s help them discover just how much there is to love.</p><Link className={styles.primaryButton} href="/signup">Start your family’s adventure <ArrowRight size={20} /></Link><Link className={styles.textLink} href="/games">Or play a free game first <ArrowRight size={16} /></Link></section>
      </main>
      <footer className={styles.footer}><div className={styles.container}><div><strong>Likkle Legends</strong><p>Little people. Big heritage.</p></div><nav aria-label="Footer navigation"><a href="#radio">Island radio</a><a href="#characters">Our characters</a><Link href="/games">Games</Link><Link href="/schools">Schools</Link><Link href="/safety">Child safety</Link><Link href="/privacy">Privacy</Link><Link href="/contact">Contact</Link></nav><p className={styles.copyright}>© {new Date().getFullYear()} Likkle Legends.</p></div></footer>
    </div>
  );
}
