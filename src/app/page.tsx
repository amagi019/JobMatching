'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { AchievementForm } from '@/modules/achievement/presentation/components/AchievementForm';
import { AchievementList } from '@/modules/achievement/presentation/components/AchievementList';
import { Briefcase, Trophy, Shield, Zap } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAchievements = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/achievements');
      const data = await res.json();
      setAchievements(data);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAchievements();
    } else {
      setIsLoading(false);
    }
  }, [status]);

  const handleVerify = async (id: string) => {
    const achievement = achievements.find((a: any) => a.id === id);
    if (!achievement) return;

    const action = achievement.status === 'Draft' ? 'apply' : 'mint';

    try {
      const res = await fetch('/api/achievements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        fetchAchievements();
      }
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col antialiased">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        {!session ? (
          <div className="max-w-4xl mx-auto text-center py-16 space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              あなたのスキルを<br />
              <span className="text-indigo-900 font-black">オンチェーンで証明</span>しよう
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              L1/L2 ネットワークを選択して、仕事の実績やスキルをNFTとして発行。
              信頼性の高いジョブマッチングを、Web3の技術で。
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <FeatureCard
                icon={<Shield className="w-8 h-8 text-indigo-500" />}
                title="改ざん不可能な実績"
                description="ブロックチェーンに実績を刻むことで、経歴詐称のない透明なキャリアを構築。"
              />
              <FeatureCard
                icon={<Zap className="w-8 h-8 text-purple-500" />}
                title="マルチチェーン対応"
                description="Ethereum (L1) だけでなく、Base や Polygon (L2) で安価に証明を発行可能。"
              />
              <FeatureCard
                icon={<Briefcase className="w-8 h-8 text-blue-500" />}
                title="直接マッチング"
                description="企業とワーカーが直接つながることで、不透明な手数料を排除し利益を最大化。"
                className="text-black"
              />
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border">
                    <img
                      src={`https://avatar.vercel.sh/${session.user?.name}`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">マイプロフィール</p>
                    <p className="font-bold truncate w-40">
                      {session.user?.name?.slice(0, 6)}...{session.user?.name?.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-4">
                  <span className="text-gray-500">証明済み実績</span>
                  <span className="font-bold text-indigo-600">
                    {achievements.filter((a: any) => a.status === 'Verified').length}件
                  </span>
                </div>
              </div>

              <AchievementForm onCreated={fetchAchievements} />
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  あなたの実績
                </h2>
                <button
                  onClick={fetchAchievements}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  更新
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <AchievementList
                  achievements={achievements}
                  onVerify={handleVerify}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; 2026 JobMatching Web3. Built with Next.js, RainbowKit & Supabase.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, className }: { icon: React.ReactNode, title: string, description: string, className?: string }) {
  return (
    <div className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow text-left ${className || ''}`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
