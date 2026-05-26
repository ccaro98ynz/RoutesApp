import type { TravelerKey } from "../types/planning.types";

export const travelerOptions: {
    key: TravelerKey;
    label: string;
}[] = [
        { key: "solo", label: "Solo" },
        { key: "pareja", label: "Pareja" },
        { key: "familia", label: "Familia" },
        { key: "amigos", label: "Amigos" },
    ];
export const budgetOptions = [
    {
        key: "economico", label: "Económico", icon: () =>(
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M.75 9.75a3 3 0 0 1 3-3h15a3 3 0 0 1 3 3v.038c.856.173 1.5.93 1.5 1.837v2.25c0 .907-.644 1.664-1.5 1.838v.037a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3v-6Zm19.5 0a1.5 1.5 0 0 0-1.5-1.5h-15a1.5 1.5 0 0 0-1.5 1.5v6a1.5 1.5 0 0 0 1.5 1.5h15a1.5 1.5 0 0 0 1.5-1.5v-6Z" clipRule="evenodd" />
            </svg>
        )
    },
    {
        key: "disfrutar", label: "Disfrutar", icon: () =>(
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M.75 9.75a3 3 0 0 1 3-3h15a3 3 0 0 1 3 3v.038c.856.173 1.5.93 1.5 1.837v2.25c0 .907-.644 1.664-1.5 1.838v.037a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3v-6Zm19.5 0a1.5 1.5 0 0 0-1.5-1.5h-15a1.5 1.5 0 0 0-1.5 1.5v6a1.5 1.5 0 0 0 1.5 1.5h15a1.5 1.5 0 0 0 1.5-1.5v-6Z" clipRule="evenodd" />
            </svg>
        ) },
    {
        key: "premium", label: "Premium", icon: () => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M3.75 6.75a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-.037c.856-.174 1.5-.93 1.5-1.838v-2.25c0-.907-.644-1.664-1.5-1.837V9.75a3 3 0 0 0-3-3h-15Zm15 1.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-15a1.5 1.5 0 0 1-1.5-1.5v-6a1.5 1.5 0 0 1 1.5-1.5h15ZM4.5 9.75a.75.75 0 0 0-.75.75V15c0 .414.336.75.75.75H18a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75H4.5Z" clipRule="evenodd" />
            </svg>
        )
},
];
export type PlaceCategoryKey =
    | "tourism"
    | "gastronomy"
    | "nature"
    | "culture"
    | "nightlife"
    | "shopping"
    | "sport"
    | "wellness";

export interface PlaceCategory {
    key: PlaceCategoryKey;
    label: string;
    emoji: string;
    /** Tags de Overpass que representa esta categoría */
    overpassTags: { key: string; value: string }[];
}

export const placeCategoryOptions: {
    key: PlaceCategoryKey;
    label: string;
    emoji: string;
    color: string;
}[] = [
        { key: "tourism", label: "Turismo", emoji: "🗺️", color: "#2563eb" },
        { key: "gastronomy", label: "Gastronomía", emoji: "🍽️", color: "#ea580c" },
        { key: "nature", label: "Naturaleza", emoji: "🌿", color: "#16a34a" },
        { key: "culture", label: "Cultura", emoji: "🎭", color: "#9333ea" },
        { key: "nightlife", label: "Vida nocturna", emoji: "🌙", color: "#db2777" },
        { key: "shopping", label: "Compras", emoji: "🛍️", color: "#f59e0b" },
        { key: "sport", label: "Deporte", emoji: "⚽", color: "#06b6d4" },
        { key: "wellness", label: "Bienestar", emoji: "🧘", color: "#84cc16" },
    ];
