export const POINTS_PER_RUPEE = 100; // 1 point earned per ₹100 spent

export interface Reward {
    id: string;
    label: string;
    description: string;
    points: number;
    value: number; // ₹ discount
    minAmount: number;
}

export const REWARDS: Reward[] = [
    { id: "off-200", label: "₹200 Off", description: "₹200 off any ride, training or program booking.", points: 200, value: 200, minAmount: 500 },
    { id: "off-500", label: "₹500 Off", description: "₹500 off any booking over ₹1,500.", points: 450, value: 500, minAmount: 1500 },
    { id: "off-1000", label: "₹1,000 Off", description: "₹1,000 off any booking over ₹3,000.", points: 850, value: 1000, minAmount: 3000 },
];

export function getReward(id: string): Reward | undefined {
    return REWARDS.find((r) => r.id === id);
}

export function pointsForAmount(amount: number): number {
    return Math.floor(amount / POINTS_PER_RUPEE);
}
