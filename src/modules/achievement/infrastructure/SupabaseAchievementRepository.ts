import { Achievement, AchievementStatus, ProofData } from "../domain/models/Achievement";
import { IAchievementRepository } from "../domain/IAchievementRepository";
import { supabase } from "@/infrastructure/supabase";

export class SupabaseAchievementRepository implements IAchievementRepository {
    async save(achievement: Achievement): Promise<void> {
        const { error } = await supabase
            .from('achievements')
            .upsert({
                id: achievement.id,
                user_id: achievement.userId,
                title: achievement.title,
                description: achievement.description,
                status: achievement.status,
                proof: achievement.proof ? JSON.stringify(achievement.proof) : null,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error('Failed to save achievement:', error);
            throw new Error(`Database error: ${error.message}`);
        }
    }

    async findById(id: string): Promise<Achievement | null> {
        const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return new Achievement(
            data.id,
            data.user_id,
            data.title,
            data.description,
            data.status as AchievementStatus,
            data.proof ? JSON.parse(data.proof) : undefined
        );
    }

    async findByUserId(userId: string): Promise<Achievement[]> {
        const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        return data.map((item: any) => new Achievement(
            item.id,
            item.user_id,
            item.title,
            item.description,
            item.status as AchievementStatus,
            item.proof ? JSON.parse(item.proof) : undefined
        ));
    }

    async updateStatus(id: string, status: string): Promise<void> {
        const { error } = await supabase
            .from('achievements')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Failed to update achievement status:', error);
            throw new Error(`Database error: ${error.message}`);
        }
    }
}
