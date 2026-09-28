import * as THREE from "three";
import "./info.js";
import "./contact.js";
import "./projets.js";
import "./modal.js";
import "./animations.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import GUI from "lil-gui";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const loadingManager = new THREE.LoadingManager();
const debug = false;
let music = null;

let bgMusicStarted = false;
const loading = document.querySelector(".loading");
const loadingSvg = document.getElementById("loadingSvg");
const lBgTop = document.getElementById("loadingBgTop");
const lBgBtm = document.getElementById("loadingBgBtm");
const progressLabel = document.getElementById("progress-label");
const pauseBtn = document.getElementById("musicIcon");

let loadingDotsInterval = null;
function startLoadingDots() {
  const dots = document.getElementById("loading-dots");
  if (!dots) return;
  let count = 1;
  loadingDotsInterval = setInterval(() => {
    count = (count % 3) + 1;
    dots.textContent = ".".repeat(count);
  }, 220);
}

function stopLoadingDots() {
  if (loadingDotsInterval) {
    clearInterval(loadingDotsInterval);
    loadingDotsInterval = null;
    const dots = document.getElementById("loading-dots");
    if (dots) dots.textContent = ".";
  }
}

function showLoadingText() {
  const loadingText = document.getElementById("loading-text");
  if (loadingText) {
    loadingText.style.opacity = 1;
    startLoadingDots();
  }
}

function hideLoadingText() {
  const loadingText = document.getElementById("loading-text");
  if (loadingText) {
    loadingText.style.transition = "opacity 0.7s";
    loadingText.style.opacity = 0;
  }

  const progressLabel = document.getElementById("progress-label");
  if (progressLabel) {
    progressLabel.style.transition = "opacity 0.7s";
    progressLabel.style.opacity = 0;
  }
  stopLoadingDots();
}

showLoadingText();
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
if (isMobile) {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.zIndex = 20000;
  popup.style.padding = "1.2em 1.8em";
  popup.style.background = "linear-gradient(90deg, #9fb9a1ff 0%, #829c84 100%)";
  popup.style.color = "#fff";
  popup.style.border = "2px solid #829c84";
  popup.style.borderRadius = "1.5em";
  popup.style.fontSize = "1.1em";
  popup.style.fontWeight = "bold";
  popup.style.letterSpacing = "0.04em";
  popup.style.boxShadow = "0 4px 32px #a6825144, 0 1.5px 8px #829c8444";
  popup.style.textAlign = "center";
  popup.style.pointerEvents = "auto";
  popup.textContent = "Le site n'est disponible que sur PC.";
  document.body.appendChild(popup);
} else {
  let maxPercentReached = 0;
  let loadingLocked = false;
  let animating = false;
  let displayedPercent = 0;
  function animateProgress(targetPercent) {
    if (animating) return;
    animating = true;
    function step() {
      if (displayedPercent < targetPercent) {
        displayedPercent += Math.max(1, (targetPercent - displayedPercent) * 0.15); // animation easing
        if (displayedPercent > targetPercent) displayedPercent = targetPercent;
        updateProgressBar(displayedPercent);
        requestAnimationFrame(step);
      } else {
        displayedPercent = targetPercent;
        updateProgressBar(displayedPercent);
        animating = false;
      }
    }
    step();
  }

  function updateProgressBar(percent) {
    for (let i = 0; i <= 3; i++) {
      const star = document.getElementById(`Star${i}`);
      if (star) {
        const offset = ((i - 1) * Math.PI) / 2;
        const angle = Math.sin((percent / 100) * Math.PI + offset) * 360;
        star.style.transform = `rotate(${angle}deg)`;
      }
    }
    if (progressLabel) progressLabel.textContent = Math.floor(percent);
    if (loadingSvg) loadingSvg.style.clipPath = `inset(${100 - percent}% 0 0 0)`;
    if (percent >= 80) {
      setTimeout(() => {
        loadingSvg.classList.add("fadeOut");
        progressLabel.classList.add("fadeOut");
      }, 1000);
    }
  }

  loadingManager.onProgress = function (url, loaded, total) {
    if (total > 0 && loadingSvg && !loadingLocked) {
      let percent = Math.min((loaded / total) * 100, 100);
      if (percent < maxPercentReached) {
        percent = maxPercentReached;
      } else {
        maxPercentReached = percent;
      }
      if (!bgMusicStarted && percent >= 50) {
        bgMusicStarted = true;
        if (window._bgMusicPlay) window._bgMusicPlay();
      }
      animateProgress(percent);
    }
  };

  loadingManager.onLoad = function () {
    loadingLocked = true;
    maxPercentReached = 100;
    animateProgress(100);
    hideLoadingText();
    music = new Audio("/SFX/background.aac");
    music.loop = true;
    music.volume = 0.8;
    let startBtn = document.getElementById("startMusic");
    if (!startBtn) {
      startBtn = document.createElement("button");
      startBtn.id = "startMusic";
      startBtn.textContent = "Commencer";
      startBtn.style.position = "fixed";
      startBtn.style.top = "50%";
      startBtn.style.left = "50%";
      startBtn.style.transform = "translate(-50%, -50%)";
      startBtn.style.zIndex = 20000;
      startBtn.style.padding = "0.5em 1em";
      startBtn.style.background =
        "linear-gradient(90deg, #9fb9a1ff 0%, #829c84 100%)";
      startBtn.style.color = "#fff";
      startBtn.style.border = "none";
      startBtn.style.borderRadius = "2.5em";
      startBtn.style.fontSize = "2em";
      startBtn.style.fontWeight = "bold";
      startBtn.style.letterSpacing = "0.04em";
      startBtn.style.boxShadow =
        "0 4px 32px #a6825144, 0 1.5px 8px #829c8444";
      startBtn.style.cursor = "pointer";
      startBtn.style.transition =
        "background 0.3s, transform 0.15s, box-shadow 0.2s";
      startBtn.style.border = "2px solid #829c84";
      startBtn.onmouseover = () =>
        (startBtn.style.background = "#6e8c6e");
      startBtn.onmouseout = () => (startBtn.style.background = "#829c84");

      document.body.appendChild(startBtn);

      startBtn.addEventListener("click", function () {
        music.play().catch((err) => {
          console.error("Lecture audio bloquée :", err);
        });

        startBtn.disabled = true;
        startBtn.style.opacity = "0.5";

        setTimeout(() => {
          lBgTop.classList.add("SlideTop");
          lBgBtm.classList.add("SlideBtm");
          startBtn.remove();

          setTimeout(() => {
            pauseBtn.addEventListener("click", () => {
              if (!music.paused) {
                music.pause();
                pauseBtn.querySelector("#musicOff").style.display =
                  "block";
                pauseBtn.querySelector("#musicOn").style.display = "none";
              } else {
                music.play();
                pauseBtn.querySelector("#musicOff").style.display =
                  "none";
                pauseBtn.querySelector("#musicOn").style.display =
                  "block";
              }
            });
            loading.style.display = "none";
          }, 3000);
        }, 200);
      });
    }
  };

  const objMesh = {
    tel: "Push_Button_Telephone",
    livre: "Livre_(projets)",
    bandeau: "Bandeau",
  };

  window.showContactSVG = function () {
    const aboutCard = document.getElementById("aboutCard");
    if (!aboutCard) return;
    aboutCard.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
                    <svg id="Contacts" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1443 1024">
                       <defs>
                          <style>
                            .st0, .st1 {
                              fill: #a68251;
                            }

                            .st2, .st3 {
                              fill: #7ac943;
                            }

                            .st2, .st3, .st4, .st5, .st6, .st7, .st8, .st9, .st10, .st11, .st12, .st13, .st14, .st15, .st16, .st17, .st18, .st19, .st20, .st21, .st22, .st23, .st24, .st25, .st26, .st27, .st28, .st29 {
                              isolation: isolate;
                            }

                            .st2, .st7, .st12, .st18 {
                              opacity: .51;
                            }

                            .st3, .st13, .st17, .st19 {
                              opacity: .76;
                            }

                            .st4 {
                              stroke-linecap: round;
                              stroke-linejoin: round;
                              stroke-width: .5px;
                            }

                            .st4, .st6 {
                              opacity: .11;
                            }

                            .st4, .st1 {
                              stroke: #1d1d1b;
                            }

                            .st5 {
                              opacity: .68;
                            }

                            .st6 {
                              fill: #1d1d1b;
                            }

                            .st7 {
                              fill: #bd5e2e;
                            }

                            .st8 {
                              letter-spacing: -.09em;
                            }

                            .st8, .st9, .st10, .st22, .st23, .st24, .st25, .st26, .st27, .st28, .st29 {
                              font-family: Arial-BoldMT, Arial;
                              font-size: 10.83px;
                              font-weight: 700;
                            }

                            .st9 {
                              letter-spacing: -.02em;
                            }

                            .st10 {
                              letter-spacing: -.02em;
                            }

                            .st11 {
                              fill: #e6cb90;
                              opacity: .97;
                            }

                            .st12, .st13 {
                              fill: #fbb03b;
                            }

                            .st14 {
                              fill: #829c84;
                              opacity: .35;
                            }

                            .st15 {
                              fill: #39b54a;
                            }

                            .st15, .st16, .st20, .st21 {
                              opacity: .52;
                            }

                            .st30 {
                              fill: #fffecf;
                            }

                            .st1 {
                              stroke-miterlimit: 10;
                            }

                            .st16 {
                              fill: #2e3192;
                            }

                            .st17, .st18 {
                              fill: #29abe2;
                            }

                            .st31 {
                              fill: #4b663d;
                            }

                            .st19, .st20 {
                              fill: #0071bc;
                            }

                            .st21 {
                              fill: #f7931e;
                            }

                            .st22 {
                              letter-spacing: .02em;
                            }

                            .st23 {
                              letter-spacing: -.04em;
                            }

                            .st24 {
                              letter-spacing: -.05em;
                            }

                            .st26 {
                              letter-spacing: -.01em;
                            }

                            .st27 {
                              letter-spacing: .03em;
                            }

                            .st28 {
                              letter-spacing: .03em;
                            }

                            .st29 {
                              letter-spacing: .04em;
                            }
                          </style>
                        </defs>
                        <g id="whatsapp">
                          <path class="st30" d="M592.7,275.64c0,28.56-29.46,48.76-47.09,47.09-7.59-.72-16.82-5.85-27.98-1.36-5.36,2.15-8.59,5.49-10.92,4.09-3.12-1.87-.17-9.55,0-19.11.27-15.71-7.25-20.64-8.19-30.71-1.63-17.58,17.17-47.09,47.09-47.09,26.01,0,47.09,21.08,47.09,47.09h0Z"/>
                          <path class="st31" d="M502.62,376.63c-3.83,1.51-9.37,3.2-16.21,3.68-8.76.62-15.89-1.01-20.31-2.4-.18,7.31-.35,14.61-.53,21.92.03.56.03,1.76-.63,3.05-.89,1.73-2.36,2.48-2.85,2.71-34.1,14.72-51.01,51.21-41.31,82.16,7.94,25.33,32.5,43.02,59.24,44.39,28.25,1.44,55.05-15.53,64.79-41.1,11.83-31.05-3.58-69.3-37.68-85.5-1.04-.62-2.5-1.7-3.45-3.51-.35-.67-.68-1.53-.86-2.71-.44-2.86-.55-11.33-.2-22.68h0Z"/>
                          <path class="st14" d="M498.29,378.13c-.27,3.8-.76,12.57.16,21.12.33,3.04.92,7.07,3.97,9.61.67.56,1.38.99,2.07,1.32,24.33,11.24,40.02,34.28,39.72,58.55-.32,26.28-19.26,43.28-21.52,45.25-12.82,11.15-28.07,14.44-33.74,15.66-8.89,1.92-15.26,1.92-15.27,1.84-.02-.15,26.09,2.93,46.98-10.64,23.3-15.13,27.48-42.78,27.66-44.16,3.14-23.22-8.05-40.4-10.96-44.87-7.01-10.77-16.96-18.79-20.89-21.02-1.99-1.13-3.89-2.41-5.89-3.53-3.83-2.15-5.24-2.66-6.44-4.34-.8-1.12-1.67-2.99-1.55-6.04,0-6.75.02-13.51.02-20.26-1.44.5-2.89,1-4.33,1.5h.01Z"/>
                          <path class="st14" d="M492.61,396.42c-2.21.23-4.1,5.53-3.05,9.79.6,2.45,2.5,5.88,4.89,5.88,1.07,0,1.85-.68,2.07-.87,2.43-2.11,1.29-6.72,1.04-7.71-.71-2.86-2.84-7.3-4.95-7.08h0Z"/>
                          <path class="st14" d="M519.63,429.33c-.56-.9-5.98-9.65-10.42-8.45-1.33.36-2.41,1.57-3.57,2.88-.3.34-1.75,1.97-2.42,3.74-1.39,3.67.35,8.39,3.11,11.28,3.43,3.59,9.65,5.64,13.3,3.11,1.65-1.15,2.3-2.9,2.49-3.5,1.03-3.28-.8-6.33-2.49-9.06h0Z"/>
                          <path class="st14" d="M490.27,428.67c-2.76.13-4.98,3.72-4.09,6.62.64,2.08,2.89,3.85,5.12,3.45,2.68-.48,4.14-3.86,3.4-6.45-.55-1.92-2.4-3.72-4.43-3.63h0Z"/>
                          <path class="st14" d="M465.5,401.19c.98.64,1.46,1.37,1.69,1.8,1.19,2.22.35,5.1-1.19,6.72-.44.46-.88.76-1.19.96-6.13,3.06-13.21,7.55-19.95,14.2-22.67,22.36-24.36,52.19-24.52,61.34-1-4.97-5.59-30.05,8.53-52.47,8.63-13.71,22.49-23.62,26.53-24.86.88-.27,2.82-1.28,6.71-3.3.57-.3,1.68-.89,2.51-2.14.56-.85.79-1.69.89-2.26h-.01Z"/>
                          <path class="st15" d="M540.1,465.03c-10.94,4.52-32.5,11.69-60.08,9.55-23.82-1.85-41.81-9.86-51.86-15.27-.56,3.05-4.77,28.58,13.25,47.94,13.78,14.8,31.61,16.4,37.19,16.81,4.85.36,30.29,1.63,47.9-18.42,14.47-16.48,13.84-36.18,13.59-40.6h0Z"/>
                          <path class="st3" d="M539.73,464.87c.04-1.3-.06-3.06-.69-5-5.68-17.44-44.43-18.26-56.08-18.5-15.55-.33-38.91-.49-52.94,15.06-.99,1.1-1.74,2.06-2.23,2.71,10.05,5.41,28.03,13.42,51.86,15.27,27.58,2.15,49.13-5.03,60.08-9.55h0Z"/>
                          <path class="st4" d="M509.81,517.95c-37.86-7.52-63.29-31.73-63.53-55.09-.19-18.23,14.9-41.44,23.5-40.75,1.58.13,6.8,1.38,8.87-1.21.58-.73.72-1.52.81-2.13.99-6.8.03-18.85.23-21.48.08-1.05.44-1.79.52-1.95.35-.69.8-1.16,1.1-1.44,1.08-1,7.27-6.11,15.82-13.01-.02-.8-.04-1.6-.06-2.4-3.96,1.09-9.7,2.19-16.64,1.92-5.87-.23-10.75-1.37-14.32-2.49-.16,6.92-.31,13.84-.47,20.77-.04.84-.09,1.68-.13,2.52.4.25,1.16.81,1.69,1.8.42.79.5,1.5.54,1.85.16,1.59-.42,2.82-.65,3.28-.21.44-.99,1.88-2.54,2.76-.53.3-.83.35-2.09,1.01,0,0-.68.36-1.42.79-13.28,7.74-20.82,17.2-20.82,17.2-8.85,11.1-11.51,23.36-12.42,29.27-.58,3.49-4.34,28.54,12.79,47.48,16.23,17.94,44.48,22.94,69.22,11.32v-.02Z"/>
                          <path class="st2" d="M523.55,481.87c.01-3.95-3.71-7.54-5.96-7.06-3.07.65-5.18,9.24-1.99,12.41.11.11,1.37,1.33,3.07,1.21,2.65-.18,4.87-3.53,4.88-6.56Z"/>
                          <path class="st31" d="M501.7,350.17c3.84,1.65,12.98,6.08,13.34,12.38.5,8.79-16.24,17.8-30.87,18.01-13.95.21-31.19-7.51-31.15-16.84.03-7.85,12.28-13.69,15-14.94-.37,1.25-2.78,9.81,1.47,13.64,1.64,1.48,3.32,1.41,12.26,1.12,13.88-.44,18.03-.52,19.25-3.15.34-.74.43-2.41.61-5.75.1-1.89.1-3.45.09-4.49v.02Z"/>
                          <path class="st0" d="M502.07,341.62c2.59-3.43,2.43-5.7,2.14-6.82-1.56-6.07-14.45-6.67-17.57-6.82-6.15-.29-19.48.43-21.11,6.5-.65,2.41.74,4.95,2.11,6.8-.58,8.17-.81,14.45-.79,17.44,0,.81.04,2.37,1.1,3.49.91.96,2.15,1.16,2.74,1.25,5.42.78,13.37.87,16.53.97,1.36.04,6.78.24,10.39-1.02.72-.25,1.8-.71,2.62-1.74.91-1.14,1.06-2.41,1.13-3.09.27-2.6.58-8.77.72-16.95h-.01Z"/>
                          <path class="st6" d="M502.64,340.83c-.2.38-.54.94-1.05,1.54-1.79,2.1-4.91,3.7-17.79,3.23-13.47-.49-15.67-2.43-16.38-4.09-.16-.37-.24-.71-.27-.94.2.15.49.37.86.63,2.42,1.66,5.94,3.22,17.23,3.34,10.31.11,13.49-1.12,15.83-2.59.68-.43,1.22-.83,1.57-1.11h0Z"/>
                          <path class="st11" d="M443.28,458.33c10.59,1.96,23.31,3.51,37.72,3.67,16.48.18,30.88-1.51,42.55-3.67v26.91c-11.36,2.15-25.42,3.87-41.55,3.76-14.9-.1-27.98-1.73-38.72-3.76v-26.91Z"/>
                          <g class="st5">
                            <text class="st25" transform="translate(451.16 479.52)"><tspan x="0" y="0">W</tspan></text>
                            <text class="st9" transform="translate(461.56 479.52)"><tspan x="0" y="0">h</tspan></text>
                            <text class="st8" transform="translate(470.68 479.52)"><tspan x="0" y="0">a</tspan></text>
                            <text class="st29" transform="translate(477.49 479.52)"><tspan x="0" y="0">t</tspan></text>
                            <text class="st9" transform="translate(485.14 479.52)"><tspan x="0" y="0">’</tspan></text>
                            <text class="st25" transform="translate(487.44 479.52)"><tspan x="0" y="0">sA</tspan></text>
                            <text class="st25" transform="translate(501.33 479.52)"><tspan x="0" y="0">p</tspan></text>
                            <text class="st25" transform="translate(508.4 479.52)"><tspan x="0" y="0">p</tspan></text>
                          </g>
                        </g>
                        <g id="facebook">
                          <path class="st31" d="M654.31,374.31c-3.83,1.51-9.37,3.2-16.21,3.68-8.76.62-15.89-1.01-20.31-2.4-.18,7.31-.35,14.61-.53,21.92.03.56.03,1.76-.63,3.05-.89,1.73-2.36,2.48-2.85,2.71-34.1,14.72-51.01,51.21-41.31,82.16,7.94,25.33,32.5,43.02,59.24,44.39,28.25,1.44,55.05-15.53,64.79-41.1,11.83-31.05-3.58-69.3-37.68-85.5-1.04-.62-2.5-1.7-3.45-3.51-.35-.67-.68-1.53-.86-2.71-.44-2.86-.55-11.33-.2-22.68h0Z"/>
                          <path class="st14" d="M649.97,375.81c-.27,3.8-.76,12.57.16,21.12.33,3.04.92,7.07,3.97,9.61.67.56,1.38.99,2.07,1.32,24.33,11.24,40.02,34.28,39.72,58.55-.32,26.28-19.26,43.28-21.52,45.25-12.82,11.15-28.07,14.44-33.74,15.66-8.89,1.92-15.26,1.92-15.27,1.84-.02-.15,26.09,2.93,46.98-10.64,23.3-15.13,27.48-42.78,27.66-44.16,3.14-23.22-8.05-40.4-10.96-44.87-7.01-10.77-16.96-18.79-20.89-21.02-1.99-1.13-3.89-2.41-5.89-3.53-3.83-2.15-5.24-2.66-6.44-4.34-.8-1.12-1.67-2.99-1.55-6.04,0-6.75.02-13.51.02-20.26-1.44.5-2.89,1-4.33,1.5h.01Z"/>
                          <path class="st14" d="M644.29,394.1c-2.21.23-4.1,5.53-3.05,9.79.6,2.45,2.5,5.88,4.89,5.88,1.07,0,1.85-.68,2.07-.87,2.43-2.11,1.29-6.72,1.04-7.71-.71-2.86-2.84-7.3-4.95-7.08h0Z"/>
                          <path class="st14" d="M671.32,427.01c-.56-.9-5.98-9.65-10.42-8.45-1.33.36-2.41,1.57-3.57,2.88-.3.34-1.75,1.97-2.42,3.74-1.39,3.67.35,8.39,3.11,11.28,3.43,3.59,9.65,5.64,13.3,3.11,1.65-1.15,2.3-2.9,2.49-3.5,1.03-3.28-.8-6.33-2.49-9.06h0Z"/>
                          <path class="st14" d="M641.96,426.35c-2.76.13-4.98,3.72-4.09,6.62.64,2.08,2.89,3.85,5.12,3.45,2.68-.48,4.14-3.86,3.4-6.45-.55-1.92-2.4-3.72-4.43-3.63h0Z"/>
                          <path class="st14" d="M617.18,398.87c.98.64,1.46,1.37,1.69,1.8,1.19,2.22.35,5.1-1.19,6.72-.44.46-.88.76-1.19.96-6.13,3.06-13.21,7.55-19.95,14.2-22.67,22.36-24.36,52.19-24.52,61.34-1-4.97-5.59-30.05,8.53-52.47,8.63-13.71,22.49-23.62,26.53-24.86.88-.27,2.82-1.28,6.71-3.3.57-.3,1.68-.89,2.51-2.14.56-.85.79-1.69.89-2.26h-.01Z"/>
                          <path class="st16" d="M691.78,462.71c-10.94,4.52-32.5,11.69-60.08,9.55-23.82-1.85-41.81-9.86-51.86-15.27-.56,3.05-4.77,28.58,13.25,47.94,13.78,14.8,31.61,16.4,37.19,16.81,4.85.36,30.29,1.63,47.9-18.42,14.47-16.48,13.84-36.18,13.59-40.6h0Z"/>
                          <path class="st19" d="M691.41,462.55c.04-1.3-.06-3.06-.69-5-5.68-17.44-44.43-18.26-56.08-18.5-15.55-.33-38.91-.49-52.94,15.06-.99,1.1-1.74,2.06-2.23,2.71,10.05,5.41,28.03,13.42,51.86,15.27,27.58,2.15,49.13-5.03,60.08-9.55h0Z"/>
                          <path class="st4" d="M661.49,515.63c-37.86-7.52-63.29-31.73-63.53-55.09-.19-18.23,14.9-41.44,23.5-40.75,1.58.13,6.8,1.38,8.87-1.21.58-.73.72-1.52.81-2.13.99-6.8.03-18.85.23-21.48.08-1.05.44-1.79.52-1.95.35-.69.8-1.16,1.1-1.44,1.08-1,7.27-6.11,15.82-13.01-.02-.8-.04-1.6-.06-2.4-3.96,1.09-9.7,2.19-16.64,1.92-5.87-.23-10.75-1.37-14.32-2.49-.16,6.92-.31,13.84-.47,20.77-.04.84-.09,1.68-.13,2.52.4.25,1.16.81,1.69,1.8.42.79.5,1.5.54,1.85.16,1.59-.42,2.82-.65,3.28-.21.44-.99,1.88-2.54,2.76-.53.3-.83.35-2.09,1.01,0,0-.68.36-1.42.79-13.28,7.74-20.82,17.2-20.82,17.2-8.85,11.1-11.51,23.36-12.42,29.27-.58,3.49-4.34,28.54,12.79,47.48,16.23,17.94,44.48,22.94,69.22,11.32v-.02Z"/>
                          <path class="st7" d="M675.23,479.55c.01-3.95-3.71-7.54-5.96-7.06-3.07.65-5.18,9.24-1.99,12.41.11.11,1.37,1.33,3.07,1.21,2.65-.18,4.87-3.53,4.88-6.56Z"/>
                          <path class="st31" d="M653.38,347.85c3.84,1.65,12.98,6.08,13.34,12.38.5,8.79-16.24,17.8-30.87,18.01-13.95.21-31.19-7.51-31.15-16.84.03-7.85,12.28-13.69,15-14.94-.37,1.25-2.78,9.81,1.47,13.64,1.64,1.48,3.32,1.41,12.26,1.12,13.88-.44,18.03-.52,19.25-3.15.34-.74.43-2.41.61-5.75.1-1.89.1-3.45.09-4.49v.02Z"/>
                          <path class="st0" d="M653.76,339.3c2.59-3.43,2.43-5.7,2.14-6.82-1.56-6.07-14.45-6.67-17.57-6.82-6.15-.29-19.48.43-21.11,6.5-.65,2.41.74,4.95,2.11,6.8-.58,8.17-.81,14.45-.79,17.44,0,.81.04,2.37,1.1,3.49.91.96,2.15,1.16,2.74,1.25,5.42.78,13.37.87,16.53.97,1.36.04,6.78.24,10.39-1.02.72-.25,1.8-.71,2.62-1.74.91-1.14,1.06-2.41,1.13-3.09.27-2.6.58-8.77.72-16.95h-.01Z"/>
                          <path class="st6" d="M654.32,338.51c-.2.38-.54.94-1.05,1.54-1.79,2.1-4.91,3.7-17.79,3.23-13.47-.49-15.67-2.43-16.38-4.09-.16-.37-.24-.71-.27-.94.2.15.49.37.86.63,2.42,1.66,5.94,3.22,17.23,3.34,10.31.11,13.49-1.12,15.83-2.59.68-.43,1.22-.83,1.57-1.11h0Z"/>
                          <path class="st11" d="M595.89,459.7c10.59,1.96,23.31,3.51,37.72,3.67,16.48.18,30.88-1.51,42.55-3.67v26.91c-11.36,2.15-25.42,3.87-41.55,3.76-14.9-.1-27.98-1.73-38.72-3.76v-26.91Z"/>
                          <g class="st5">
                            <text class="st25" transform="translate(783.64 481.23)"><tspan x="0" y="0">M</tspan></text>
                            <text class="st23" transform="translate(794.12 481.23)"><tspan x="0" y="0">A</tspan></text>
                            <text class="st25" transform="translate(801.3 481.23)"><tspan x="0" y="0">I</tspan></text>
                            <text class="st25" transform="translate(806.15 481.23)"><tspan x="0" y="0">L</tspan></text>
                          </g>
                        </g>
                        <g id="linkedin">
                          <path class="st31" d="M973.97,375.66c-3.83,1.51-9.37,3.2-16.21,3.68-8.76.62-15.89-1.01-20.31-2.4-.18,7.31-.35,14.61-.53,21.92.03.56.03,1.76-.63,3.05-.89,1.73-2.36,2.48-2.85,2.71-34.1,14.72-51.01,51.21-41.31,82.16,7.94,25.33,32.5,43.02,59.24,44.39,28.25,1.44,55.05-15.53,64.79-41.1,11.83-31.05-3.58-69.3-37.68-85.5-1.04-.62-2.5-1.7-3.45-3.51-.35-.67-.68-1.53-.86-2.71-.44-2.86-.55-11.33-.2-22.68h0Z"/>
                          <path class="st14" d="M969.64,377.16c-.27,3.8-.76,12.57.16,21.12.33,3.04.92,7.07,3.97,9.61.67.56,1.38.99,2.07,1.32,24.33,11.24,40.02,34.28,39.72,58.55-.32,26.28-19.26,43.28-21.52,45.25-12.82,11.15-28.07,14.44-33.74,15.66-8.89,1.92-15.26,1.92-15.27,1.84-.02-.15,26.09,2.93,46.98-10.64,23.3-15.13,27.48-42.78,27.66-44.16,3.14-23.22-8.05-40.4-10.96-44.87-7.01-10.77-16.96-18.79-20.89-21.02-1.99-1.13-3.89-2.41-5.89-3.53-3.83-2.15-5.24-2.66-6.44-4.34-.8-1.12-1.67-2.99-1.55-6.04,0-6.75.02-13.51.02-20.26-1.44.5-2.89,1-4.33,1.5h.01Z"/>
                          <path class="st14" d="M963.96,395.45c-2.21.23-4.1,5.53-3.05,9.79.6,2.45,2.5,5.88,4.89,5.88,1.07,0,1.85-.68,2.07-.87,2.43-2.11,1.29-6.72,1.04-7.71-.71-2.86-2.84-7.3-4.95-7.08h0Z"/>
                          <path class="st14" d="M990.98,428.36c-.56-.9-5.98-9.65-10.42-8.45-1.33.36-2.41,1.57-3.57,2.88-.3.34-1.75,1.97-2.42,3.74-1.39,3.67.35,8.39,3.11,11.28,3.43,3.59,9.65,5.64,13.3,3.11,1.65-1.15,2.3-2.9,2.49-3.5,1.03-3.28-.8-6.33-2.49-9.06h0Z"/>
                          <path class="st14" d="M961.62,427.7c-2.76.13-4.98,3.72-4.09,6.62.64,2.08,2.89,3.85,5.12,3.45,2.68-.48,4.14-3.86,3.4-6.45-.55-1.92-2.4-3.72-4.43-3.63h0Z"/>
                          <path class="st14" d="M936.84,400.22c.98.64,1.46,1.37,1.69,1.8,1.19,2.22.35,5.1-1.19,6.72-.44.46-.88.76-1.19.96-6.13,3.06-13.21,7.55-19.95,14.2-22.67,22.36-24.36,52.19-24.52,61.34-1-4.97-5.59-30.05,8.53-52.47,8.63-13.71,22.49-23.62,26.53-24.86.88-.27,2.82-1.28,6.71-3.3.57-.3,1.68-.89,2.51-2.14.56-.85.79-1.69.89-2.26h-.01Z"/>
                          <path class="st20" d="M1011.44,464.06c-10.94,4.52-32.5,11.69-60.08,9.55-23.82-1.85-41.81-9.86-51.86-15.27-.56,3.05-4.77,28.58,13.25,47.94,13.78,14.8,31.61,16.4,37.19,16.81,4.85.36,30.29,1.63,47.9-18.42,14.47-16.48,13.84-36.18,13.59-40.6h0Z"/>
                          <path class="st17" d="M1011.07,463.9c.04-1.3-.06-3.06-.69-5-5.68-17.44-44.43-18.26-56.08-18.5-15.55-.33-38.91-.49-52.94,15.06-.99,1.1-1.74,2.06-2.23,2.71,10.05,5.41,28.03,13.42,51.86,15.27,27.58,2.15,49.13-5.03,60.08-9.55h0Z"/>
                          <path class="st4" d="M981.15,516.98c-37.86-7.52-63.29-31.73-63.53-55.09-.19-18.23,14.9-41.44,23.5-40.75,1.58.13,6.8,1.38,8.87-1.21.58-.73.72-1.52.81-2.13.99-6.8.03-18.85.23-21.48.08-1.05.44-1.79.52-1.95.35-.69.8-1.16,1.1-1.44,1.08-1,7.27-6.11,15.82-13.01-.02-.8-.04-1.6-.06-2.4-3.96,1.09-9.7,2.19-16.64,1.92-5.87-.23-10.75-1.37-14.32-2.49-.16,6.92-.31,13.84-.47,20.77-.04.84-.09,1.68-.13,2.52.4.25,1.16.81,1.69,1.8.42.79.5,1.5.54,1.85.16,1.59-.42,2.82-.65,3.28-.21.44-.99,1.88-2.54,2.76-.53.3-.83.35-2.09,1.01,0,0-.68.36-1.42.79-13.28,7.74-20.82,17.2-20.82,17.2-8.85,11.1-11.51,23.36-12.42,29.27-.58,3.49-4.34,28.54,12.79,47.48,16.23,17.94,44.48,22.94,69.22,11.32v-.02Z"/>
                          <path class="st18" d="M994.9,480.9c.01-3.95-3.71-7.54-5.96-7.06-3.07.65-5.18,9.24-1.99,12.41.11.11,1.37,1.33,3.07,1.21,2.65-.18,4.87-3.53,4.88-6.56Z"/>
                          <path class="st31" d="M973.05,349.2c3.84,1.65,12.98,6.08,13.34,12.38.5,8.79-16.24,17.8-30.87,18.01-13.95.21-31.19-7.51-31.15-16.84.03-7.85,12.28-13.69,15-14.94-.37,1.25-2.78,9.81,1.47,13.64,1.64,1.48,3.32,1.41,12.26,1.12,13.88-.44,18.03-.52,19.25-3.15.34-.74.43-2.41.61-5.75.1-1.89.1-3.45.09-4.49v.02Z"/>
                          <path class="st0" d="M973.42,340.65c2.59-3.43,2.43-5.7,2.14-6.82-1.56-6.07-14.45-6.67-17.57-6.82-6.15-.29-19.48.43-21.11,6.5-.65,2.41.74,4.95,2.11,6.8-.58,8.17-.81,14.45-.79,17.44,0,.81.04,2.37,1.1,3.49.91.96,2.15,1.16,2.74,1.25,5.42.78,13.37.87,16.53.97,1.36.04,6.78.24,10.39-1.02.72-.25,1.8-.71,2.62-1.74.91-1.14,1.06-2.41,1.13-3.09.27-2.6.58-8.77.72-16.95h-.01Z"/>
                          <path class="st6" d="M973.99,339.86c-.2.38-.54.94-1.05,1.54-1.79,2.1-4.91,3.7-17.79,3.23-13.47-.49-15.67-2.43-16.38-4.09-.16-.37-.24-.71-.27-.94.2.15.49.37.86.63,2.42,1.66,5.94,3.22,17.23,3.34,10.31.11,13.49-1.12,15.83-2.59.68-.43,1.22-.83,1.57-1.11h0Z"/>
                          <path class="st30" d="M1070.04,288.36c0,28.56-29.46,48.76-47.09,47.09-7.59-.72-16.82-5.85-27.98-1.36-5.36,2.15-8.59,5.49-10.92,4.09-3.12-1.87-.17-9.55,0-19.11.27-15.71-7.25-20.64-8.19-30.71-1.63-17.58,17.17-47.09,47.09-47.09,26.01,0,47.09,21.08,47.09,47.09h0Z"/>
                          <path class="st11" d="M915.7,462.4c10.59,1.96,23.31,3.51,37.72,3.67,16.48.18,30.88-1.51,42.55-3.67v26.91c-11.36,2.15-25.42,3.87-41.55,3.76-14.9-.1-27.98-1.73-38.72-3.76v-26.91h0Z"/>
                          <g class="st5">
                            <text class="st25" transform="translate(926.88 483.59)"><tspan x="0" y="0">L</tspan></text>
                            <text class="st25" transform="translate(931.5 483.59)"><tspan x="0" y="0">I</tspan></text>
                            <text class="st10" transform="translate(936.36 483.59)"><tspan x="0" y="0">N</tspan></text>
                            <text class="st25" transform="translate(945.55 483.59)"><tspan x="0" y="0">KED</tspan></text>
                            <text class="st25" transform="translate(970.38 483.59)"><tspan x="0" y="0">I</tspan></text>
                            <text class="st25" transform="translate(975.23 483.59)"><tspan x="0" y="0">N</tspan></text>
                          </g>
                        </g>
                        <g id="Table">
                          <path class="st1" d="M398.55,572.77c-6.68,5.38-27.81,23.84-32.33,54.26-4.05,27.25,7.51,48.79,12.98,58.98,12.8,23.86,23.87,24.2,30.67,38.93,15.33,33.22-22.63,71.38-37.75,109.71-14.42,36.56-16.87,95.54,41.29,192.28h19.48c-31.93-75.79-25.99-126.15-14.76-158.07,21.81-61.96,83.12-109.96,66.06-156.89-3.32-9.14-10.83-21.58-10.62-41.29.22-20.46,8.65-37.05,15.65-47.79,9.17,4.55,24.21,10.74,43.33,12.4,39.88,3.45,56.38-16.39,90.83-10.62,23.97,4.01,19.71,14.24,50.72,24.77,7.15,2.43,52.03,17.01,100.27,1.18,35.68-11.71,37.36-28.29,66.06-29.49,22.57-.94,30.09,8.96,56.62,11.8,27.86,2.98,51.34-4.55,66.23-10.94,5.92,8.42,13.64,21.8,16.34,39.25,4.54,29.28-8.74,46.1-12.98,66.06-10.98,51.66,47.56,82.08,69.6,145.09,11.21,32.04,16.05,81.32-16.06,154.53h21.08c18.38-41.54,55.99-134.63,39.81-184.02-2.99-9.14-7.08-20.05-7.08-20.05-21.03-56.21-32.33-59.49-34.21-77.86-4-39.08,44.43-51.29,49.54-96.73,3.42-30.39-14.57-57.48-30.12-75.5H398.55Z"/>
                          <polygon class="st1" points="325.36 528.33 1125 528.33 1108.21 572.77 347.05 572.77 325.36 528.33"/>
                        </g>
                      </svg>
                </div>
        `;
  };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#829c84");

  const phi = THREE.MathUtils.degToRad(60);
  const theta = THREE.MathUtils.degToRad(120);

  const sky = {
    material: {
      uniforms: {
        sunPosition: { value: new THREE.Vector3() },
      },
    },
  };
  window.sky = sky;

  const cloudGeometry = new THREE.PlaneGeometry(200, 200, 16, 16);

  var sunObj = scene.getObjectByName("Sun") || null;
  if (!sunObj) {
    window.addSunHelper = function (sunLight) {
      const helper = new THREE.DirectionalLightHelper(sunLight, 2, 0xffff00);
      scene.add(helper);
    };
  } else {
    const helper = new THREE.DirectionalLightHelper(sunObj, 2, 0xffff00);
    scene.add(helper);
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener("click", function (event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const obj = intersects.find((i) => {
        const o = i.object;

        const isHelper =
          o.type.endsWith("Helper") || o.name.toLowerCase().includes("helper");
        return o.type === "Mesh" && !isHelper;
      })?.object;
    }
  });
  const cloudMaterial = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
      opacity: { value: 0.6 },
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform float opacity;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
        
        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        
        float fbm(vec2 st) {
            float value = 0.0;
            float amplitude = 0.5;
            for (int i = 0; i < 6; i++) {
                value += amplitude * noise(st);
                st *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }
        
        void main() {
            vec2 uv = vUv * 3.0;
            uv.x += time * 0.02;
            
            float clouds = fbm(uv);
            clouds = smoothstep(0.3, 0.8, clouds);
            
            vec3 cloudColor = mix(vec3(0.9, 0.95, 1.0), vec3(1.0), clouds);
            
            float alpha = clouds * opacity;
            alpha *= smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
            alpha *= smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
            
            gl_FragColor = vec4(cloudColor, alpha);
        }
    `,
  });

  const cloudLayers = [];
  for (let i = 0; i < 3; i++) {
    const cloudLayer = new THREE.Mesh(cloudGeometry, cloudMaterial.clone());
    cloudLayer.rotation.x = -Math.PI / 2;
    cloudLayer.position.y = 40 + i * 5;
    cloudLayer.position.z = -20 - i * 10;
    cloudLayer.material.uniforms.opacity.value = 0.4 - i * 0.1;
    scene.add(cloudLayer);
    cloudLayers.push(cloudLayer);
  }

  window.cloudLayers = cloudLayers;

  const sun = new THREE.DirectionalLight(0xffaa33, 4.3);
  window.sun = sun;
  sun.position.set(40, 20, 40);
  sun.target.position.set(0, 0, 0);
  scene.add(sun);
  scene.add(sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 100;
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 30;
  sun.shadow.camera.bottom = -30;
  sun.shadow.bias = -0.001;

  const ambient = new THREE.AmbientLight(0x603020, 0.6);
  window.ambient = ambient;
  scene.add(ambient);

  const fireLight = new THREE.PointLight(0xff6600, 15, 25, 2);
  fireLight.position.set(-7.7, 5, 0);
  fireLight.castShadow = true;
  scene.add(fireLight);

  const moonFill = new THREE.PointLight(0x445588, 0.8, 30, 2);
  moonFill.position.set(-10, 8, 10);
  scene.add(moonFill);

  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(5, 15, 10);

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
    stencil: false,
    depth: true,
    logarithmicDepthBuffer: false,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 0.3;

  renderer.setSize(window.innerWidth, window.innerHeight, true);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.info.autoReset = false;

  document.getElementById("app").appendChild(renderer.domElement);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.02,
  ).texture;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  if (!isMobile) {
    const bloomPass = new UnrealBloomPass();
    bloomPass.strength = 0.03;
    bloomPass.radius = 0;
    bloomPass.threshold = 0;
    composer.addPass(bloomPass);
  }
  const controls = new OrbitControls(camera, renderer.domElement);
  let cameraMoveEnabled = true;
  controls.enabled = cameraMoveEnabled;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enableRotate = true;
  controls.enablePan = true;

  const allHitboxHelpers = [];
  let showHitboxes = false;

  function walkChildren(object, callback) {
    if (!object) return;
    callback(object);
    if (object.children && object.children.length) {
      object.children.forEach((child) => walkChildren(child, callback));
    }
  }

  const loader = new GLTFLoader(loadingManager);
  loader.setMeshoptDecoder(MeshoptDecoder);

  loader.load("/assets/3D/room.glb", async (gltf) => {
    let modelLoaded = false;
    loader.load(
      "/assets/3D/room.glb",
      async (gltf) => {
        modelLoaded = true;
        gltf.scene.traverse((child) => {
          if (child.name) {
          } else {
          }
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.envMapIntensity = 1;
              child.material.depthWrite = true;
              child.material.needsUpdate = true;
              if (child.material.opacity >= 0.99 && !child.material.alphaMap) {
                child.material.transparent = false;
              }
            }
            if (child.geometry) {
              child.geometry.computeBoundingBox();
              const bbox = child.geometry.boundingBox.clone();
              const boxHelper = new THREE.Box3Helper(bbox, 0xff00ff);
              boxHelper.visible = showHitboxes;
              child.add(boxHelper);
              allHitboxHelpers.push(boxHelper);
            }
          }
        });

        const mur = gltf.scene.getObjectByName("Mur001");
        if (mur) {
          mur.parent.remove(mur);
        }

        const plane = gltf.scene.getObjectByName("Plane001");
        if (plane) {
          plane.parent.remove(plane);
        }

        scene.add(gltf.scene);

        if (window._bgMusicPlay) window._bgMusicPlay();

        const magicHat = gltf.scene.getObjectByName("Chapeau");
        const bandeau = gltf.scene.getObjectByName(objMesh.bandeau);
        const livre = gltf.scene.getObjectByName(objMesh.livre);
        const telephone = gltf.scene.getObjectByName(objMesh.tel);

        let hatGroup = null;
        if (magicHat && bandeau) {
          const center = new THREE.Vector3()
            .addVectors(magicHat.position, bandeau.position)
            .multiplyScalar(0.5);
          hatGroup = new THREE.Group();
          hatGroup.position.copy(center);
          magicHat.position.sub(center);
          bandeau.position.sub(center);
          if (magicHat.parent) magicHat.parent.remove(magicHat);
          if (bandeau.parent) bandeau.parent.remove(bandeau);
          hatGroup.add(magicHat);
          hatGroup.add(bandeau);
          gltf.scene.add(hatGroup);
        }

        const hoverObjects = [];
        if (hatGroup) {
          hoverObjects.push({ mesh: hatGroup, name: "magicHatGroup" });
        } else {
          if (magicHat) hoverObjects.push({ mesh: magicHat, name: "magicHat" });
          if (bandeau)
            hoverObjects.push({ mesh: bandeau, name: objMesh.bandeau });
        }
        if (livre) {
          const livreName = livre.name || "livre";
          hoverObjects.push({ mesh: livre, name: livreName });
        }
        if (telephone) {
          hoverObjects.push({ mesh: telephone, name: objMesh.tel });
        }

        if (hoverObjects.length > 0) {
          window.camera = camera;

          hoverObjects.forEach((obj) => {
            obj.isHovered = false;
            obj.hoverTimeout = null;
            obj.originalPosition = obj.mesh.position.clone();
            obj.originalRotation = obj.mesh.rotation.clone();
            obj.originalScale = obj.mesh.scale.clone();

            let meshForBox = obj.mesh;
            let expand = 0.3;
            if (obj.name === objMesh.livre || obj.name === "livre")
              expand = 0.7;
            if (obj.mesh.isGroup || !meshForBox.geometry) {
              let groupBox = null;
              obj.mesh.traverse((child) => {
                if (child.isMesh && child.geometry) {
                  child.geometry.computeBoundingBox();
                  const childWorldBox = child.geometry.boundingBox.clone();
                  child.updateMatrixWorld(true);
                  childWorldBox.applyMatrix4(child.matrixWorld);
                  if (!groupBox) {
                    groupBox = childWorldBox;
                  } else {
                    groupBox.union(childWorldBox);
                  }
                }
              });
              if (groupBox) {
                obj.mesh.updateMatrixWorld(true);
                const invGroupMatrix = obj.mesh.matrixWorld.clone().invert();
                groupBox.applyMatrix4(invGroupMatrix);
                obj.boundingBox = groupBox.expandByScalar(expand);
                obj._boundingBoxMesh = obj.mesh;
              } else {
                obj.boundingBox = null;
                obj._boundingBoxMesh = null;
              }
            } else {
              meshForBox.geometry.computeBoundingBox();
              obj.boundingBox = meshForBox.geometry.boundingBox
                .clone()
                .expandByScalar(expand);
              obj._boundingBoxMesh = meshForBox;
            }

            if (obj._boundingBoxMesh) {
              obj.mesh.updateMatrixWorld(true);
              obj.initialWorldMatrix = obj._boundingBoxMesh.matrixWorld.clone();
            }
          });

          function isPointerInBox(mouse, obj) {
            if (!obj.boundingBox || !obj._boundingBoxMesh) return false;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            let worldBox = null;
            if (obj.mesh.isGroup || !obj._boundingBoxMesh.geometry) {
              obj.mesh.updateMatrixWorld(true);
              obj.mesh.traverse((child) => {
                if (child.isMesh && child.geometry) {
                  child.geometry.computeBoundingBox();
                  const childBox = child.geometry.boundingBox.clone();
                  child.updateMatrixWorld(true);
                  childBox.applyMatrix4(child.matrixWorld);
                  if (!worldBox) {
                    worldBox = childBox;
                  } else {
                    worldBox.union(childBox);
                  }
                }
              });
            } else {
              obj._boundingBoxMesh.updateMatrixWorld(true);
              worldBox = obj.boundingBox.clone();
              worldBox.applyMatrix4(obj._boundingBoxMesh.matrixWorld);
            }
            return worldBox ? raycaster.ray.intersectsBox(worldBox) : false;
          }

          function getHoverOffset(time, hovered) {
            if (!hovered) return 0;
            return Math.sin(time * 3) * 0.08;
          }

          function getHoverRotation(time, hovered) {
            if (!hovered) return 0;
            return Math.sin(time * 2) * 0.05;
          }

          function lerp(current, target, alpha) {
            return current + (target - current) * alpha;
          }

          function getHoverConfig(objName) {
            const configs = {
              magicHat: {
                lift: 0.3,
                scale: 1.05,
                rotationX: 0.08,
                rotationY: 0.1,
                rotationZ: 0.05,
              },
              magicHatGroup: {
                lift: 0.3,
                scale: 1.05,
                rotationX: 0.08,
                rotationY: 0.1,
                rotationZ: 0.05,
              },
              livre: {
                lift: 0.3,
                scale: 1.05,
                rotationX: 0.08,
                rotationY: 0.1,
                rotationZ: 0.05,
              },
              [objMesh.livre]: {
                lift: 0.3,
                scale: 1.05,
                rotationX: 0.08,
                rotationY: 0.1,
                rotationZ: 0.05,
              },
              [objMesh.tel]: {
                lift: 0.2,
                scale: 1.03,
                rotationX: 0.03,
                rotationY: 0.05,
                rotationZ: 0.02,
              },
            };

            return (
              configs[objName] || {
                lift: 0.3,
                scale: 1.05,
                rotationX: 0.08,
                rotationY: 0.1,
                rotationZ: 0.05,
              }
            );
          }

          function animateHoverAll() {
            const time = performance.now() * 0.001;
            hoverObjects.forEach((obj) => {
              const config = getHoverConfig(obj.name);

              if (obj.isHovered) {
                const targetY =
                  obj.originalPosition.y +
                  config.lift +
                  getHoverOffset(time, true);
                obj.mesh.position.y = lerp(obj.mesh.position.y, targetY, 0.08);

                const targetRotX =
                  obj.originalRotation.x +
                  Math.sin(time * 1.2) * config.rotationX;
                obj.mesh.rotation.x = lerp(
                  obj.mesh.rotation.x,
                  targetRotX,
                  0.08,
                );

                const targetRotY =
                  obj.originalRotation.y +
                  Math.sin(time * 1.5) * config.rotationY;
                obj.mesh.rotation.y = lerp(
                  obj.mesh.rotation.y,
                  targetRotY,
                  0.08,
                );

                const targetRotZ =
                  obj.originalRotation.z +
                  getHoverRotation(time, true) * config.rotationZ;
                obj.mesh.rotation.z = lerp(
                  obj.mesh.rotation.z,
                  targetRotZ,
                  0.08,
                );

                obj.mesh.scale.x = lerp(
                  obj.mesh.scale.x,
                  obj.originalScale.x * config.scale,
                  0.08,
                );
                obj.mesh.scale.y = lerp(
                  obj.mesh.scale.y,
                  obj.originalScale.y * config.scale,
                  0.08,
                );
                obj.mesh.scale.z = lerp(
                  obj.mesh.scale.z,
                  obj.originalScale.z * config.scale,
                  0.08,
                );
              } else {
                obj.mesh.position.y = lerp(
                  obj.mesh.position.y,
                  obj.originalPosition.y,
                  0.08,
                );

                obj.mesh.rotation.x = lerp(
                  obj.mesh.rotation.x,
                  obj.originalRotation.x,
                  0.08,
                );
                obj.mesh.rotation.y = lerp(
                  obj.mesh.rotation.y,
                  obj.originalRotation.y,
                  0.08,
                );
                obj.mesh.rotation.z = lerp(
                  obj.mesh.rotation.z,
                  obj.originalRotation.z,
                  0.08,
                );

                obj.mesh.scale.x = lerp(
                  obj.mesh.scale.x,
                  obj.originalScale.x,
                  0.08,
                );
                obj.mesh.scale.y = lerp(
                  obj.mesh.scale.y,
                  obj.originalScale.y,
                  0.08,
                );
                obj.mesh.scale.z = lerp(
                  obj.mesh.scale.z,
                  obj.originalScale.z,
                  0.08,
                );
              }
            });
            requestAnimationFrame(animateHoverAll);
          }
          animateHoverAll();

          const mouse = new THREE.Vector2();

          const oldTooltip = document.getElementById("tooltip");
          if (oldTooltip) oldTooltip.remove();

          const labelsContainer = document.createElement("div");
          labelsContainer.id = "labels-container";
          document.body.appendChild(labelsContainer);

          hoverObjects.forEach((obj) => {
            let labelText = "";
            if (obj.name === "magicHat" || obj.name === "magicHatGroup")
              labelText = "A PROPOS";
            if (obj.name === "livre" || obj.name === objMesh.livre)
              labelText = "MES PROJETS";
            if (obj.name === objMesh.tel) labelText = "CONTACT";

            if (labelText) {
              const labelConfig = {
                default: { width: 280, height: 100, fontSize: 26 },
              };

              const config = labelConfig.default;

              const scaleFactor = 3;
              const w = config.width * scaleFactor,
                h = config.height * scaleFactor;
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              canvas.width = w;
              canvas.height = h;
              ctx.scale(scaleFactor, scaleFactor);
              -ctx.save();
              ctx.beginPath();
              ctx.moveTo(16, 0);
              ctx.lineTo(config.width - 16, 0);
              ctx.quadraticCurveTo(config.width, 0, config.width, 16);
              ctx.lineTo(config.width, config.height - 32);
              ctx.quadraticCurveTo(
                config.width,
                config.height - 16,
                config.width - 16,
                config.height - 16,
              );
              ctx.lineTo(config.width / 2 + 18, config.height - 16);
              ctx.lineTo(config.width / 2, config.height);
              ctx.lineTo(config.width / 2 - 18, config.height - 16);
              ctx.lineTo(16, config.height - 16);
              ctx.quadraticCurveTo(
                0,
                config.height - 16,
                0,
                config.height - 32,
              );
              ctx.lineTo(0, 16);
              ctx.quadraticCurveTo(0, 0, 16, 0);
              ctx.closePath();
              ctx.fillStyle = "rgba(42,26,16,0.95)";
              ctx.shadowColor = "rgba(191,167,106,0.25)";
              ctx.shadowBlur = 12;
              ctx.fill();
              ctx.restore();

              ctx.save();
              ctx.lineWidth = 3.5;
              ctx.strokeStyle = "#e6c97a";
              ctx.shadowColor = "rgba(191,167,106,0.18)";
              ctx.shadowBlur = 2;
              ctx.stroke();
              ctx.restore();

              ctx.save();
              ctx.font = `bold ${config.fontSize}px serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#fffbe6";
              ctx.shadowColor = "#e6c97a";
              ctx.shadowBlur = 8;
              ctx.fillText(labelText, config.width / 2, config.height / 2 - 10);
              ctx.restore();

              ctx.save();
              ctx.beginPath();
              ctx.moveTo(config.width / 2 - 18, config.height - 16);
              ctx.lineTo(config.width / 2 + 18, config.height - 16);
              ctx.lineTo(config.width / 2, config.height);
              ctx.closePath();
              ctx.fillStyle = "#2a1a10";
              ctx.shadowColor = "#bfa76a";
              ctx.shadowBlur = 6;
              ctx.fill();
              ctx.restore();

              const texture = new THREE.CanvasTexture(canvas);
              texture.minFilter = THREE.LinearFilter;
              texture.needsUpdate = true;

              if (isMobile) texture.anisotropy = 1;

              const material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
              });
              const sprite = new THREE.Sprite(material);

              sprite.scale.set(1.8, 0.7, 1);

              obj.labelSprite = sprite;
              scene.add(sprite);
            }

            if (obj.boundingBox) {
              const boxHelper = new THREE.Box3Helper(obj.boundingBox, 0x00ff00);
              boxHelper.name = `hitbox_interactive_${obj.name}`;
              boxHelper.visible = showHitboxes;
              obj.boxHelper = boxHelper;
              allHitboxHelpers.push(boxHelper);
              if (obj.mesh.parent) obj.mesh.parent.add(boxHelper);
            }
          });

          function updateLabels() {
            hoverObjects.forEach((obj) => {
              if (obj.boxHelper && obj.boundingBox) {
                obj._boundingBoxMesh.updateMatrixWorld(true);
                const worldMatrix = new THREE.Matrix4();
                if (obj._boundingBoxMesh.parent) {
                  worldMatrix.copy(obj._boundingBoxMesh.parent.matrixWorld);
                }
                const tempMatrix = new THREE.Matrix4();
                tempMatrix.compose(
                  obj.originalPosition,
                  new THREE.Quaternion().setFromEuler(obj.originalRotation),
                  obj.originalScale,
                );
                worldMatrix.multiply(tempMatrix);
                const worldBox = obj.boundingBox.clone();
                worldBox.applyMatrix4(worldMatrix);
                obj.boxHelper.box.copy(worldBox);
              }

              if (obj.labelSprite) {
                let labelWorldPos = new THREE.Vector3();
                if (obj.name === "magicHatGroup" || obj.name === "magicHat") {
                  let mesh = obj.mesh;
                  let realBox = null;
                  if (mesh.isGroup) {
                    mesh.traverse((child) => {
                      if (child.isMesh && child.geometry) {
                        child.geometry.computeBoundingBox();
                        const childBox = child.geometry.boundingBox.clone();
                        child.updateMatrixWorld(true);
                        childBox.applyMatrix4(child.matrixWorld);
                        if (!realBox) realBox = childBox;
                        else realBox.union(childBox);
                      }
                    });
                  } else if (mesh.geometry) {
                    mesh.geometry.computeBoundingBox();
                    realBox = mesh.geometry.boundingBox.clone();
                    mesh.updateMatrixWorld(true);
                    realBox.applyMatrix4(mesh.matrixWorld);
                  }
                  if (realBox) {
                    labelWorldPos.set(
                      (realBox.min.x + realBox.max.x) / 2,
                      realBox.max.y + 0.55,
                      (realBox.min.z + realBox.max.z) / 2,
                    );
                  } else {
                    labelWorldPos.copy(obj.mesh.position);
                    labelWorldPos.y += 1.0;
                  }
                } else if (obj.name === objMesh.livre || obj.name === "livre") {
                  let mesh = obj.mesh;
                  let realBox = null;
                  if (mesh.isGroup) {
                    mesh.traverse((child) => {
                      if (child.isMesh && child.geometry) {
                        child.geometry.computeBoundingBox();
                        const childBox = child.geometry.boundingBox.clone();
                        child.updateMatrixWorld(true);
                        childBox.applyMatrix4(child.matrixWorld);
                        if (!realBox) realBox = childBox;
                        else realBox.union(childBox);
                      }
                    });
                  } else if (mesh.geometry) {
                    mesh.geometry.computeBoundingBox();
                    realBox = mesh.geometry.boundingBox.clone();
                    mesh.updateMatrixWorld(true);
                    realBox.applyMatrix4(mesh.matrixWorld);
                  }
                  if (realBox) {
                    labelWorldPos.set(
                      (realBox.min.x + realBox.max.x) / 2,
                      realBox.max.y + 0.55,
                      (realBox.min.z + realBox.max.z) / 2,
                    );
                  } else {
                    labelWorldPos.copy(obj.mesh.position);
                    labelWorldPos.y += 1.0;
                  }
                } else if (obj.name === objMesh.tel) {
                  let mesh = obj.mesh;
                  let realBox = null;
                  if (mesh.geometry) {
                    mesh.geometry.computeBoundingBox();
                    realBox = mesh.geometry.boundingBox.clone();
                    mesh.updateMatrixWorld(true);
                    realBox.applyMatrix4(mesh.matrixWorld);
                  }
                  if (realBox) {
                    labelWorldPos.set(
                      (realBox.min.x + realBox.max.x) / 2,
                      realBox.max.y + 0.55,
                      (realBox.min.z + realBox.max.z) / 2,
                    );
                  } else {
                    labelWorldPos.copy(obj.mesh.position);
                    labelWorldPos.y += 1.0;
                  }
                } else if (obj.boundingBox) {
                  obj._boundingBoxMesh.updateMatrixWorld(true);
                  const worldMatrix = new THREE.Matrix4();
                  if (obj._boundingBoxMesh.parent) {
                    worldMatrix.copy(obj._boundingBoxMesh.parent.matrixWorld);
                  }
                  const tempMatrix = new THREE.Matrix4();
                  tempMatrix.compose(
                    obj.originalPosition,
                    new THREE.Quaternion().setFromEuler(obj.originalRotation),
                    obj.originalScale,
                  );
                  worldMatrix.multiply(tempMatrix);
                  const worldBox = obj.boundingBox.clone();
                  worldBox.applyMatrix4(worldMatrix);
                  labelWorldPos.set(
                    (worldBox.min.x + worldBox.max.x) / 2,
                    worldBox.max.y + 0.65,
                    (worldBox.min.z + worldBox.max.z) / 2,
                  );
                } else {
                  labelWorldPos.copy(obj.mesh.position);
                  labelWorldPos.y += 1.0;
                }
                obj.labelSprite.position.copy(labelWorldPos);
                obj.labelSprite.visible = true;
                obj.labelSprite.material.opacity = 1;
                obj.labelSprite.lookAt(camera.position);
              }
            });
          }

          window.updateLabels = updateLabels;

          window.addEventListener("pointermove", (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            let anyHover = false;

            hoverObjects.forEach((obj) => {
              const over = isPointerInBox(mouse, obj);

              if (over) {
                obj.isHovered = true;
                anyHover = true;
                if (obj.hoverTimeout) {
                  clearTimeout(obj.hoverTimeout);
                  obj.hoverTimeout = null;
                }
              } else {
                if (!obj.hoverTimeout && obj.isHovered) {
                  obj.hoverTimeout = setTimeout(() => {
                    obj.isHovered = false;
                    obj.hoverTimeout = null;
                  }, 200);
                }
              }
            });

            document.body.style.cursor = anyHover ? "pointer" : "";
          });

          window.addEventListener("click", (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            hoverObjects.forEach((obj) => {
              const over = isPointerInBox(mouse, obj);
              if (over) {
                const modal = document.getElementById("magicHatModal");
                const aboutCard = document.getElementById("aboutCard");
                if (!modal || !aboutCard) return;

                if (obj.name === "magicHat" || obj.name === "magicHatGroup") {
                  if (window.showModal) window.showModal();
                  aboutCard.innerHTML = "";
                  import("./info.js").then(async (module) => {
                    const data = module.info;
                    const fetchedRes = await fetch("/api/profile");
                    const fetchedData = await fetchedRes.json();
                    aboutCard.appendChild(
                      await window.renderStyledCard({
                        title: "A PROPOS",
                        image: data.photo || "",
                        description: fetchedData.data?.description || "",
                        tags: [],
                        link: "",
                        isProject: false,
                      }),
                    );
                  });
                }

                if (obj.name === "livre" || obj.name === objMesh.livre) {
                  if (window.showModal) window.showModal();
                  aboutCard.innerHTML = "";
                  import("./projets.js").then(async (module) => {
                    const projets = await module.projets;
                    const aboutCard = document.getElementById("aboutCard");
                    let parseRichText = null;
                    if (aboutCard && aboutCard.appendChild) {
                      if (window.renderStyledCard) {
                        const dummy = window.renderStyledCard({
                          title: "",
                          image: "",
                          description: "",
                          tags: [],
                          link: "",
                          isProject: false,
                        });
                        parseRichText = dummy.constructor
                          .toString()
                          .match(/function parseRichText\(text\) {(.*?)};/s);
                      }
                    }

                    if (!parseRichText) {
                      parseRichText = function (text) {
                        if (!text) return "";
                        const lines = text.split(/\r?\n/);
                        let inList = false;
                        let html = "";
                        for (let i = 0; i < lines.length; i++) {
                          let line = lines[i];
                          if (/^##\s*(.+)/.test(line)) {
                            if (inList) {
                              html += "</ul>";
                              inList = false;
                            }
                            html +=
                              '<div class="font-bold text-lg mt-4 mb-2">' +
                              line.replace(/^##\s*/, "") +
                              "</div>";
                            continue;
                          }
                          line = line.replace(/\*([^*]+)\*/g, "<b>$1</b>");
                          if (/^\s*- /.test(line)) {
                            if (!inList) {
                              html += '<ul class="list-disc pl-6 mb-2">';
                              inList = true;
                            }
                            html +=
                              "<li>" + line.replace(/^\s*- /, "") + "</li>";
                          } else if (line.trim() === "") {
                            if (inList) {
                              html += "</ul>";
                              inList = false;
                            }
                            html += "<br>";
                          } else {
                            if (inList) {
                              html += "</ul>";
                              inList = false;
                            }
                            html += line + "<br>";
                          }
                        }
                        if (inList) html += "</ul>";
                        html = html.replace(/(<br>)+$/, "");
                        return html;
                      };
                    }
                    Object.keys(projets).forEach((key) => {
                      if (projets[key].description) {
                        projets[key].description = parseRichText(
                          projets[key].description,
                        );
                      }
                    });
                    window.showProjectCard(projets);
                  });
                }
                if (obj.name === objMesh.tel) {
                  if (window.showModal) {
                    window.showModal();
                    fetch("/api/profile")
                      .then((res) => res.json())
                      .then((data) => {
                        window.info = window.info || {};
                        window.info.contact = {
                          whatsapp: data.data?.whatsapp || "",
                          facebook: data.data?.facebook || "",
                          linkedin: data.data?.linkedin || "",
                          email: data.data?.gmail || "",
                        };
                        import("./contact.js")
                          .then(() => {
                            window.showContactInfo();
                          })
                          .catch((error) => {
                            console.error(
                              "Erreur lors du chargement du module contact:",
                              error,
                            );
                          });
                      });
                  } else {
                    console.error(
                      "[3D Portfolio] showModal fonction non disponible",
                    );
                  }
                }
              }
            });
          });
        }

        const lamp = gltf.scene.getObjectByName("lamp");
        if (lamp) {
          const lampLight = new THREE.PointLight(0xffaa00, 2, 5);
          lampLight.position.set(0, 0.5, 0);
          lamp.add(lampLight);

          const sphereGeo = new THREE.SphereGeometry(0.15, 32, 32);
          const sphereMat = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 5,
            toneMapped: false,
          });
          const sphere = new THREE.Mesh(sphereGeo, sphereMat);
          sphere.position.copy(lampLight.position);
          lamp.add(sphere);
        }

        const cyl = gltf.scene.getObjectByName("Cylinder008");
        if (cyl) {
          const cylLight = new THREE.PointLight(0xffaa00, 1, 5);
          cylLight.position.set(0, 0.5, 0);
          cyl.add(cylLight);

          const sphereGeo = new THREE.SphereGeometry(0.15, 32, 32);
          const sphereMat = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 5,
            toneMapped: false,
          });
          const sphere = new THREE.Mesh(sphereGeo, sphereMat);
          sphere.position.copy(cylLight.position);
          cyl.add(sphere);
        }

        animate();

        setTimeout(() => {
          animateCameraTo({ x: 7.9, y: 8, z: 7.03 }, 2000);
        }, 2000);
      },
      undefined,
      (error) => {
        if (isMobile) {
          const aboutCard = document.getElementById("aboutCard");
          if (aboutCard) {
            aboutCard.innerHTML =
              '<div class="p-8 text-center text-lg">Impossible de charger la scène 3D sur ce mobile.<br>Essayez sur un ordinateur ou un appareil plus puissant.</div>';
          }
        }
        console.error("Erreur de chargement du modèle 3D:", error);
      },
    );

    let dirLightHelper,
      hemiLightHelper,
      spotLightHelper,
      shadowCameraHelper,
      cameraHelper;
    let helper = false;

    function updateHelpers(show) {
      if (show) {
        if (dirLight) {
          dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 1);
          scene.add(dirLightHelper);
        }
        if (spot) {
          spotLightHelper = new THREE.SpotLightHelper(spot);
          scene.add(spotLightHelper);
        }
        if (hemi) {
          hemiLightHelper = new THREE.HemisphereLightHelper(hemi, 1);
          scene.add(hemiLightHelper);
        }
        if (dirLight) {
          shadowCameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
          scene.add(shadowCameraHelper);
        }
        cameraHelper = new THREE.CameraHelper(camera);
        scene.add(cameraHelper);
      } else {
        if (dirLightHelper) scene.remove(dirLightHelper);
        if (spotLightHelper) scene.remove(spotLightHelper);
        if (hemiLightHelper) scene.remove(hemiLightHelper);
        if (shadowCameraHelper) scene.remove(shadowCameraHelper);
        if (cameraHelper) scene.remove(cameraHelper);

        dirLightHelper =
          hemiLightHelper =
          spotLightHelper =
          shadowCameraHelper =
          cameraHelper =
            undefined;
      }
    }

    let lastFrameTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    function animate(currentTime = 0) {
      requestAnimationFrame(animate);

      if (currentTime - lastFrameTime < frameInterval) {
        return;
      }
      lastFrameTime = currentTime;

      controls.enabled = cameraMoveEnabled;
      controls.update();
      if (spotLightHelper) spotLightHelper.update();

      if (window.updateLabels) window.updateLabels();

      if (window.cloudLayers && camera.position.y > 5) {
        const time = performance.now() * 0.001;
        window.cloudLayers.forEach((layer, index) => {
          if (layer.visible) {
            layer.material.uniforms.time.value = time + index * 0.5;
          }
        });
      }

      composer.render();
    }

    function animateCameraTo(target, duration = 2000) {
      const start = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      };
      const startTime = performance.now();

      function move(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);

        camera.position.x = start.x + (target.x - start.x) * t;
        camera.position.y = start.y + (target.y - start.y) * t;
        camera.position.z = start.z + (target.z - start.z) * t;
        if (controls) controls.update();

        if (t < 1) {
          requestAnimationFrame(move);
        }
      }
      requestAnimationFrame(move);
    }
    window.addEventListener("resize", () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight, true);
      composer.setSize(window.innerWidth, window.innerHeight);

      if (bloomPass) {
        bloomPass.resolution.set(
          window.innerWidth * 0.5,
          window.innerHeight * 0.5,
        );
      }
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    setInterval(() => {
      renderer.info.reset();
    }, 30000);
    controls.target.set(0, 2, -2);
    controls.update();

    if (debug) {
      const gui = new GUI();
      gui
        .add({ cameraMoveEnabled }, "cameraMoveEnabled")
        .name("Déplacement Caméra")
        .onChange((value) => {
          cameraMoveEnabled = value;
          controls.enabled = cameraMoveEnabled;
        });
      gui
        .add({ helper }, "helper")
        .name("Helper")
        .onChange((value) => {
          helper = value;
          updateHelpers(helper);
        });
      gui
        .add({ showHitboxes }, "showHitboxes")
        .name("Afficher Hitboxes")
        .onChange((value) => {
          showHitboxes = value;
          allHitboxHelpers.forEach((helper) => {
            helper.visible = showHitboxes;
          });
        });
      const sunFolder = gui.addFolder("Soleil");
      sunFolder.add(sun, "intensity", 0, 15, 0.1).name("Intensité");
      sunFolder.add(sun.position, "x", -40, 40, 0.1).name("Position X");
      sunFolder.add(sun.position, "y", 0, 20, 0.1).name("Position Y");
      sunFolder.add(sun.position, "z", -40, 40, 0.1).name("Position Z");

      const bloomFolder = gui.addFolder("Bloom Effects");
      bloomFolder.add(bloomPass, "strength", 0, 3, 0.01).name("Intensité");
      bloomFolder.add(bloomPass, "radius", 0, 1, 0.01).name("Rayon");
      bloomFolder.add(bloomPass, "threshold", 0, 1, 0.01).name("Seuil");
      bloomFolder.open();

      const fireFolder = gui.addFolder("Lumière du Feu");
      fireFolder.add(fireLight, "intensity", 0, 30, 0.5).name("Intensité");
      fireFolder.add(fireLight.position, "x", -10, 10, 0.1).name("Position X");
      fireFolder.add(fireLight.position, "y", 0, 15, 0.1).name("Position Y");
      fireFolder.add(fireLight.position, "z", -10, 10, 0.1).name("Position Z");

      const coordsDiv = document.createElement("div");
      coordsDiv.style.position = "fixed";
      coordsDiv.style.bottom = "16px";
      coordsDiv.style.left = "16px";
      coordsDiv.style.background = "rgba(30,30,30,0.85)";
      coordsDiv.style.color = "#ffe";
      coordsDiv.style.padding = "6px 14px";
      coordsDiv.style.borderRadius = "8px";
      coordsDiv.style.fontFamily = "monospace";
      coordsDiv.style.fontSize = "1em";
      coordsDiv.style.zIndex = 9999;
      coordsDiv.style.pointerEvents = "none";
      coordsDiv.style.boxShadow = "0 2px 8px #0005";
      coordsDiv.style.transition = "opacity 0.3s";
      coordsDiv.style.opacity = "0";
      document.body.appendChild(coordsDiv);

      function updateCoordsDisplay() {
        if (cameraMoveEnabled) {
          coordsDiv.style.opacity = "1";
          coordsDiv.textContent =
            `Caméra: x=${camera.position.x.toFixed(2)} ` +
            `y=${camera.position.y.toFixed(2)} ` +
            `z=${camera.position.z.toFixed(2)}`;
        } else {
          coordsDiv.style.opacity = "0";
        }
      }

      setInterval(updateCoordsDisplay, 80);
    }
  });
}
