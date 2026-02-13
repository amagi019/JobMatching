import { Achievement } from "./models/Achievement";

export interface IAchievementRepository {
    save(achievement: Achievement): Promise<void>;
    findById(id: string): Promise<Achievement | null>;
    findByUserId(userId: string): Promise<Achievement[]>;
    updateStatus(id: string, status: string): Promise<void>;
}

export interface IOnChainAchievementRepository {
    issueProof(achievement: Achievement): Promise<{ transactionHash: string; chainId: number; contractAddress: string; tokenId?: string }>;
}
