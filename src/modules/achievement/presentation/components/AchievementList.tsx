'use client';

import React from 'react';
import { AchievementStatus } from '../../domain/models/Achievement';
import { CheckCircle2, Clock, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export function AchievementList({
    achievements,
    onVerify
}: {
    achievements: any[],
    onVerify: (id: string) => void
}) {
    if (achievements.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
                <p className="text-gray-500">登録された実績はまだありません。</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {achievements.map((achievement) => (
                <div key={achievement.id} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{achievement.title}</h3>
                            <StatusBadge status={achievement.status} />
                        </div>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{achievement.description}</p>

                        {achievement.proof && (
                            <div className="mt-3 flex items-center gap-2 text-xs font-mono bg-green-50 text-green-700 p-2 rounded border border-green-100">
                                <ShieldCheck className="w-4 h-4" />
                                <span>On-chain Proof: {achievement.proof.transactionHash.slice(0, 10)}...</span>
                                <a
                                    href={`https://base-sepolia.blockscout.com/tx/${achievement.proof.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-auto flex items-center gap-1 hover:underline"
                                >
                                    View <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {achievement.status === AchievementStatus.Draft && (
                            <button
                                onClick={() => onVerify(achievement.id)}
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium rounded-lg transition-colors text-sm"
                            >
                                検証を依頼する
                            </button>
                        )}
                        {achievement.status === AchievementStatus.Pending && (
                            <button
                                onClick={() => onVerify(achievement.id)} // 実際は運営がやるが、MVPデモ用
                                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 font-medium rounded-lg transition-colors text-sm flex items-center gap-1"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                承認してミントする (Admin)
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case AchievementStatus.Verified:
            return (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    証明済み
                </span>
            );
        case AchievementStatus.Pending:
            return (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    検証中
                </span>
            );
        case AchievementStatus.Rejected:
            return (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                    <AlertCircle className="w-3 h-3" />
                    拒否
                </span>
            );
        default:
            return (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                    下書き
                </span>
            );
    }
}
