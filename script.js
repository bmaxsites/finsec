/* ============================================================
   FINSEC – script.js
   ============================================================ */
'use strict';

/* ── SECURITY: Content Security helpers ─────────────────────
   We sanitize all user input before displaying it and encode
   data before sending to prevent XSS. ─────────────────────── */
function sanitize(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

/* ── NAVBAR scroll ─────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── HAMBURGER ─────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});
navLinks.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  })
);

/* ── PARTICLE CANVAS (financial dots) ──────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Shapes: circle | ring | line
  const SHAPES = ['circle', 'ring', 'line'];
  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function() {
    this.x     = Math.random() * W;
    this.y     = Math.random() * H;
    this.r     = Math.random() * 2 + 0.5;
    this.speed = Math.random() * 0.25 + 0.05;
    this.angle = Math.random() * Math.PI * 2;
    this.dx    = Math.cos(this.angle) * this.speed;
    this.dy    = Math.sin(this.angle) * this.speed;
    this.alpha = Math.random() * 0.25 + 0.05;
    this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    this.len   = Math.random() * 12 + 6;
  };
  Particle.prototype.draw = function() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.strokeStyle = 'rgba(201,168,76,1)';
    ctx.fillStyle   = 'rgba(201,168,76,1)';
    ctx.lineWidth   = 0.5;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.r, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'ring') {
      ctx.beginPath();
      ctx.arc(0, 0, this.r * 2.5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-this.len / 2, 0);
      ctx.lineTo(this.len / 2, 0);
      ctx.stroke();
    }
    ctx.restore();
  };
  Particle.prototype.update = function() {
    this.x += this.dx;
    this.y += this.dy;
    if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) this.reset();
  };

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  let raf;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    // subtle grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    const gridSize = 80;
    for (let x = 0; x < W; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }

  // Only animate if reduced motion is not set
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    loop();
  }
})();

/* ── COUNTER ANIMATION ─────────────────────────────────────── */
function animateCounters() {
  document.querySelectorAll('.metric-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  });
}

/* ── REVEAL ON SCROLL ──────────────────────────────────────── */
const revealEls = document.querySelectorAll(
  '.about-grid, .step-card, .sol-card, .sec-item, .testi-card, .schedule-grid, .contact-card, .trust-item, .about-pillars .pillar, .sched-feat'
);
revealEls.forEach(el => el.classList.add('reveal'));

let countersAnimated = false;
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
  // Trigger counters when hero metrics are visible
  if (!countersAnimated) {
    const heroVisible = document.querySelector('.hero-metrics');
    if (heroVisible) { animateCounters(); countersAnimated = true; }
  }
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));

// Counters on page load (hero visible immediately)
window.addEventListener('load', () => {
  if (!countersAnimated) { animateCounters(); countersAnimated = true; }
});

/* ── CNPJ MASK ─────────────────────────────────────────────── */
const cnpjInput = document.getElementById('cnpj');
if (cnpjInput) {
  cnpjInput.addEventListener('input', function() {
    let v = this.value.replace(/\D/g, '').slice(0, 14);
    if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d*)/, '$1.$2.$3/$4-$5');
    else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d*)/, '$1.$2.$3/$4');
    else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d*)/, '$1.$2.$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d*)/, '$1.$2');
    this.value = v;
  });
}

/* ── PHONE MASK ─────────────────────────────────────────────── */
const telInput = document.getElementById('telefone');
if (telInput) {
  telInput.addEventListener('input', function() {
    let v = this.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = v.replace(/^(\d{2})(\d{5})(\d*)/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d*)/, '($1) $2');
    this.value = v;
  });
}

/* ── FORM VALIDATION & SEND ────────────────────────────────── */
const form      = document.getElementById('scheduleForm');
const submitBtn = document.getElementById('submitBtn');
const formError = document.getElementById('formError');
const formSuccess = document.getElementById('formSuccess');

function showError(msg) {
  formError.textContent = msg;
  formError.style.display = 'block';
  formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function hideError() { formError.style.display = 'none'; }

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    hideError();

    const nome     = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const email    = document.getElementById('email').value.trim();
    const empresa  = document.getElementById('empresa').value.trim();
    const lgpd     = document.getElementById('lgpd').checked;
    const solucao  = document.getElementById('solucao').value;
    const mensagem = document.getElementById('mensagem').value.trim();
    const cnpj     = document.getElementById('cnpj').value.trim();

    // Validation
    if (!nome || nome.length < 2)   return showError('Por favor, informe seu nome completo.');
    if (!telefone || telefone.length < 10) return showError('Informe um telefone válido com DDD.');
    if (!email || !validateEmail(email))   return showError('Informe um e-mail válido.');
    if (!empresa)                          return showError('Informe a razão social ou nome da empresa.');
    if (!lgpd)                             return showError('É necessário aceitar a Política de Privacidade para continuar.');

    // Disable button / show loader
    submitBtn.disabled = true;
    submitBtn.querySelector('span').style.display = 'none';
    submitBtn.querySelector('.btn-loader').style.display = 'flex';

    /* ─── WhatsApp redirect (sends data automatically) ─── */
    const phone = '551130362223';  // ← número Finsec
    const text  = [
      `🏦 *Novo Agendamento – Finsec*`,
      ``,
      `👤 *Nome:* ${sanitize(nome)}`,
      `📞 *Telefone:* ${sanitize(telefone)}`,
      `📧 *E-mail:* ${sanitize(email)}`,
      `🏢 *Empresa:* ${sanitize(empresa)}`,
      cnpj ? `📋 *CNPJ:* ${sanitize(cnpj)}` : '',
      solucao ? `💼 *Solução de Interesse:* ${sanitize(solucao)}` : '',
      mensagem ? `💬 *Mensagem:* ${sanitize(mensagem)}` : '',
      ``,
      `_Enviado pelo site finsec.com.br_`
    ].filter(Boolean).join('\n');

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    // Small delay for UX polish
    await new Promise(r => setTimeout(r, 800));

    // Show success
    form.style.display = 'none';
    formSuccess.style.display = 'block';
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Open WhatsApp
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Re-enable after 4s in case user cancels
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').style.display = '';
      submitBtn.querySelector('.btn-loader').style.display = 'none';
    }, 4000);
  });
}

/* ── SMOOTH SCROLL for anchor links ───────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const id = this.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── ACTIVE NAV LINK highlight ─────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a[href^="#"]');
const scrollSpy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => scrollSpy.observe(s));
