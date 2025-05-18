import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/dist/Flip";
import { Row } from "./Row";
import { preloadImages } from "@/lib/utils";
import "./styles.css";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip);
}

interface MenuToGridProps {
  items: {
    id: string;
    title: string;
    images: string[];
    gridImages?: string[];
  }[];
}

const MenuToGrid: React.FC<MenuToGridProps> = ({ items }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const rowsRef = useRef<Row[]>([]);
  const mouseenterTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!contentRef.current || !previewRef.current) return;

    // Preload images
    preloadImages(".cell__img-inner").then(() => {
      setIsLoading(false);
      document.body.classList.remove("loading");
    });

    // Initialize rows
    const rowElements = [
      ...contentRef.current.querySelectorAll(".row"),
    ] as HTMLElement[];
    const previewItems = [
      ...previewRef.current.querySelectorAll(".preview__item"),
    ] as HTMLElement[];

    rowsRef.current = rowElements.map((row, position) => {
      return new Row(row, previewItems[position]);
    });

    // Set up event listeners
    rowsRef.current.forEach((row, index) => {
      if (!row.DOM.el) return;

      // Mouseenter event
      row.DOM.el.addEventListener("mouseenter", () => {
        if (isOpen) return;

        // Make sure we have valid targets before killing tweens
        if (row.DOM.images.length > 0 && row.DOM.title) {
          gsap.killTweensOf([...row.DOM.images, row.DOM.title]);
        }

        mouseenterTimelineRef.current = gsap
          .timeline()
          .addLabel("start", 0)
          .to(
            row.DOM.images,
            {
              duration: 0.4,
              ease: "power3",
              startAt: {
                scale: 0.8,
                xPercent: 20,
              },
              scale: 1,
              xPercent: 0,
              opacity: 1,
              stagger: -0.035,
            },
            "start"
          )
          .set(row.DOM.title, { transformOrigin: "0% 50%" }, "start")
          .to(
            row.DOM.title,
            {
              duration: 0.1,
              ease: "power1.in",
              yPercent: -100,
              onComplete: () =>
                row.DOM.titleWrap?.classList.add("cell__title--switch"),
            },
            "start"
          )
          .to(
            row.DOM.title,
            {
              duration: 0.5,
              ease: "expo",
              startAt: {
                yPercent: 100,
                rotation: 15,
              },
              yPercent: 0,
              rotation: 0,
            },
            "start+=0.1"
          );
      });

      // Mouseleave event
      row.DOM.el.addEventListener("mouseleave", () => {
        if (isOpen) return;

        // Make sure we have valid targets before killing tweens
        if (row.DOM.images.length > 0 && row.DOM.title) {
          gsap.killTweensOf([...row.DOM.images, row.DOM.title]);
        }

        gsap
          .timeline()
          .addLabel("start")
          .to(
            row.DOM.images,
            {
              duration: 0.4,
              ease: "power4",
              opacity: 0,
              scale: 0.8,
            },
            "start"
          )
          .to(
            row.DOM.title,
            {
              duration: 0.1,
              ease: "power1.in",
              yPercent: -100,
              onComplete: () =>
                row.DOM.titleWrap?.classList.remove("cell__title--switch"),
            },
            "start"
          )
          .to(
            row.DOM.title,
            {
              duration: 0.5,
              ease: "expo",
              startAt: {
                yPercent: 100,
                rotation: 15,
              },
              yPercent: 0,
              rotation: 0,
            },
            "start+=0.1"
          );
      });

      // Click event
      row.DOM.el.addEventListener("click", () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setIsOpen(true);
        setCurrentRow(index);

        // Make sure we have valid targets before killing tweens
        const validTitles = rowsRef.current
          .map((r) => r.DOM.title)
          .filter((title) => title !== null);

        if (coverRef.current && validTitles.length > 0) {
          gsap.killTweensOf([coverRef.current, ...validTitles]);
        }

        gsap
          .timeline({
            onStart: () => {
              document.body.classList.add("oh");
              row.DOM.el?.classList.add("row--current");
              row.previewItem.DOM.el?.classList.add("preview__item--current");

              gsap.set(row.previewItem.DOM.images, { opacity: 0 });

              // Set cover to be on top of the row and then animate it to cover the whole page
              if (coverRef.current && row.DOM.el) {
                gsap.set(coverRef.current, {
                  height: row.DOM.el.offsetHeight - 1, // minus border width
                  top: row.DOM.el.getBoundingClientRect().top,
                  opacity: 1,
                });
              }

              gsap.set(row.previewItem.DOM.title, {
                yPercent: -100,
                rotation: 15,
                transformOrigin: "100% 50%",
              });

              closeRef.current?.classList.add("preview__close--show");
            },
            onComplete: () => setIsAnimating(false),
          })
          .addLabel("start", 0)
          .to(
            coverRef.current,
            {
              duration: 0.9,
              ease: "power4.inOut",
              height: window.innerHeight,
              top: 0,
            },
            "start"
          )
          // Animate all the titles out
          .to(
            validTitles,
            {
              duration: 0.5,
              ease: "power4.inOut",
              yPercent: (_, target) => {
                if (!row.DOM.el || !target) return 0;
                return (target as HTMLElement).getBoundingClientRect().top >
                  row.DOM.el.getBoundingClientRect().top
                  ? 100
                  : -100;
              },
              rotation: 0,
            },
            "start"
          )
          .add(() => {
            if (!mouseenterTimelineRef.current) return;
            mouseenterTimelineRef.current.progress(1, false);

            if (row.DOM.images.length && row.previewItem.DOM.grid) {
              const flipstate = Flip.getState(row.DOM.images, { simple: true });
              row.previewItem.DOM.grid.prepend(...row.DOM.images);

              Flip.from(flipstate, {
                duration: 0.9,
                ease: "power4.inOut",
                stagger: 0.04,
              })
                // Other images in the grid
                .to(
                  row.previewItem.DOM.images,
                  {
                    duration: 0.9,
                    ease: "power4.inOut",
                    startAt: {
                      scale: 0,
                      yPercent: () => gsap.utils.random(0, 200),
                    },
                    scale: 1,
                    opacity: 1,
                    yPercent: 0,
                    stagger: 0.04,
                  },
                  0.04 * row.DOM.images.length
                );
            }
          }, "start")
          .to(
            row.previewItem.DOM.title,
            {
              duration: 1,
              ease: "power4.inOut",
              yPercent: 0,
              rotation: 0,
              onComplete: () =>
                row.DOM.titleWrap?.classList.remove("cell__title--switch"),
            },
            "start"
          )
          .to(
            closeRef.current,
            {
              duration: 1,
              ease: "power4.inOut",
              opacity: 1,
            },
            "start"
          );
      });
    });

    // Close button event
    if (closeRef.current) {
      closeRef.current.addEventListener("click", () => {
        if (isAnimating || currentRow === -1) return;
        setIsAnimating(true);
        setIsOpen(false);

        const row = rowsRef.current[currentRow];

        gsap
          .timeline({
            defaults: { duration: 0.5, ease: "power4.inOut" },
            onStart: () => document.body.classList.remove("oh"),
            onComplete: () => {
              row.DOM.el?.classList.remove("row--current");
              row.previewItem.DOM.el?.classList.remove(
                "preview__item--current"
              );
              setIsAnimating(false);
            },
          })
          .addLabel("start", 0)
          .to(
            [
              ...(row.DOM.images || []),
              ...(row.previewItem.DOM.images || []),
            ].filter((img) => img),
            {
              scale: 0,
              opacity: 0,
              stagger: 0.04,
              onComplete: () => {
                if (row.DOM.imagesWrap && row.DOM.images.length > 0) {
                  row.DOM.imagesWrap.prepend(...row.DOM.images);
                }
              },
            },
            0
          )
          .to(
            row.previewItem.DOM.title,
            {
              duration: 0.6,
              yPercent: 100,
            },
            "start"
          )
          .to(
            closeRef.current,
            {
              opacity: 0,
            },
            "start"
          )
          // Animate cover out
          .to(
            coverRef.current,
            {
              ease: "power4",
              height: 0,
              top: row.DOM.el
                ? row.DOM.el.getBoundingClientRect().top +
                  row.DOM.el.offsetHeight / 2
                : 0,
            },
            "start+=0.4"
          )
          // Fade out cover
          .to(
            coverRef.current,
            {
              duration: 0.3,
              opacity: 0,
            },
            "start+=0.9"
          )
          // Animate all the titles in
          .to(
            rowsRef.current
              .map((r) => r.DOM.title)
              .filter((title) => title !== null),
            {
              yPercent: 0,
              stagger: {
                each: 0.03,
                grid: "auto",
                from: currentRow,
              },
            },
            "start+=0.4"
          );
      });
    }

    // Cleanup
    return () => {
      rowsRef.current.forEach((row) => {
        if (!row.DOM.el) return;
        row.DOM.el.removeEventListener("mouseenter", () => {});
        row.DOM.el.removeEventListener("mouseleave", () => {});
        row.DOM.el.removeEventListener("click", () => {});
      });

      if (closeRef.current) {
        closeRef.current.removeEventListener("click", () => {});
      }
    };
  }, [isOpen, isAnimating, currentRow]);

  return (
    <div className={`menu-to-grid-container ${isLoading ? "loading" : ""}`}>
      <div className="cover" ref={coverRef}></div>

      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      <section className="content" ref={contentRef}>
        {items.map((item, index) => (
          <div className="row" key={item.id}>
            <div className="cell cell--text">
              <h2 className="cell__title oh">
                <span className="oh__inner">{item.title}</span>
              </h2>
            </div>
            <div className="cell cell--images">
              {item.images.map((img, imgIndex) => (
                <div className="cell__img" key={`${item.id}-img-${imgIndex}`}>
                  <div
                    className="cell__img-inner"
                    style={{ backgroundImage: `url(${img})` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="preview" ref={previewRef}>
        <button className="preview__close unbutton" ref={closeRef}>
          ✕
        </button>
        {items.map((item, index) => (
          <div className="preview__item" key={`preview-${item.id}`}>
            <h2 className="preview__item-title oh">
              <span className="oh__inner">{item.title}</span>
            </h2>
            <div className="grid">
              {(item.gridImages || item.images).map((img, imgIndex) => (
                <div
                  className="cell__img"
                  key={`${item.id}-grid-img-${imgIndex}`}
                >
                  <div
                    className="cell__img-inner"
                    style={{ backgroundImage: `url(${img})` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default MenuToGrid;
