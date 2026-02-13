import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { SupabaseAchievementRepository } from "@/modules/achievement/infrastructure/SupabaseAchievementRepository";
import { ThirdwebAchievementRepository } from "@/modules/achievement/infrastructure/ThirdwebAchievementRepository";
import { AchievementUseCase } from "@/modules/achievement/application/AchievementUseCase";

const achievementRepo = new SupabaseAchievementRepository();
const onChainRepo = new ThirdwebAchievementRepository();
const achievementUseCase = new AchievementUseCase(achievementRepo, onChainRepo);

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const achievements = await achievementUseCase.getUserAchievements(session.user.name);
    return NextResponse.json(achievements);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description } = await req.json();
    const achievement = await achievementUseCase.createAchievement(
        session.user.name,
        title,
        description
    );

    return NextResponse.json(achievement);
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, action } = await req.json();

    try {
        if (action === "apply") {
            await achievementUseCase.applyForVerification(id);
        } else if (action === "mint") {
            await achievementUseCase.verifyAndMint(id);
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
