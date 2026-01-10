document.addEventListener("DOMContentLoaded", () => {
  // Performance monitoring
  if (window.performance && window.performance.timing) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`Page load time: ${pageLoadTime}ms`);
  }

  // Create floating decorative elements
  const createFloatingElements = () => {
    const container = document.body;
    const emojis = ['✨', '🚀', '💡', '⚡', '🔥', '❄️', '💎', '💻'];
    
    for (let i = 0; i < 5; i++) {
      const el = document.createElement('div');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `
        position: fixed;
        font-size: ${Math.random() * 20 + 20}px;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        opacity: 0;
        pointer-events: none;
        z-index: 1;
        animation: floatAround ${Math.random() * 20 + 15}s infinite;
      `;
      container.appendChild(el);
    }
  };

  // Add CSS animation for floating elements
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatAround {
      0% {
        opacity: 0;
        transform: translateY(0) translateX(0) scale(1);
      }
      25% {
        opacity: 0.6;
      }
      50% {
        opacity: 0.3;
      }
      75% {
        opacity: 0.6;
      }
      100% {
        opacity: 0;
        transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px) scale(0.5);
      }
    }
  `;
  document.head.appendChild(style);
  
  createFloatingElements();

  // Apple-style parallax and depth effects
  const updateMousePosition = (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    
    document.documentElement.style.setProperty('--mouse-x', `${x}%`);
    document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    
    // Subtle parallax on hero card
    const heroCard = document.querySelector('.hero-card');
    if (heroCard) {
      const xOffset = (x - 50) * 0.3;
      const yOffset = (y - 50) * 0.3;
      heroCard.style.transform = `perspective(1200px) rotateX(${yOffset * 0.1}deg) rotateY(${xOffset * -0.1}deg)`;
    }
  };
  
  document.addEventListener('mousemove', updateMousePosition);

  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  const THEME_KEY = "theme";

  const getSystemTheme = () => (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  const getTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return getSystemTheme();
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeToggle) themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    document.documentElement.lang = "en";
  };

  applyTheme(getTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  // Contact chat panel
  const chatOpen = document.getElementById("chatOpen");
  const chatClose = document.getElementById("chatClose");
  const chatPanel = document.getElementById("chatPanel");
  const chatOverlay = document.getElementById("chatOverlay");
  const chatForm = document.getElementById("chatForm");
  let chatCloseTimer = null;

  const openChat = () => {
    if (!chatPanel || !chatOverlay) return;
    if (chatCloseTimer) {
      clearTimeout(chatCloseTimer);
      chatCloseTimer = null;
    }
    document.body.classList.add("chat-open");
    chatPanel.hidden = false;
    chatOverlay.hidden = false;
    chatPanel.setAttribute("aria-hidden", "false");
    chatOverlay.removeAttribute("hidden");
    const firstInput = chatPanel.querySelector("input, textarea, button");
    if (firstInput) firstInput.focus();
  };

  const closeChat = () => {
    if (!chatPanel || !chatOverlay) return;
    document.body.classList.remove("chat-open");
    chatPanel.setAttribute("aria-hidden", "true");
    chatCloseTimer = setTimeout(() => {
      chatPanel.hidden = true;
      chatOverlay.hidden = true;
      chatCloseTimer = null;
    }, 260);
  };

  if (chatOpen) chatOpen.addEventListener("click", openChat);
  if (chatClose) chatClose.addEventListener("click", closeChat);
  if (chatOverlay) chatOverlay.addEventListener("click", closeChat);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeChat();
  });

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const submitBtn = chatForm.querySelector('button[type="submit"]');
      const formData = new FormData(chatForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const message = String(formData.get("message") || "").trim();

      // Validate all fields are present and non-empty
      if (!name || !email || !message) {
        console.warn("Form validation failed: missing required fields");
        if (submitBtn) submitBtn.setAttribute("aria-invalid", "true");
        return;
      }

      // Basic email validation with improved regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.warn("Form validation failed: invalid email format");
        if (submitBtn) submitBtn.setAttribute("aria-invalid", "true");
        return;
      }

      // Validate message length (reasonable limits)
      if (message.length < 10 || message.length > 2000) {
        console.warn("Form validation failed: message length out of bounds");
        return;
      }

      // Disable submit button to prevent double-submission
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-busy", "true");
        submitBtn.removeAttribute("aria-invalid");
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
      }

      const subject = `Portfolio contact — ${name}`;
      const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`;
      const mailto = `mailto:singh42@mcmaster.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Use a small delay to ensure the button state is visible
      setTimeout(() => {
        window.location.href = mailto;
        chatForm.reset();
        
        // Re-enable submit button after a delay
        if (submitBtn) {
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.removeAttribute("aria-busy");
            submitBtn.textContent = originalText;
          }, 500);
        }
        
        closeChat();
      }, 100);
    });

    // Real-time message validation feedback
    const messageInput = chatForm.querySelector('textarea[name="message"]');
    if (messageInput) {
      messageInput.addEventListener("input", () => {
        const length = messageInput.value.length;
        const maxLength = 2000;
        const remaining = maxLength - length;
        
        if (length < 10) {
          messageInput.setAttribute("aria-invalid", "true");
        } else if (length > maxLength) {
          messageInput.setAttribute("aria-invalid", "true");
        } else {
          messageInput.removeAttribute("aria-invalid");
        }
      });
    }
  }

  // Reveal on scroll
  const revealElements = Array.from(document.querySelectorAll("[data-reveal]"));
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  } else if (revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = el.getAttribute("data-reveal-delay");
          if (delay) {
            el.style.transitionDelay = `${Number(delay)}ms`;
            el.style.animation = `revealPop ${500 + Number(delay)}ms var(--easing-out) forwards`;
          }
          el.classList.add("is-visible");
          observer.unobserve(el);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // Active nav link as you scroll
  const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"], .nav-link[href^="#"]'));
  const sectionTargets = navLinks
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      const section = id ? document.getElementById(id) : null;
      return section ? { link, section, id } : null;
    })
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${id}`));
  };

  if (sectionTargets.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActive(visible.target.id);
      },
      { threshold: [0.22, 0.35, 0.5, 0.65] }
    );

    sectionTargets.forEach(({ section }) => sectionObserver.observe(section));
  }

  // Keep nav state in sync on click (so it feels immediate)
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("href")?.slice(1);
      if (id) setActive(id);
    });
  });
});
