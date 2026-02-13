import { Achievement, AchievementStatus, ProofData } from "../domain/models/Achievement";
import { IAchievementRepository, IOnChainAchievementRepository } from "../domain/IAchievementRepository";
import { v4 as uuidv4 } from "uuid";

export class AchievementUseCase {
    constructor(
        private achievementRepository: IAchievementRepository,
        private onChainRepository: IOnChainAchievementRepository
    ) { }

    async createAchievement(
        userId: string,
        title: string,
        description: string
    ): Promise<Achievement> {
        const id = uuidv4();
        const achievement = new Achievement(id, userId, title, description);
        await this.achievementRepository.save(achievement);
        return achievement;
    }

    async applyForVerification(achievementId: string): Promise<void> {
        const achievement = await this.achievementRepository.findById(achievementId);
        if (!achievement) throw new Error("Achievement not found");

        achievement.status = AchievementStatus.Pending;
        await this.achievementRepository.save(achievement);
    }

    async verifyAndMint(achievementId: string): Promise<void> {
        const achievement = await this.achievementRepository.findById(achievementId);
        if (!achievement) throw new Error("Achievement not found");

        // 実際の実装ではここで権限チェックなどを行う

        // オンチェーン証明の発行 (Thirdweb等)
        const proof = await this.onChainRepository.issueProof(achievement);

        achievement.verify(proof);
        await this.achievementRepository.save(achievement);
    }

    async getUserAchievements(userId: string): Promise<Achievement[]> {
        return await this.achievementRepository.findByUserId(userId);
    }
}
