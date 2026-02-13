'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { PlusCircle, Loader2 } from 'lucide-react';

export function AchievementForm({ onCreated }: { onCreated: () => void }) {
    const { data: session } = useSession();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.name) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/achievements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                }),
            });

            if (response.ok) {
                setTitle('');
                setDescription('');
                onCreated();
            }
        } catch (error) {
            console.error('Failed to create achievement:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                新しい実績を登録
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        タイトル
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="例: React 開発 3年の経験"
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        説明 / 証拠の概要
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="GitHubリポジトリのURLや、担当したプロジェクトの概要"
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting || !session}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            登録中...
                        </>
                    ) : (
                        '実績を登録する'
                    )}
                </button>
            </form>
        </div>
    );
}
