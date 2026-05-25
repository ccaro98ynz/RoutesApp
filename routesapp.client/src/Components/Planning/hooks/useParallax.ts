import { useEffect, useState } from "react";

function useParallax(
    ref: React.RefObject<HTMLElement | null>,
    strength = 14
) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const el = ref.current;

        if (!el) return;

        const handleMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();

            const dx =
                (e.clientX - (rect.left + rect.width / 2)) /
                (rect.width / 2);

            const dy =
                (e.clientY - (rect.top + rect.height / 2)) /
                (rect.height / 2);

            setOffset({
                x: dx * strength,
                y: dy * strength,
            });
        };

        const handleLeave = () => {
            setOffset({ x: 0, y: 0 });
        };

        el.addEventListener("mousemove", handleMove);
        el.addEventListener("mouseleave", handleLeave);

        return () => {
            el.removeEventListener("mousemove", handleMove);
            el.removeEventListener("mouseleave", handleLeave);
        };
    }, [ref, strength]);

    return offset;
}

export default useParallax;