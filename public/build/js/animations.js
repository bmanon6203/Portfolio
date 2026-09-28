import gsap from "gsap";

export function bounceOutModal(modalSelector) {
  window.isModalAnimating = true;
  gsap.to(modalSelector, {
    scale: 0.85,
    opacity: 0,
    duration: 0.25,
    ease: "bounce.in",
    onComplete: () => {
      document.querySelector(modalSelector).style.display = "none";
      window.isModalAnimating = false;
    },
  });
}

// Animation de reveal pour l'écran de chargement
export function playReveal(modal, isModalOpenRef) {
  window.isModalAnimating = true;
  const tl = gsap.timeline();
  tl.to(modal, {
    scale: 0.5,
    duration: 0.4,
    delay: 0.1,
    ease: "back.out(1.8)"
  }).to(
    modal,
    {
      y: "200vh",
      perspective: 1000,
      rotationX: 45,
      rotationY: -35,
      duration: 0.9,
      ease: "back.out(1)",
      onComplete: () => {
        gsap.set(modal, {
          clearProps: "all",
          scale: 1,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          perspective: 1000,
          transform: "none"
        });
        modal.classList.remove("visible");
        modal.classList.add("hidden");
        window.isModalAnimating = false;
        if (typeof isModalOpenRef === "object" && isModalOpenRef !== "null") {
          isModalOpenRef.value = false;
        } else if (typeof isModalOpen !== "undefined") {
          isModalOpen = false;
        }
      },
    },
    "-=0.1",
  );
}

// Animation d'ouverture du modal (effet inverse)
export function playRevealIn(modal) {
  if (window.isModalAnimating) return;
  window.isModalAnimating = true;
  modal.classList.remove('hidden');
  modal.style.display = '';
  const tl = gsap.timeline();

  gsap.set(modal, {
    scale: 0.5,
    y: "100vh",
    rotationX: -45,
    rotationY: 35,
    perspective: 1000,
    transform: "none"
  });

  tl.to(modal, {
    y: 0,
    rotationX: 0,
    rotationY: 0,
    opacity: 1,
    perspective: 1000,
    duration: 0.4,
    delay: 0.1,
    ease: "back.out(1.8)"
  }).to(modal, {
    scale: 1,
    duration: 0.3,
    ease: "back.out(1.8)",
    onComplete: () => {
      gsap.set(modal, {
        clearProps: "all",
        scale: 1,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        perspective: 1000,
        transform: "none"
      });
      modal.style.opacity = "1";
      window.isModalAnimating = false;
    }
  });
}
