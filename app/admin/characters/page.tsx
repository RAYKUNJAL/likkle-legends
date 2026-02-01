"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, SearchBar, Modal, FileUpload, StatusBadge,
    Plus, Edit, Trash2, Palette
} from '@/components/admin/AdminComponents';
import { getCharacters, createCharacter, updateCharacter } from '@/lib/database';
import { uploadFile, BUCKETS } from '@/lib/storage';

interface Character {
    id: string;
    name: string;
    role: string;
    tagline: string;
    description: string;
    personality_traits: string[];
    image_url: string;
    model_3d_url?: string;
    voice_id?: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
}

export default function AdminCharactersPage() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
    const [formData, setFormData] = useState<{
        id?: string;
        name: string;
        role: string;
        tagline: string;
        description: string;
        personality_traits: string[];
        image_url: string;
        model_3d_url: string;
        voice_id: string;
        is_active: boolean;
    }>({
        name: '',
        role: '',
        tagline: '',
        description: '',
        personality_traits: [],
        image_url: '',
        model_3d_url: '',
        voice_id: '',
        is_active: true,
    });
    const [newTrait, setNewTrait] = useState('');

    useEffect(() => {
        loadCharacters();
    }, []);

    const loadCharacters = async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { getAdminCharacters } = await import('@/app/actions/admin');
            const data = await getAdminCharacters(session.access_token);
            setCharacters(data as Character[]);
        } catch (error) {
            console.error('Failed to load characters:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', BUCKETS.CHARACTERS);

        try {
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const result = await response.json();
            if (response.ok && result.url) {
                setFormData(prev => ({ ...prev, image_url: result.url }));
            } else {
                console.error('Upload failed:', result.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
        }
    };

    const handleModelUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', BUCKETS.AR_MODELS);

        try {
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const result = await response.json();
            if (response.ok && result.url) {
                setFormData(prev => ({ ...prev, model_3d_url: result.url }));
            } else {
                console.error('Upload failed:', result.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
        }
    };

    const addTrait = () => {
        if (newTrait.trim() && !formData.personality_traits.includes(newTrait.trim())) {
            setFormData(prev => ({
                ...prev,
                personality_traits: [...prev.personality_traits, newTrait.trim()],
            }));
            setNewTrait('');
        }
    };

    const removeTrait = (trait: string) => {
        setFormData(prev => ({
            ...prev,
            personality_traits: prev.personality_traits.filter(t => t !== trait),
        }));
    };

    const handleSubmit = async () => {
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { saveAdminCharacter } = await import('@/app/actions/admin');

            const dataToSave = { ...formData };
            if (editingCharacter) dataToSave.id = editingCharacter.id;

            await saveAdminCharacter(session.access_token, dataToSave);

            setShowModal(false);
            setEditingCharacter(null);
            resetForm();
            loadCharacters();
        } catch (error) {
            console.error('Failed to save character:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            role: '',
            tagline: '',
            description: '',
            personality_traits: [],
            image_url: '',
            model_3d_url: '',
            voice_id: '',
            is_active: true,
        });
    };

    const openEditModal = (character: Character) => {
        setEditingCharacter(character);
        setFormData({
            name: character.name,
            role: character.role || '',
            tagline: character.tagline || '',
            description: character.description || '',
            personality_traits: character.personality_traits || [],
            image_url: character.image_url || '',
            model_3d_url: character.model_3d_url || '',
            voice_id: character.voice_id || '',
            is_active: character.is_active,
        });
        setShowModal(true);
    };

    const filteredCharacters = characters.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout activeSection="characters">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Characters</h1>
                        <p className="text-gray-500">Manage your Likkle Legends characters and their assets</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setEditingCharacter(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={20} />
                        Add Character
                    </button>
                </div>
            </header>

            <div className="p-8">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search characters..."
                    onRefresh={loadCharacters}
                />

                {/* Character Grid */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                                <div className="w-full h-48 bg-gray-100 rounded-xl mb-4" />
                                <div className="h-6 bg-gray-100 rounded mb-2" />
                                <div className="h-4 bg-gray-100 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : filteredCharacters.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Palette className="text-gray-400" size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Characters Yet</h3>
                        <p className="text-gray-500 mb-6">Upload your custom characters to get started</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold"
                        >
                            <Plus size={20} />
                            Add First Character
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCharacters.map((character) => (
                            <div
                                key={character.id}
                                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all group"
                            >
                                {/* Character Image */}
                                <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-secondary/10">
                                    {character.image_url ? (
                                        <img
                                            src={character.image_url}
                                            alt={character.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Palette className="text-primary/30" size={64} />
                                        </div>
                                    )}

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => openEditModal(character)}
                                            className="p-3 bg-white rounded-xl hover:bg-gray-100 transition-colors"
                                            aria-label="Edit character"
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            className="p-3 bg-white rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                                            aria-label="Delete character"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4">
                                        <StatusBadge
                                            status={character.is_active ? 'Active' : 'Inactive'}
                                            variant={character.is_active ? 'success' : 'default'}
                                        />
                                    </div>

                                    {/* 3D Model Badge */}
                                    {character.model_3d_url && (
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                                                3D AR Ready
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Character Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-black text-gray-900 mb-1">{character.name}</h3>
                                    <p className="text-sm text-primary font-bold mb-2">{character.role}</p>
                                    {character.tagline && (
                                        <p className="text-gray-500 italic text-sm mb-3">"{character.tagline}"</p>
                                    )}
                                    {character.personality_traits && character.personality_traits.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {character.personality_traits.slice(0, 3).map((trait, i) => (
                                                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                    {trait}
                                                </span>
                                            ))}
                                            {character.personality_traits.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-400 text-xs rounded-full">
                                                    +{character.personality_traits.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Character Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingCharacter(null); resetForm(); }}
                title={editingCharacter ? 'Edit Character' : 'Add New Character'}
                size="xl"
            >
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column - Image */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Character Image *</label>
                        {formData.image_url ? (
                            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg"
                                    aria-label="Remove image"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            <FileUpload
                                accept="image/png,image/jpeg,image/webp"
                                onUpload={handleImageUpload}
                                label="Upload Character Image"
                                description="PNG, JPG, WebP"
                                maxSize={10}
                            />
                        )}

                        <div className="mt-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">3D Model (for AR)</label>
                            <FileUpload
                                accept=".glb,.gltf"
                                onUpload={handleModelUpload}
                                label="Upload 3D Model"
                                description="GLB or GLTF file"
                                maxSize={50}
                            />
                            {formData.model_3d_url && (
                                <p className="text-xs text-green-600 mt-2">✓ 3D model uploaded</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="e.g., Tanty Spice"
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                            <input
                                id="role"
                                type="text"
                                value={formData.role}
                                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="e.g., Feelings Coach"
                            />
                        </div>

                        <div>
                            <label htmlFor="tagline" className="block text-sm font-bold text-gray-700 mb-2">Tagline</label>
                            <input
                                id="tagline"
                                type="text"
                                value={formData.tagline}
                                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="e.g., Fix your face, little one!"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                rows={3}
                                placeholder="Describe the character's personality and role..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Personality Traits</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newTrait}
                                    onChange={(e) => setNewTrait(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTrait()}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Add a trait..."
                                    aria-label="New personality trait"
                                />
                                <button
                                    onClick={addTrait}
                                    className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.personality_traits.map((trait, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                    >
                                        {trait}
                                        <button onClick={() => removeTrait(trait)} className="hover:text-red-500" aria-label={`Remove ${trait}`}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="voice_id" className="block text-sm font-bold text-gray-700 mb-2">ElevenLabs Voice ID</label>
                            <input
                                id="voice_id"
                                type="text"
                                value={formData.voice_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, voice_id: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Paste voice ID from ElevenLabs..."
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="w-5 h-5 rounded"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                Character is active and visible
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                    <button
                        onClick={() => { setShowModal(false); setEditingCharacter(null); resetForm(); }}
                        className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!formData.name || !formData.image_url}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {editingCharacter ? 'Save Changes' : 'Create Character'}
                    </button>
                </div>
            </Modal>
        </AdminLayout>
    );
}
