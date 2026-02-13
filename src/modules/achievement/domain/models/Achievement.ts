export enum AchievementStatus {
    Draft = 'Draft',
    Pending = 'Pending',
    Verified = 'Verified',
    Rejected = 'Rejected',
}

export interface ProofData {
    transactionHash: string;
    chainId: number;
    contractAddress: string;
    tokenId?: string;
}

export class Achievement {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly title: string,
        public readonly description: string,
        public status: AchievementStatus = AchievementStatus.Draft,
        public proof?: ProofData
    ) { }

    verify(proof: ProofData): void {
        this.status = AchievementStatus.Verified;
        this.proof = proof;
    }
}
