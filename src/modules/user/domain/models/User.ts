export type WalletAddress = string;

export interface UserProfile {
    name: string;
    bio?: string;
    avatarUrl?: string;
}

export class User {
    constructor(
        public readonly address: WalletAddress,
        public readonly profile?: UserProfile
    ) { }

    static create(address: WalletAddress, profile?: UserProfile): User {
        if (!address.startsWith('0x')) {
            throw new Error('Invalid Ethereum address');
        }
        return new User(address, profile);
    }
}
