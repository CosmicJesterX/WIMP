// Transmice - Interactive Particle System for WIMP
// Mouse-driven particle effects

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.life = 1.0;
    this.decay = 0.01 + Math.random() * 0.02;
    this.size = 2 + Math.random() * 3;
    this.hue = 200 + Math.random() * 60;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // gravity
    this.life -= this.decay;
  }

  draw(ctx) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  isDead() {
    return this.life <= 0;
  }
}

class TransmiceSystem {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.isActive = false;
    this.animationFrame = null;
    this.lastParticleTime = 0;
    this.particleInterval = 16; // ~60fps
  }

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'transmice-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1000';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resize();

    // Event listeners
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mouseenter', () => { this.isActive = true; });
    document.addEventListener('mouseleave', () => { this.isActive = false; });

    this.start();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  handleMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    
    // Throttle particle creation to avoid excessive particles
    const now = Date.now();
    if (this.isActive && now - this.lastParticleTime >= this.particleInterval) {
      for (let i = 0; i < 2; i++) {
        this.particles.push(new Particle(this.mouseX, this.mouseY));
      }
      this.lastParticleTime = now;
    }
  }

  update() {
    // Update all particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all particles
    for (const particle of this.particles) {
      particle.draw(this.ctx);
    }
  }

  animate() {
    this.update();
    this.render();
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  start() {
    if (!this.animationFrame) {
      this.animate();
    }
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  destroy() {
    this.stop();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Initialize transmice on page load
let transmiceSystem;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    transmiceSystem = new TransmiceSystem();
    transmiceSystem.init();
  });
} else {
  transmiceSystem = new TransmiceSystem();
  transmiceSystem.init();
}
