"use client";
declare global {
  interface Window {
    renderStyledCard?: (args: {
      title: string;
      image?: string;
      description?: string;
      tags?: string[];
      link?: string;
      isProject?: boolean;
    }) => HTMLDivElement;
    showProjectCard?: (projets?: Record<string, any>) => void;
    __projetsFromDB?: Record<string, any>;
  }
}
import { useLayoutEffect } from "react";
import Script from "next/script";
import {marked} from "marked";
import DOMPurify from "dompurify";

export default function Home() {
  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      window.showProjectCard = function () {
        const aboutCard = document.getElementById("aboutCard");
        if (aboutCard) {
          aboutCard.innerHTML =
            '<div class="p-8 text-center text-lg">Chargement des projets...</div>';
        }
      };
      import("marked").then(({ marked }) => {
        import("dompurify").then(({ default: DOMPurify }) => {
          window.renderStyledCard = function ({
            title,
            image,
            description,
            tags,
            link,
            isProject,
          }: {
            title: string;
            image?: string;
            description?: string;
            tags?: string[];
            link?: string;
            isProject?: boolean;
          }): HTMLDivElement {
            const card = document.createElement("div");
            card.className =
              "relative rounded-[3rem] medieval-bg max-w-5xl w-full p-0 flex flex-col items-center overflow-hidden overflow-y-auto max-h-[90vh]";
            card.style.boxShadow = "0 4px 32px #829c8444, 0 1.5px 0 #fff8";
            let descriptionHtml = "";
            if (description) {
              try {
                const result = marked.parse(description);
                if (typeof result === "string") {
                  descriptionHtml = DOMPurify.sanitize(result);
                } else if (result && typeof result.then === "function") {
                  descriptionHtml = DOMPurify.sanitize(description);
                } else {
                  descriptionHtml = DOMPurify.sanitize(String(result));
                }
              } catch (e) {
                descriptionHtml = "<i>Erreur de rendu markdown</i>";
              }
            }
            card.innerHTML = `
  <button id="closeMagicHatModal" class="absolute top-3 right-2 flex items-center justify-center border-none cursor-pointer z-20 text-neutral-800 bg-[#829c84] shadow-lg rounded-2xl rotate-12 transition-transform hover:rotate-6 hover:bg-[#ead298] medieval-btn" style="box-shadow:0 2px 8px #829c8444;aspect-ratio:1/1;padding:0;">
    <span class="select-none flex items-center justify-center w-full h-full" style="transform: rotate(-12deg);">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5"><g filter="url(#medieval-shadow)"><path d="M12 12 L36 36 M36 12 L12 36" stroke="#829c84" stroke-width="4" stroke-linecap="round"/><path d="M12 12 L36 36 M36 12 L12 36" stroke="#829c84" stroke-width="1.5" stroke-linecap="round"/></g><defs><filter id="medieval-shadow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#829c84" flood-opacity="0.5"/></filter></defs></svg>
    </span>
  </button>
  <div class="w-full flex flex-col items-center justify-center py-3" style=" background: none !important;">
    <span class="rounded-2xl px-8 py-2 text-2xl font-bold medieval-title bg-transparent shadow-none">${title}</span>
  </div>
  <div class="w-full flex flex-col items-center justify-center p-4 pt-6" style="${
    isProject ? "" : "height:140px;"
  }">
    ${
      image
        ? isProject
          ? `<img src="${image}" alt="${title}" class="rounded-xl border border-[#829c84] object-cover h-full w-full" style="max-width:95%; background:#fff;" loading="lazy">`
          : `<img src="${image}" alt="${title}" class="rounded-xl border border-[#829c84] object-cover w-full" style="width:100%;height:140px;max-width:100%;background:#fff;object-fit:cover;display:block;" loading="lazy">`
        : ""
    }
  </div>
  <div class="w-full px-8 pb-6 flex flex-col gap-2">
    ${
      tags && tags.length
        ? `<div class="flex flex-wrap gap-2 mb-2">${tags
            .map(
              (tag) =>
                `<span class='inline-block bg-[#ead298] text-[#a88a3c] font-semibold px-3 py-1 rounded-full text-xs border border-[#829c84]'>${tag}</span>`,
            )
            .join(" ")}</div>`
        : ""
    }
    <div class="text-base text-[#2a1a10] mb-2 text-left">${descriptionHtml}</div>
    ${
      isProject && link
        ? `<a href="${link}" target="_blank" class="absolute bottom-0 inline-block mt-1 px-5 py-2 rounded-xl medieval-btn">Voir le projet</a>`
        : ""
    }
  </div>
`;
            return card;
          };
        });
      });
      
      fetch("/api/entries/")
        .then((res) => res.json())
        .then((projets) => {
          window.__projetsFromDB = projets;
          window.showProjectCard = function () {
            const aboutCard = document.getElementById("aboutCard");
            if (!aboutCard) return;
            const mainCard = document.createElement("div");
            mainCard.className =
              "relative rounded-[3rem] medieval-bg max-w-5xl w-full p-4 flex flex-col items-center overflow-hidden overflow-y-auto max-h-[90vh] ";
            mainCard.style.boxShadow = "0 4px 32px #829c8444, 0 1.5px 0 #fff8";
            const closeBtn = document.createElement("button");
            closeBtn.id = "closeMagicHatModal";
            closeBtn.className =
              "absolute top-3 right-4 flex items-center justify-center border-none cursor-pointer z-20 text-neutral-800 bg-[#f6e3b6] shadow-lg rounded-2xl rotate-12 transition-transform hover:rotate-6 hover:bg-[#ead298] medieval-btn";
            closeBtn.style.padding = "0";
            closeBtn.innerHTML = `
              <span class="select-none flex items-center justify-center w-full h-full" style="transform: rotate(-12deg);">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7">
                  <g filter="url(#medieval-shadow)">
                    <path d="M12 12 L36 36 M36 12 L12 36" stroke="#829c84" stroke-width="4" stroke-linecap="round"/>
                    <path d="M12 12 L36 36 M36 12 L12 36" stroke="#829c84" stroke-width="1.5" stroke-linecap="round"/>
                  </g>
                  <defs>
                    <filter id="medieval-shadow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#bfa76a" flood-opacity="0.5"/>
                    </filter>
                  </defs>
                </svg>
              </span>
            `;
            mainCard.appendChild(closeBtn);
            const scrollContainer = document.createElement("div");
            scrollContainer.className =
              "w-full flex flex-col items-center overflow-y-auto max-h-[70vh] px-2";
            const header = document.createElement("div");
            header.className =
              "w-full flex flex-col items-center justify-center py-3";
            header.innerHTML = `
              <span class="rounded-2xl px-8 py-2 text-2xl font-bold medieval-title bg-transparent shadow-none">PROJETS</span>
            `;
            scrollContainer.appendChild(header);
            const grid = document.createElement("div");
            grid.className = "masonry-grid w-full";
            grid.style.columnCount = "2";
            grid.style.columnGap = "24px";
            grid.style.width = "100%";
            grid.style.maxWidth = "100%";
            grid.style.margin = "0 auto";
            if (Array.isArray(projets.data)) {
              projets.data.forEach((projet: any, idx: number) => {
                const miniCard = document.createElement("div");
                miniCard.className =
                  "mini-card w-full flex flex-col justify-start items-stretch overflow-hidden";
                miniCard.style.breakInside = "avoid";
                miniCard.style.marginBottom = "24px";
                let image =
                  projet.image ||
                  (Array.isArray(projet.photos) && projet.photos.length
                    ? projet.photos[0]
                    : "");
                if (image && !image.startsWith("/")) image = "/assets/" + image;
                let title = projet.title || `Projet ${idx + 1}`;
                let tags = projet.tags;
                if (typeof tags === "string")
                  tags = tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                if (!Array.isArray(tags)) tags = [];
                let descriptionHtml = "";
                if (projet.description) {
                  try {
                    const result = marked.parse(projet.description);
                    if (typeof result === "string") {
                      descriptionHtml = DOMPurify.sanitize(result);
                    } else if (result && typeof result.then === "function") {
                      descriptionHtml = DOMPurify.sanitize(projet.description);
                    } else {
                      descriptionHtml = DOMPurify.sanitize(String(result));
                    }
                  } catch (e) {
                    descriptionHtml = "<i>Erreur de rendu markdown</i>";
                  }
                }
                miniCard.innerHTML = `
                  <div class="mini-card-inner flex-1 w-full flex flex-col items-center relative">
                    <div class="w-full flex items-center justify-center" style="height:160px; min-height:160px;">
                      ${
                        image
                          ? `<img src="${image}" alt="${title}" class="rounded-lg border border-[#bfa76a] object-cover" style="width:100%;height:100%;max-width:100%;background:#fff;object-fit:cover;display:block;" loading="lazy">`
                          : ""
                      }
                    </div>
                    <div class="w-full font-bold text-[#829c84] text-lg" style="margin-top:0.7em;">${title}</div>
                    <div class="w-full text-xs text-[#2a1a10]" style="margin:0.5em 0 0.7em 0;">${descriptionHtml}</div>
                    ${
                      tags.length
                        ? `<div class='flex flex-wrap gap-1 justify-start mb-2 w-full'>${tags
                            .map(
                              (tag: string) =>
                                `<span class='inline-block bg-[#829c84]/20 text-[#829c84] font-semibold px-2 py-0.5 rounded-full text-[10px] border border-[#829c84]'>${tag}</span>`,
                            )
                            .join(" ")}</div>`
                        : ""
                    }
                  </div>
                `;
                if (projet.link) {
                  miniCard.style.cursor = "pointer";
                  miniCard.addEventListener("click", (e: MouseEvent) => {
                    const target = e.target as HTMLElement | null;
                    if (
                      target &&
                      typeof target.closest === "function" &&
                      target.closest("a")
                    )
                      return;
                    window.open(projet.link, "_blank");
                  });
                }
                grid.appendChild(miniCard);
              });
            }
            scrollContainer.appendChild(grid);
            mainCard.appendChild(scrollContainer);
            aboutCard.innerHTML = "";
            aboutCard.appendChild(mainCard);
          };
        });
    }
  }, []);

  return (
    <>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <link
        href="https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&family=Cinzel+Decorative:wght@700&display=swap"
        rel="stylesheet"
      />
      <audio src="/SFX/background.aac" loop autoPlay preload="auto" hidden />
      <section className="loading fixed top-0 left-0 h-full w-full flex justify-center items-center bg-transparent">
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          <svg
            viewBox="0 0 1300 1200"
            version="1.1"
            id="loadingSvg"
            className="w-[20vw] md:w-[7vw]"
            style={{
              fillRule: "evenodd",
              clipRule: "evenodd",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeMiterlimit: 1.5,
            }}
          >
            <path
              id="Star3"
              d="M303.482,783.661l-39.286,86.429l86.429,-23.571l94.286,62.857l-23.571,-110l94.286,-62.857l-102.143,-7.857l-15.714,-94.286l-62.857,78.571l-94.286,-7.857l62.857,78.571"
              style={{
                fill: "#829c84",
                stroke: "#232323",
                strokeWidth: "8.33px",
              }}
            />
            <g id="Chapeau">
              <path
                d="M542.337,950.724c0,0 -204.74,111.877 -239.212,124.276c-34.472,12.399 201.474,106.912 925,-37.5c0,0 47.448,-29.478 -193.75,-128.125"
                style={{
                  fill: "#323232",
                  stroke: "#232323",
                  strokeWidth: "12.5px",
                }}
              />
              <path
                d="M556.645,902.301c-2.299,0.195 -4.562,-0.67 -6.145,-2.349c-1.583,-1.679 -2.315,-3.988 -1.986,-6.272c21.116,-100.52 190.601,-476.48 207.671,-579.226c0.516,-4.108 -0.002,-8.281 -1.508,-12.138c-6.561,-16.714 -25.28,-62.378 -35.532,-67.795c-11.062,-5.845 13.305,2.373 78.62,71.503c98.924,104.7 176.915,378.088 213.179,550.392c0.394,1.89 -0.04,3.859 -1.194,5.407c-1.154,1.548 -2.916,2.527 -4.84,2.69c-54.582,4.601 -386.817,32.608 -448.265,37.787Z"
                style={{
                  fill: "#393838",
                  stroke: "#232323",
                  strokeWidth: "12.5px",
                }}
              />
              <path
                d="M555.285,876.827c0,0 -25.209,69.015 -11.535,76.298c17.013,20.702 501.243,-14.971 487.5,-43.75c0,0 -22.897,-65.493 -31.25,-65.625c-5.517,-0.087 -94.201,28.267 -224.35,37.982c-7.87,0.587 -15.891,1.107 -24.055,1.547c-61.233,3.306 -126.209,0.21 -196.309,-6.452Z"
                style={{
                  fill: "#829c84",
                  stroke: "#232323",
                  strokeWidth: "12.5px",
                }}
              />
            </g>
            <path
              id="Star1"
              d="M1107.25,683.875l-26.875,39l53.75,-14.625l32.25,29.25l0,-43.875l43,-24.375l-48.375,-14.625l-10.75,-39l-26.875,34.125l-48.375,0l32.25,34.125"
              style={{
                fill: "#829c84",
                stroke: "#232323",
                strokeWidth: "8.33px",
              }}
            />
            <path
              id="Star2"
              d="M593.75,284.375l-12.5,28.125l28.125,-12.5l18.75,15.625l-3.125,-25l21.875,-15.625l-25,-3.125l-9.375,-28.125l-12.5,21.875l-28.125,0l21.875,18.75Z"
              style={{
                fill: "#829c84",
                stroke: "#232323",
                strokeWidth: "8.33px",
              }}
            />
          </svg>
        </div>
        <div
          className="w-full h-full flex items-center justify-center pointer-events-none"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <h1
            className="z-[99] text-[15rem] medieval-title text-center"
            id="progress-label"
          >
            0
          </h1>
        </div>
        {/* Texte de chargement animé */}
        <div
          id="loading-text"
          className="medieval-title text-[#829c84]"
          style={{
            position: "fixed",
            bottom: "2.5rem",
            left: 0,
            width: "100vw",
            textAlign: "center",
            zIndex: 1010,
            fontSize: "2rem",
            pointerEvents: "none",
            whiteSpace: "pre-line",
          }}
        >
          <span>
            Chargement<span id="loading-dots">.</span>
          </span>
        </div>
        <div className="background-loading absolute z-10 h-full w-full">
          <svg
            className="absolute top-0 w-[350vw] md:w-[150vw]"
            id="loadingBgTop"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1728 795"
            fill="none"
            style={{ rotate: "-180deg" }}
          >
            <path fill="#fff" d="M0 255h1728v540H0V255Z" />
            <path
              fill="#FFFCF9"
              d="M475 142.013c-166-214.4-387.833-89.333-478 0l-275 47.001 2110.5 285-66-332.001c-141.6-97.6-341.33-40.666-423.5 0-62.8-78.4-141.83-32.666-173.5 0-288.8-257.2-583.333-107.166-694.5 0Z"
            />
            <path
              fill="#fff"
              d="M447 222.013c-166-214.4-387.833-89.333-478 0l-275 47.001 2110.5 285-66-332.001c-141.6-97.6-341.33-40.666-423.5 0-62.8-78.4-141.83-32.666-173.5 0-288.8-257.2-583.333-107.166-694.5 0Z"
            />
          </svg>
          <svg
            className="absolute bottom-0 w-[350vw] md:w-[150vw]"
            id="loadingBgBtm"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1728 795"
            fill="none"
          >
            <path fill="#fff" d="M0 255h1728v540H0V255Z" />
            <path
              fill="#FFFCF9"
              d="M475 142.013c-166-214.4-387.833-89.333-478 0l-275 47.001 2110.5 285-66-332.001c-141.6-97.6-341.33-40.666-423.5 0-62.8-78.4-141.83-32.666-173.5 0-288.8-257.2-583.333-107.166-694.5 0Z"
            />
            <path
              fill="#fff"
              d="M447 222.013c-166-214.4-387.833-89.333-478 0l-275 47.001 2110.5 285-66-332.001c-141.6-97.6-341.33-40.666-423.5 0-62.8-78.4-141.83-32.666-173.5 0-288.8-257.2-583.333-107.166-694.5 0Z"
            />
          </svg>
        </div>
      </section>
      <main id="app"></main>
      <article
        id="tooltip"
        className="fixed hidden px-4 py-2 bg-[#2a1a10]/90 text-[#f0e6d2] text-sm font-bold tracking-widest rounded border border-[#bfa76a] shadow-[0_0_10px_rgba(191,167,106,0.5)] pointer-events-none transform -translate-x-1/2 -translate-y-[150%] z-[2000] transition-opacity duration-200 font-serif"
      >
        LABEL
      </article>
      <header className="fixed bottom-6 right-6 flex gap-4 z-[1100]">
        <button
          id="toggleMusic"
          className="w-10 h-10 bg-[#43302b] rounded-md flex items-center justify-center shadow text-white transition-colors duration-300"
        >
          <span id="musicIcon">
            <svg
              id="musicOn"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              className="w-7 h-7"
              style={{ display: "inline" }}
            >
              <g
                stroke="#829c84"
                strokeWidth="1.7"
                fill="none"
                strokeLinecap="round"
              >
                <polygon
                  points="8,20 8,12 14,12 20,7 20,25 14,20"
                  fill="#829c84"
                  stroke="#829c84"
                />
                <path d="M23 13a4 4 0 0 1 0 6" stroke="#829c84" />
                <path d="M25.5 10a8 8 0 0 1 0 12" stroke="#829c84" />
              </g>
            </svg>
            <svg
              id="musicOff"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              className="w-7 h-7"
              style={{ display: "none" }}
            >
              <g
                stroke="#829c84"
                strokeWidth="1.7"
                fill="none"
                strokeLinecap="round"
              >
                <polygon
                  points="8,20 8,12 14,12 20,7 20,25 14,20"
                  fill="#829c84"
                  stroke="#829c84"
                />
                <path d="M23 13a4 4 0 0 1 0 6" stroke="#829c84" />
                <path d="M25.5 10a8 8 0 0 1 0 12" stroke="#829c84" />
                <line
                  x1="9"
                  y1="9"
                  x2="27"
                  y2="23"
                  stroke="#829c84"
                  strokeWidth="2.2"
                />
              </g>
            </svg>
          </span>
        </button>
      </header>
      <div
        id="magicHatModal"
        className="hidden fixed inset-0 w-screen h-[100svh] z-[1000] flex items-center justify-center"
      >
        <div
          id="magicHatModalContent"
          className="relative flex items-center justify-center w-full max-w-[900px] mx-auto h-full"
        >
          <div className="absolute left-0 top-0 w-full h-full flex flex-col items-center justify-center z-10 pointer-events-auto p-2 sm:p-6">
            <div className="w-full h-full flex items-center justify-center">
              <div
                id="aboutCard"
                className="w-full flex items-center justify-center max-h-[80vh] p-8 text-[#2a1a10] text-lg mx-auto relative"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <Script
  src="/build/three.js"
  strategy="lazyOnload"
/>
    </>
  );
}
