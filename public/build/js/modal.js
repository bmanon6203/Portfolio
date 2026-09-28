window.renderStyledCard = function ({
  title,
  image,
  description,
  tags,
  link,
  isProject,
}) {
  const card = document.createElement("div");
  card.className =
    "relative rounded-[3rem] medieval-bg max-w-5xl w-full p-0 flex flex-col items-center overflow-hidden overflow-y-auto max-h-[90vh]";
  card.style.boxShadow = "0 4px 32px #829c8444, 0 1.5px 0 #fff8";
  let descriptionHtml = "";
  if (description) {
    try {
      if (window.marked && window.DOMPurify) {
        const result = window.marked.parse(description);
        if (typeof result === 'string') {
          descriptionHtml = window.DOMPurify.sanitize(result);
        } else if (result && typeof result.then === 'function') {
          descriptionHtml = window.DOMPurify.sanitize(description);
        } else {
          descriptionHtml = window.DOMPurify.sanitize(String(result));
        }
      } else {
        descriptionHtml = description
          .replace(/\*([^*]+)\*/g, '<b>$1</b>')
          .replace(/^##\s*(.+)$/gm, '<div class="font-bold text-lg mt-4 mb-2">$1</div>')
          .replace(/^\s*- (.+)$/gm, '<ul class="list-disc pl-6 mb-2"><li>$1</li></ul>')
      }
    } catch (e) {
      descriptionHtml = description;
    }
  }
  card.innerHTML = `
  <button id="closeMagicHatModal" class="absolute top-3 right-2 flex items-center justify-center border-none cursor-pointer z-20 text-neutral-800 bg-[#829c84] shadow-lg rounded-2xl rotate-12 transition-transform hover:rotate-6 hover:bg-[#ead298] medieval-btn" style="box-shadow:0 2px 8px #829c8444;aspect-ratio:1/1;padding:0;">
              <span class="select-none flex items-center justify-center w-full h-full" style="transform: rotate(-12deg);">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5"><g filter="url(#medieval-shadow)"><path d="M12 12 L36 36 M36 12 L12 36" stroke="#829c84" stroke-width="4" stroke-linecap="round"/><path d="M12 12 L36 36 M36 12 L12 36" stroke="#  color: #829c84;
" stroke-width="1.5" stroke-linecap="round"/></g><defs><filter id="medieval-shadow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#829c84" flood-opacity="0.5"/></filter></defs></svg>
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
                : `<img src="${image}" alt="${title}" class="rounded-xl bg-[#e4ca8f] object-cover w-full" style="width:100%;height:140px;max-width:100%;object-fit:contain;display:block;" loading="lazy">`
              : ""
          }
        </div>
        <div class="w-full px-8 pb-6 flex flex-col gap-2">
          ${
            tags && tags.length
              ? `<div class="flex flex-wrap gap-2 mb-2">${tags
                  .map(
                    (tag) =>
                      `<span class='inline-block bg-[#ead298] text-[#a88a3c] font-semibold px-3 py-1 rounded-full text-xs border border-[#829c84]'>${tag}</span>`
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

function updateMusicIcon() {
  const musicOnIcon = document.getElementById("musicOn");
  const musicOffIcon = document.getElementById("musicOff");
  if (!musicOnIcon || !musicOffIcon) return;
  if (musicOn) {
    musicOnIcon.style.display = "inline";
    musicOffIcon.style.display = "none";
  } else {
    musicOnIcon.style.display = "none";
    musicOffIcon.style.display = "inline";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  playBackgroundMusic(true);

  function tryPlayMusicOnce() {
    if (backgroundAudio && backgroundAudio.paused && musicOn) {
      backgroundAudio.play().catch(() => {});
    }
    window.removeEventListener('click', tryPlayMusicOnce);
    window.removeEventListener('touchstart', tryPlayMusicOnce);
  }
  window.addEventListener('click', tryPlayMusicOnce);
  window.addEventListener('touchstart', tryPlayMusicOnce);
  import("./info.js").then((module) => {
    const data = module.info;
    const aboutCard = document.getElementById("aboutCard");
    if (!aboutCard) return;
    aboutCard.innerHTML = "";
    aboutCard.appendChild(createAboutCard(data));
  });

  window.showProjectCard = function (projets) {
    const aboutCard = document.getElementById("aboutCard");
    if (!aboutCard) return;
  const mainCard = document.createElement("div");
  mainCard.className = "relative rounded-[3rem] medieval-bg max-w-5xl w-full p-0 flex flex-col items-center overflow-hidden overflow-y-auto max-h-[90vh]";
      mainCard.style.boxShadow = "0 4px 32px #829c8444, 0 1.5px 0 #fff8";
      const closeBtn = document.createElement("button");
      closeBtn.id = "closeMagicHatModal";
      closeBtn.className = "absolute top-3 right-4 flex items-center justify-center border-none cursor-pointer z-20 text-neutral-800 bg-[#f6e3b6] shadow-lg rounded-2xl rotate-12 transition-transform hover:rotate-6 hover:bg-[#ead298] medieval-btn";
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
      scrollContainer.className = "w-full flex flex-col items-center overflow-y-auto max-h-[70vh] px-2";

      const header = document.createElement("div");
      header.className = "w-full flex flex-col items-center justify-center py-3";
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
      projets.data.forEach((projet, idx) => {
        const miniCard = document.createElement("div");
        miniCard.className = "mini-card w-full flex flex-col justify-start items-stretch overflow-hidden";
        miniCard.style.breakInside = "avoid";
        miniCard.style.marginBottom = "24px";

        let image = projet.image || (Array.isArray(projet.photos) && projet.photos.length ? projet.photos[0] : "");
        if (image && !image.startsWith("/")) image = "/assets/" + image;
        let title = projet.title || `Projet ${idx + 1}`;
        let tags = projet.tags;
        if (typeof tags === "string") tags = tags.split(",").map(t => t.trim()).filter(Boolean);
        if (!Array.isArray(tags)) tags = [];
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
            <div class="w-full text-xs text-[#2a1a10]" style="margin:0.5em 0 0.7em 0;">${projet.description || ""}</div>
            ${
              tags.length
                ? `<div class='flex flex-wrap gap-1 justify-start mb-2 w-full'>${tags
                    .map(
                      (tag) =>
                        `<span class='inline-block bg-[#829c84]/20 text-[#829c84] font-semibold px-2 py-0.5 rounded-full text-[10px] border border-[#829c84]'>${tag}</span>`
                    )
                    .join(" ")}</div>`
                : ""
            }
          </div>
        `;
        if (projet.link) {
          miniCard.style.cursor = "pointer";
          miniCard.addEventListener("click", (e) => {
            if (e.target.closest('a')) return;
            window.open(projet.link, '_blank');
          });
        }
        grid.appendChild(miniCard);
      });
      scrollContainer.appendChild(grid);
      mainCard.appendChild(scrollContainer);
      aboutCard.innerHTML = "";
      aboutCard.appendChild(mainCard);
    };

  let isNight = false;
  const bulbOn = document.getElementById("bulbOn");
  const bulbOff = document.getElementById("bulbOff");
  const toggleBtn = document.getElementById("toggleTheme");
  function updateBulb() {
    if (isNight) {
      bulbOn.style.display = "none";
      bulbOff.style.display = "inline";
    } else {
      bulbOn.style.display = "inline";
      bulbOff.style.display = "none";
    }
  }
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      isNight = !isNight;
      updateBulb();
    });
  }
  updateBulb();

});


function bindModalEvents() {
  const modal = document.getElementById("magicHatModal");
  const content = document.getElementById("magicHatModalContent");
  function bindCloseBtn() {
    const closeBtn = document.getElementById("closeMagicHatModal");
    if (closeBtn) {
      closeBtn.onclick = function(e) {
        try {
          const swooshReverse = new Audio('/SFX/pop_close.wav');
          swooshReverse.play();
        } catch (e) { /* ignore */ }
        window.hideModal();
      };
    }
  }

  if (content) {
    const observer = new MutationObserver(() => {
      bindCloseBtn();
    });
    observer.observe(content, { childList: true, subtree: true });
    content.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) window.hideModal();
    });
  }

  bindCloseBtn();
}

document.addEventListener("DOMContentLoaded", bindModalEvents);
import { playRevealIn, bounceOutModal } from "./animations.js";

if (typeof window.showModal === "function") {
  window.showModal = (function(orig) {
    return function() {
      if (typeof orig === "function") {
        orig.apply(this, arguments);
      }
      try {
        const swoosh = new Audio('/SFX/pop_open.mp3');
        swoosh.play();
      } catch (e) { /* ignore */ }
      const modal = document.getElementById("magicHatModal");
      if (modal) playRevealIn(modal);
      setTimeout(bindModalEvents, 30);
    };
  })(window.showModal);
} else {
  window.showModal = function() {
    try {
      const swoosh = new Audio('/SFX/pop_open.mp3');
      swoosh.play();
    } catch (e) { /* ignore */ }
    const modal = document.getElementById("magicHatModal");
    if (modal) playRevealIn(modal);
    setTimeout(bindModalEvents, 30);
  };
}

window.hideModal = function() {
  const modal = document.getElementById("magicHatModal");
  if (modal) {
    import("./animations.js").then(({ playReveal }) => {
      playReveal(modal);
    });
  }
};
