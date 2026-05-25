import { useEffect, useState } from "react";

export default function useAutoCarousel(total: number, delay = 3500) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % total);
    };

    const previous = () => {
        setCurrentIndex((prev) => (prev - 1 + total) % total);
    };

    const goTo = (index: number) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        if (total <= 1) return;

        const interval = window.setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % total);
        }, delay);

        return () => window.clearInterval(interval);
    }, [total, delay]);

    return {
        currentIndex,
        setCurrentIndex,
        next,
        previous,
        goTo,
    };
}