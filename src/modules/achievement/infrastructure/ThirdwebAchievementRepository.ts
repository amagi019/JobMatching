import { createThirdwebClient, getContract, prepareContractCall, sendTransaction, waitForReceipt } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { Achievement } from "../domain/models/Achievement";
import { IOnChainAchievementRepository } from "../domain/IAchievementRepository";

export class ThirdwebAchievementRepository implements IOnChainAchievementRepository {
    private client;
    private contractAddress: string;

    constructor() {
        const secretKey = process.env.THIRDWEB_SECRET_KEY;
        this.client = createThirdwebClient(
            secretKey ? { secretKey } : { clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "" }
        );
        this.contractAddress = process.env.NEXT_PUBLIC_ACHIEVEMENT_CONTRACT_ADDRESS || "";
    }

    private isValidAddress(address: string): boolean {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    async issueProof(achievement: Achievement): Promise<{ transactionHash: string; chainId: number; contractAddress: string; tokenId?: string }> {
        // コントラクト未配備またはプレースホルダーの場合はモックレスポンスを返す
        if (!this.contractAddress || !this.isValidAddress(this.contractAddress)) {
            return {
                transactionHash: "0x_mock_" + Date.now(),
                chainId: baseSepolia.id,
                contractAddress: "0x_mock_contract",
                tokenId: "1",
            };
        }

        const contract = getContract({
            client: this.client,
            chain: baseSepolia,
            address: this.contractAddress,
        });

        // TODO: コントラクトデプロイ後に有効化
        // const account = privateKeyToAccount({
        //     client: this.client,
        //     privateKey: process.env.MINTER_PRIVATE_KEY!,
        // });
        //
        // const transaction = prepareContractCall({
        //     contract,
        //     method: "function mintTo(address to, string uri)",
        //     params: [achievement.userId, JSON.stringify({
        //         name: achievement.title,
        //         description: achievement.description,
        //     })],
        // });
        //
        // const { transactionHash } = await sendTransaction({ transaction, account });
        //
        // const receipt = await waitForReceipt({
        //     client: this.client,
        //     chain: baseSepolia,
        //     transactionHash,
        // });

        return {
            transactionHash: "0x_mock_" + Date.now(),
            chainId: baseSepolia.id,
            contractAddress: this.contractAddress,
            tokenId: "1",
        };
    }
}
