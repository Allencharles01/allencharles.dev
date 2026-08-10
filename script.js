/* ==========================================================================
   PORTFOLIO INTERACTION & ANIMATION LOGIC
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");
  const indicator = document.querySelector(".nav-indicator");
  const toggleBtn = document.getElementById("theme-toggle");
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");
  const githubIcon = document.getElementById("github-icon");
  const resumeIcon = document.getElementById("resume-icon");
  const copyEmailBtn = document.getElementById("copy-email-btn");
  const toast = document.getElementById("toast");

  /* ------------------------------------------------------------------------
     1. NAVBAR INDICATOR LOGIC
     ------------------------------------------------------------------------ */
  function moveIndicator(el) {
    if (el && indicator && window.innerWidth > 768) {
      indicator.style.width = `${el.offsetWidth}px`;
      indicator.style.left = `${el.offsetLeft}px`;
      indicator.style.opacity = "1";
    } else if (indicator) {
      indicator.style.opacity = "0";
    }
  }

  // Active Link Observer / Scroll listener
  function handleActiveNav() {
    let current = "";
    const scrollPos = window.scrollY + 180;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
        moveIndicator(link);
      }
    });
  }

  window.addEventListener("scroll", handleActiveNav);

  window.addEventListener("resize", () => {
    const activeLink = document.querySelector(".nav-link.active");
    moveIndicator(activeLink);
    initParticles();
  });

  // Initial indicator positioning
  const initialActive = document.querySelector(".nav-link.active");
  if (initialActive) {
    setTimeout(() => moveIndicator(initialActive), 100);
  }

  /* ------------------------------------------------------------------------
     2. HAMBURGER MENU & DRAWER
     ------------------------------------------------------------------------ */
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  // Close drawer when clicking links
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (hamburger && navMenu) {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      }
    });
  });

  /* ------------------------------------------------------------------------
     3. THEME TOGGLE LOGIC & ANIMATIONS
     ------------------------------------------------------------------------ */
  if (toggleBtn) {
    const toggleIcon = document.getElementById("theme-toggle-icon") || toggleBtn;

    toggleBtn.addEventListener("click", () => {
      // Trigger 3D spin & radial glow pulse animations
      toggleBtn.classList.remove("theme-animating");
      toggleIcon.classList.remove("icon-spin");
      // Force reflow
      void toggleBtn.offsetWidth;

      toggleBtn.classList.add("theme-animating");
      toggleIcon.classList.add("icon-spin");

      document.body.classList.toggle("light-mode");
      const isLight = document.body.classList.contains("light-mode");

      // Morph icon halfway through 3D rotation
      setTimeout(() => {
        toggleIcon.textContent = isLight ? "☀️" : "🌙";
      }, 180);

      // Clean up animation classes
      setTimeout(() => {
        toggleBtn.classList.remove("theme-animating");
        toggleIcon.classList.remove("icon-spin");
      }, 500);

      // Icon paths based on light/dark mode
      const githubIcons = document.querySelectorAll("#github-icon, .github-icon-img");
      if (isLight) {
        githubIcons.forEach(icon => icon.src = "assets/icons/GitDark01.png");
        if (resumeIcon) resumeIcon.src = "assets/icons/Resume01-removebg-preview.png";
      } else {
        githubIcons.forEach(icon => icon.src = "assets/icons/GitLight01.png");
        if (resumeIcon) resumeIcon.src = "assets/icons/ResumeDark.png";
      }

      initParticles();
      if (typeof window.triggerLeafAnimation === "function") {
        window.triggerLeafAnimation();
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. SCROLL REVEAL (INTERSECTION OBSERVER)
     ------------------------------------------------------------------------ */
  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ------------------------------------------------------------------------
     5. COPY EMAIL TO CLIPBOARD
     ------------------------------------------------------------------------ */
  if (copyEmailBtn && toast) {
    copyEmailBtn.addEventListener("click", () => {
      const email = copyEmailBtn.getAttribute("data-email");
      if (email) {
        navigator.clipboard.writeText(email).then(() => {
          showToast("Email address copied to clipboard! 📋");
        }).catch(() => {
          showToast("Failed to copy. Email: " + email);
        });
      }
    });
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 3000);
  }

  /* ------------------------------------------------------------------------
     6. PARTICLE ANIMATION (STARS & SNOW FOR DARK MODE)
     ------------------------------------------------------------------------ */
  function initParticles() {
    const universe = document.getElementById("universe");
    if (!universe) return;

    const isLightMode = document.body.classList.contains("light-mode");
    universe.innerHTML = "";
    if (isLightMode) return;

    const starCount = window.innerWidth < 768 ? 120 : 280;
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < starCount; i++) {
      const el = document.createElement("div");
      universe.appendChild(el);
      const sizeIndex = Math.floor(Math.random() * 4);
      el.setAttribute("class", `star${sizeIndex}`);

      const yPos = Math.random() * h;
      const duration = 3000 + (3 - sizeIndex) * 6000 + Math.random() * 5000;
      el.animate([
        { transform: `translate3d(${w}px, ${yPos}px, 0)` },
        { transform: `translate3d(-200px, ${yPos}px, 0)` }
      ], {
        duration: duration,
        delay: -Math.random() * duration,
        iterations: Infinity,
        easing: "linear"
      });
    }
  }

  initParticles();

  /* ------------------------------------------------------------------------
     7. FALLING LEAVES CANVAS ANIMATION (LIGHT MODE) WITH MOUSE WIND GUSTS
     ------------------------------------------------------------------------ */
  (function initLeafCanvas() {
    const canvas = document.getElementById("leaf-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width, height, dpr;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize);
    resize();

    // Mouse / Touch Wind Gust logic (2D vector support)
    const wind = {
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      lastX: width / 2,
      lastY: height / 2,
      active: false
    };

    window.addEventListener("mousemove", (e) => {
      const newX = e.clientX;
      const newY = e.clientY;
      const dx = newX - wind.lastX;
      const dy = newY - wind.lastY;

      const impulseX = Math.max(-25, Math.min(25, dx));
      const impulseY = Math.max(-25, Math.min(25, dy));
      wind.vx += impulseX * 0.15;
      wind.vy += impulseY * 0.15;
      wind.vx = Math.max(-6, Math.min(6, wind.vx));
      wind.vy = Math.max(-6, Math.min(6, wind.vy));

      wind.x = newX;
      wind.y = newY;
      wind.lastX = newX;
      wind.lastY = newY;
      wind.active = true;
    });

    window.addEventListener("touchmove", (e) => {
      if (!e.touches.length) return;
      const t = e.touches[0];
      const dx = t.clientX - wind.lastX;
      const dy = t.clientY - wind.lastY;
      const impulseX = Math.max(-25, Math.min(25, dx));
      const impulseY = Math.max(-25, Math.min(25, dy));
      wind.vx += impulseX * 0.15;
      wind.vy += impulseY * 0.15;
      wind.vx = Math.max(-6, Math.min(6, wind.vx));
      wind.vy = Math.max(-6, Math.min(6, wind.vy));
      wind.x = t.clientX;
      wind.y = t.clientY;
      wind.lastX = t.clientX;
      wind.lastY = t.clientY;
      wind.active = true;
    }, { passive: true });

    const GREENS = [
      "#4f7942", "#5b8c3f", "#3f6b3a", "#6b9c4b",
      "#2e5730", "#7cae4e", "#4a7c3f", "#3a6b4a"
    ];

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function drawLeafShape(c, size, color) {
      c.beginPath();
      c.moveTo(0, -size);
      c.bezierCurveTo(size * 0.7, -size * 0.5, size * 0.7, size * 0.5, 0, size);
      c.bezierCurveTo(-size * 0.7, size * 0.5, -size * 0.7, -size * 0.5, 0, -size);
      c.closePath();
      c.fillStyle = color;
      c.fill();

      // vein
      c.beginPath();
      c.moveTo(0, -size * 0.85);
      c.lineTo(0, size * 0.85);
      c.strokeStyle = "rgba(0,0,0,0.15)";
      c.lineWidth = Math.max(0.5, size * 0.06);
      c.stroke();
    }

    class Leaf {
      constructor(spawnAbove) {
        this.reset(spawnAbove);
      }

      reset(spawnAbove) {
        this.x = rand(0, width);
        this.y = spawnAbove ? rand(-height, 0) : -rand(10, 60);

        this.size = rand(7, 16);
        this.color = GREENS[Math.floor(Math.random() * GREENS.length)];

        this.baseFallSpeed = rand(0.6, 1.6);
        this.vy = this.baseFallSpeed * 0.4;

        this.swayAmplitude = rand(0, 1) < 0.25 ? rand(0.05, 0.3) : rand(0.6, 2.2);
        this.swaySpeed = rand(0.4, 1.3);
        this.swayPhase = rand(0, Math.PI * 2);

        this.rotation = rand(0, Math.PI * 2);
        this.rotationSpeed = rand(-1, 1) * (0.4 + this.swayAmplitude * 0.3) * 0.02;

        this.flutterSpeed = rand(0.02, 0.06);
        this.flutterPhase = rand(0, Math.PI * 2);

        this.opacity = rand(0.65, 1);

        this.time = 0;
      }

      update(dt) {
        this.time += dt;

        this.vy += (this.baseFallSpeed - this.vy) * 0.01;
        this.y += this.vy;

        const sway = Math.sin(this.time * this.swaySpeed + this.swayPhase) * this.swayAmplitude;
        this.x += sway * dt * 0.06;

        // 2D Mouse wind gust calculation
        if (wind.vx !== 0 || wind.vy !== 0) {
          const dx = this.x - wind.x;
          const dy = this.y - wind.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 260;
          const falloff = Math.max(0, 1 - dist / radius);
          if (falloff > 0) {
            const catchFactor = 0.5 + Math.min(this.swayAmplitude, 2) * 0.3;
            this.x += wind.vx * falloff * catchFactor * dt;
            this.y += wind.vy * falloff * catchFactor * dt;
            const gustMag = Math.sqrt(wind.vx * wind.vx + wind.vy * wind.vy);
            this.rotation += Math.sign(wind.vx || 1) * gustMag * falloff * 0.01 * dt;
          }
        }

        this.rotation += this.rotationSpeed * dt;
        this.flutterScale = Math.cos(this.time * this.flutterSpeed + this.flutterPhase);

        if (this.y - this.size > height + 20) {
          this.reset(false);
        }
        if (this.x < -30) this.x = width + 30;
        if (this.x > width + 30) this.x = -30;
      }

      draw(c) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.rotation);
        c.scale(0.4 + Math.abs(this.flutterScale) * 0.6, 1);
        c.globalAlpha = this.opacity;
        drawLeafShape(c, this.size, this.color);
        c.restore();
      }
    }

    let leaves = [];
    function createLeaves() {
      leaves = [];
      const count = Math.round((width * height) / 22000);
      for (let i = 0; i < count; i++) {
        leaves.push(new Leaf(true));
      }
    }
    createLeaves();

    let lastTime = performance.now();
    let animId = null;

    function animate(now) {
      if (!document.body.classList.contains("light-mode")) {
        ctx.clearRect(0, 0, width, height);
        animId = null;
        return;
      }

      const dt = Math.min(now - lastTime, 50) / 16.67;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // 2D Gust decay over time
      wind.vx *= 0.94;
      wind.vy *= 0.94;
      if (Math.abs(wind.vx) < 0.001) wind.vx = 0;
      if (Math.abs(wind.vy) < 0.001) wind.vy = 0;

      for (const leaf of leaves) {
        leaf.update(dt);
        leaf.draw(ctx);
      }

      animId = requestAnimationFrame(animate);
    }

    function startAnimation() {
      if (document.body.classList.contains("light-mode")) {
        if (!animId) {
          lastTime = performance.now();
          animId = requestAnimationFrame(animate);
        }
      } else {
        ctx.clearRect(0, 0, width, height);
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      }
    }

    window.triggerLeafAnimation = startAnimation;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion) {
      startAnimation();
    } else if (document.body.classList.contains("light-mode")) {
      for (const leaf of leaves) leaf.draw(ctx);
    }
  })();
});

