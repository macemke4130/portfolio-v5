const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let numberOfParticles = 50;
let lineThickness = 5;
let rotationSpeed = 0.025;
const lineColor = "red";
const rainbow = false;

const particles = [];

const mouse = {
  x: 0,
  y: 0,
};

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX - canvas.width / 2;
  mouse.y = event.clientY - canvas.height / 2;
});

const random255 = () => Math.floor(Math.random() * 256);

class Particle {
  constructor(size, speed, opacity = 1) {
    this.id = size;
    this.ovalSize = size * 3;
    this.speed = speed * 0.01;
    this.opacity = opacity;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radiusX = this.ovalSize;
    this.radiusY = this.ovalSize * 1.55;
    this.rotation = 1.5;
    this.color = `rgb(${(255 / (particles.length + 1)) * this.id}, 0, 0)`;

    if (rainbow) {
      this.red = random255();
      this.green = random255();
      this.blue = random255();
    }
  }

  update() {
    this.rotation = this.rotation - rotationSpeed * this.speed;
  }

  draw() {
    const factor = particles.length * 0.00025; //0.005;
    const x = mouse.x * (this.ovalSize * factor) + canvas.width / 2;
    const y = mouse.y * (this.ovalSize * factor) + canvas.height / 2;
    ctx.strokeStyle = rainbow ? `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.opacity})` : this.color;
    ctx.beginPath();
    ctx.lineWidth = lineThickness;
    ctx.ellipse(x, y, this.radiusX, this.radiusY, this.rotation, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

const init = () => {
  for (let index = 0; index < numberOfParticles; index++) {
    const speed = numberOfParticles - index;
    particles.push(new Particle(index, speed));
  }
};

const handleParticles = () => {
  for (let index = 0; index < particles.length; index++) {
    particles[index].update();
    particles[index].draw();
  }
};

const animate = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleParticles();
  requestAnimationFrame(animate);
};

const handleKeyDown = (event) => {
  const key = event.key;

  // Add new oval
  if (key === "ArrowUp") {
    particles.push(new Particle(particles.length, particles.length - 1));

    particles.forEach((oval, index) => {
      oval.speed = (particles.length - index) * 0.01;
      oval.rotation = (particles.length - index) * 0.01;
      oval.color = `rgb(${(255 / (particles.length + 1)) * oval.id}, 0, 0)`;
    });
  }
  // Remove oval
  if (key === "ArrowDown") {
    particles.pop();

    particles.forEach((oval, index) => {
      oval.speed = (particles.length - index) * 0.01;
      oval.rotation = (particles.length - index) * 0.01;

      console.log(oval.color);
    });
  }

  if (key === "ArrowLeft") {
    rotationSpeed = rotationSpeed + 0.005;
  }

  if (key === "ArrowRight") {
    rotationSpeed = rotationSpeed - 0.005;
  }

  if (key === "w") {
    lineThickness = lineThickness + 2.5;
  }

  if (key === "s") {
    if (lineThickness >= 2.5) lineThickness = lineThickness - 2.5;
  }
};

window.addEventListener("keydown", handleKeyDown);

init();
animate();

for (const oval of particles) {
  console.log(oval.color);
}
