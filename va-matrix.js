// Matrix Rain — Virtual Adepts style
// Mounts onto a provided canvas element

class MatrixRain {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.color = options.color || '#00ffcc';
    this.fontSize = options.fontSize || 13;
    this.speed = options.speed || 1;
    this.opacity = options.opacity || 0.13;
    this.chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF∑∆Ω∇∞≈≡∫⊕⊗◈◆▼▲⬡⬢';
    this.drops = [];
    this.animId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    const cols = Math.floor(this.canvas.width / this.fontSize);
    // preserve existing drops, add new ones
    while (this.drops.length < cols) {
      this.drops.push(Math.random() * -100);
    }
    this.drops.length = cols;
  }

  draw() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;

    // Fade trail
    ctx.fillStyle = 'rgba(7,11,14,0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${this.fontSize}px 'JetBrains Mono', monospace`;

    for (let i = 0; i < this.drops.length; i++) {
      const char = this.chars[Math.floor(Math.random() * this.chars.length)];
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;

      // Lead char — brighter
      const alpha = 0.05 + Math.random() * this.opacity;
      const isLead = Math.random() > 0.97;
      ctx.fillStyle = isLead ? `rgba(220,255,250,${alpha * 4})` : `rgba(0,255,204,${alpha})`;
      ctx.fillText(char, x, y);

      // Reset drop
      if (y > height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i] += this.speed * (0.3 + Math.random() * 0.7);
    }
  }

  start() {
    const loop = () => {
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  setColor(color) {
    this.color = color;
  }
}

window.MatrixRain = MatrixRain;
