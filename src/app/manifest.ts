import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Dirt Ride Camp — DRC Motorsports",
        short_name: "DRC",
        description: "Bangalore off-road riding club & academy — small-group adventure rides, training, camping trips.",
        start_url: "/",
        display: "standalone",
        background_color: "#EFE7D4",
        theme_color: "#B4471F",
        orientation: "portrait",
        categories: ["sports", "travel", "lifestyle"],
        icons: [
            { src: "/brand/drc-logo-main.png", sizes: "any", type: "image/png", purpose: "any" },
            { src: "/api/icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/api/icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/api/icon?size=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
    };
}
