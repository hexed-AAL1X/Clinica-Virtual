import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

const SmoothScroll = () => {
  useEffect(() => {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      smoothWheel: true,
    });

    const paintBar = () => {
      const limit = lenis.limit || 1;
      bar.style.transform = `scaleX(${limit > 0 ? lenis.scroll / limit : 0})`;
    };

    lenis.on("scroll", paintBar);
    paintBar();

    let frame = 0;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      bar.remove();
    };
  }, []);

  return null;
};

export default SmoothScroll;
