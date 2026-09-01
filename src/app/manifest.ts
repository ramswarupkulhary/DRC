import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Dirt Ride Camp — DRC",
        short_name: "DRC",
        description: "Bangalore's off-road academy — training, guided trails & adventure rides.",
        start_url: "/",
        display: "standalone",
        background_color: "#0D0D0D",
        theme_color: "#E8622C",
        orientation: "portrait",
        categories: ["sports", "travel", "lifestyle"],
        icons: [
            { src: "/api/icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/api/icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/api/icon?size=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
    };
}
