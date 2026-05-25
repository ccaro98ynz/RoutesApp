import type { CountryImage } from "../types/planning.types";
export async function fetchCountryImages(
    countryName: string
): Promise<CountryImage[]> {

    console.log("Buscando imágenes de:", countryName);

    const searchUrl =
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(countryName)}&format=json&origin=*`;
    try {
        const searchRes = await fetch(searchUrl);
        if (!searchRes.ok) {
            return [];
        }
        const searchData = await searchRes.json();
        const page = searchData.query.search[0];

        if (!page) {
            return [];
        }
        const pageTitle = page.title;
        const imagesUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=images&titles=${encodeURIComponent(pageTitle)}&format=json&imlimit=10&origin=*`;
        const imagesRes = await fetch(imagesUrl);

        if (!imagesRes.ok) {
            return [];
        }
        const imagesData = await imagesRes.json();
        const pages = imagesData.query.pages;
        const images: string[] = [];
        for (const key in pages) {
            if (pages[key].images) {
                for (const img of pages[key].images) {

                    if (/\.(jpg|jpeg|png)$/i.test(img.title)) {
                        images.push(img.title);
                    }
                }
            }
        }
        const imageInfoPromises = images
            .slice(0, 8)
            .map(async (imgTitle) => {
                const infoUrl =
                    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(imgTitle)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
                const infoRes = await fetch(infoUrl);
                if (!infoRes.ok) {
                    return null;
                }
                const infoData = await infoRes.json();
                const p = Object.values(
                    infoData.query.pages
                )[0] as any;
                if (p?.imageinfo?.[0]) {
                    return {
                        id: imgTitle,
                        url: p.imageinfo[0].url,
                        label: imgTitle.replace(/^File:/, ""),
                    };
                }
                return null;
            });
        const imageInfos =
            await Promise.all(imageInfoPromises);
        console.log("Imágenes encontradas:", imageInfos);
        return imageInfos.filter(Boolean) as CountryImage[];
    } catch (error) {

        console.error(error);
        return [];
    }
}