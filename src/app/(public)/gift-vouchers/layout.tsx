import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gift Vouchers — Adventure Bike Trip & Training Gift Cards | DRC",
    description: "Gift an adventure! Buy DRC gift vouchers for off-road bike trips, training classes & camping rides in Bangalore. Perfect for motorcycle enthusiasts.",
    keywords: ["adventure gift voucher bangalore", "bike trip gift card", "motorcycle training gift", "off road experience gift"],
};

export default function GiftVouchersLayout({ children }: { children: React.ReactNode }) {
    return children;
}
