import {useState,useEffect,useRef,useCallback} from "react";
import "./GalleryCarousel.css";
import useParallax from "../../hooks/useParallax.ts";
import type { CountryResult, CountryImage } from "../../types/planning.types.ts"
interface GalleryCarouselProps {
    country: CountryResult;
    images: CountryImage[];
    loading: boolean;
}
function GalleryCarousel({
    country,
    images,
    loading,
}: GalleryCarouselProps) {

    const [activeIdx, setActiveIdx] = useState(0);
    const [prevIdx, setPrevIdx] = useState<number | null>(null);
    const [transitioning, setTransitioning] = useState(false);

    const heroRef = useRef<HTMLDivElement>(null);

    const parallax = useParallax(
        heroRef as React.RefObject<HTMLElement>
    );
    const stripRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        setActiveIdx(0);
        setPrevIdx(null);
    }, [country.cca2]);

    useEffect(() => {
        const track = stripRef.current;

        if (!track) return;

        const thumb = track.children[activeIdx] as HTMLElement;

        if (!thumb) return;

        thumb.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });

    }, [activeIdx]);

    const goTo = useCallback((
        idx: number,
        dir: "next" | "prev"
    ) => {

        if (transitioning || idx === activeIdx) {
            return;
        }

        setPrevIdx(activeIdx);

        setActiveIdx(idx);

        setTransitioning(true);

        setTimeout(() => {
            setPrevIdx(null);
            setTransitioning(false);
        }, 650);

    }, [activeIdx, transitioning]);

    const prev = useCallback(() => {

        const prevIndex =
            activeIdx === 0
                ? images.length - 1
                : activeIdx - 1;

        goTo(prevIndex, "prev");

    }, [activeIdx, images.length, goTo]);

    const next = useCallback(() => {

        const nextIndex =
            activeIdx === images.length - 1
                ? 0
                : activeIdx + 1;

        goTo(nextIndex, "next");

    }, [activeIdx, images.length, goTo]);

    if (loading) {
        return (
            <div className="gallery-loading">
                <div className="gallery-loading__shimmer" />

                <div className="gallery-loading__text">
                    Cargando galería…
                </div>
            </div>
        );
    }

    if (!images.length) {
        return (
            <div className="gallery-empty">

                <span className="gallery-empty__icon">
                    🖼️
                </span>

                <p>
                    No se encontraron imágenes
                </p>

            </div>
        );
    }
    return (
        <div className="gallery-root">
            <div
                className="gallery-hero"
                ref={heroRef}
            >
                {prevIdx !== null && (
                    <img
                        key={`out-${prevIdx}`}
                        src={images[prevIdx]?.url}
                        alt=""
                        className="gallery-hero__img gallery-hero__img--out"
                    />
                )}
                <img
                    key={`in-${activeIdx}`}
                    src={images[activeIdx]?.url}
                    alt={images[activeIdx]?.label}
                    className={`gallery-hero__img gallery-hero__img--in ${transitioning ? "is-transitioning" : ""
                        }`}
                    style={{
                        ["--parallax-x" as string]: `${parallax.x * 0.35}px`,
                        ["--parallax-y" as string]: `${parallax.y * 0.35}px`,
                    }}
                />
                <div className="gallery-hero__vignette" />
                <div
                    className="gallery-hero__depth"
                    style={{
                        ["--depth-x" as string]: `${parallax.x * -0.7}px`,
                        ["--depth-y" as string]: `${parallax.y * -0.7}px`,
                    }}
                />
                <div className="gallery-chip">
                    <img
                        src={country.flags.svg}
                        alt={country.name.common}
                        className="gallery-chip__flag"
                    />
                    <span className="gallery-chip__name">
                        {country.name.common}
                    </span>
                    <span className="gallery-chip__badge">
                        Galería
                    </span>
                </div>
                <div className="gallery-counter">
                    <span className="gallery-counter__current">
                        {String(activeIdx + 1).padStart(2, "0")}
                    </span>
                    <span className="gallery-counter__sep">
                        /
                    </span>
                    <span className="gallery-counter__total">
                        {String(images.length).padStart(2, "0")}
                    </span>
                </div>
                <div className="gallery-caption">
                    <p className="gallery-caption__label">
                        {images[activeIdx]?.label
                            ?.replace(/^File:|\.jpg|\.jpeg|\.png/gi, "")
                            .trim()}
                    </p>
                    <div className="gallery-caption__meta">

                        {country.capital?.[0] && (
                            <span>
                                📍 {country.capital[0]}
                            </span>
                        )}
                        <span>
                            {country.region}
                        </span>
                        <span>
                            {(country.population / 1_000_000).toFixed(1)}M hab.
                        </span>
                    </div>
                </div>
                <button
                    className="gallery-nav gallery-nav--prev"
                    onClick={prev}
                    aria-label="Anterior"
                >
                    ←
                </button>
                <button
                    className="gallery-nav gallery-nav--next"
                    onClick={next}
                    aria-label="Siguiente"
                >
                    →
                </button>
            </div>
            <div className="gallery-strip">
                <div
                    className="gallery-strip__track"
                    ref={stripRef}
                >
                    {images.map((img, idx) => (
                        <button
                            key={img.id}
                            className={`gallery-strip__thumb ${idx === activeIdx
                                    ? "is-active"
                                    : ""
                                }`}
                            onClick={() =>
                                goTo(
                                    idx,
                                    idx > activeIdx
                                        ? "next"
                                        : "prev"
                                )
                            }
                            aria-label={`Ver imagen ${idx + 1}`}
                        >
                            <img
                                src={img.url}
                                alt=""
                            />
                            <div className="gallery-strip__thumb-overlay" />
                            {idx === activeIdx && (
                                <div className="gallery-strip__thumb-bar" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default GalleryCarousel;