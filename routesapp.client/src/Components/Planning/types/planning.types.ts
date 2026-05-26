export interface CountryResult {
    name: { common: string; official: string };
    cca2: string;
    flags: { svg: string; png: string };
    latlng: [number, number];
    capital?: string[];
    population: number;
}
export interface CountryImage {
    id: string;
    url: string;
    label: string;
}
export type TravelerKey = "solo" | "pareja" | "familia" | "amigos";
export type PresetBudgetKey = "economico" | "disfrutar" | "premium";