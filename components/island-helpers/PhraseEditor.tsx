"use client";

import React, { useEffect, useState } from 'react';
import { LANDING_CAST } from '@/lib/landing-cast';
import {
  addCustomPhrase,
  getBoard,
  removePhrase,
  subscribePhrases,
  updateCustomPhrase,
  type PhraseCard,
} from '@/lib/island-helpers/phrases';
import { ISLAND_HELPERS_CHARACTER_IDS, type IslandHelpersCharacterId } from '@/lib/island-helpers/types';

export function PhraseEditor() {
  const [cards, setCards] = useState<PhraseCard[]>([]);
  const [characterId, setCharacterId] = useState<IslandHelpersCharacterId>('tanty_spice');
  const [text, setText] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = () => setCards(getBoard().cards);

  useEffect(() => {
    refresh();
    return subscribePhrases(refresh);
  }, []);

  const customs = cards.filter((c) => c.source === 'custom' && c.characterId === characterId);
  const seeds = cards.filter((c) => c.source === 'seed' && c.characterId === characterId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        updateCustomPhrase(editingId, { text, imageSrc });
        setEditingId(null);
      } else {
        addCustomPhrase({ characterId, text, imageSrc: imageSrc || undefined });
      }
      setText('');
      setImageSrc('');
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save phrase');
    }
  };

  return (
    <div className="space-y-6" id="ih-phrase-editor">
      <div className="flex flex-wrap gap-2">
        {ISLAND_HELPERS_CHARACTER_IDS.map((id) => {
          const cast = LANDING_CAST.find((c) => c.id === id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => setCharacterId(id)}
              className={`rounded-full px-3 py-1.5 text-sm font-black ${
                characterId === id ? 'bg-amber-400 text-blue-950' : 'bg-blue-50 text-blue-800'
              }`}
            >
              {cast?.name || id}
            </button>
          );
        })}
      </div>

      <form onSubmit={onSubmit} className="space-y-3 rounded-3xl border-2 border-amber-100 bg-white p-4">
        <label className="block text-sm font-black text-blue-900">
          Phrase text
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            placeholder="I need a hug."
            className="mt-1 w-full rounded-2xl border-2 border-blue-100 px-4 py-3 text-base font-bold text-blue-950 outline-none focus:border-amber-400"
          />
        </label>
        <label className="block text-sm font-black text-blue-900">
          Optional image URL
          <input
            value={imageSrc}
            onChange={(e) => setImageSrc(e.target.value)}
            placeholder="https://…"
            className="mt-1 w-full rounded-2xl border-2 border-blue-100 px-4 py-3 text-sm font-semibold text-blue-950 outline-none focus:border-amber-400"
          />
        </label>
        {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-blue-950"
          >
            {editingId ? 'Save changes' : 'Add phrase'}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setText('');
                setImageSrc('');
              }}
              className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-800"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div>
        <h4 className="font-black text-blue-950 mb-2">Your custom phrases</h4>
        {customs.length === 0 ? (
          <p className="text-sm font-semibold text-blue-700/70">None yet — add one above.</p>
        ) : (
          <ul className="space-y-2">
            {customs.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-3"
              >
                <span className="font-bold text-blue-950">{c.text}</span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="text-sm font-black text-amber-700"
                    onClick={() => {
                      setEditingId(c.id);
                      setText(c.text);
                      setImageSrc(c.imageSrc || '');
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-sm font-black text-red-600"
                    onClick={() => {
                      removePhrase(c.id);
                      refresh();
                    }}
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="font-black text-blue-950 mb-2">Starter phrases (locked)</h4>
        <ul className="space-y-1">
          {seeds.map((s) => (
            <li key={s.id} className="rounded-xl bg-blue-50/80 px-3 py-2 text-sm font-semibold text-blue-900/80">
              {s.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
