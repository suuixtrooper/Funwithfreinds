// hero = shadin | ashmil | shifin
const params = new URLSearchParams(location.search);
const HERO = (params.get('hero') || 'shadin').replace(/[^a-z]/g, '');
const A = {
  bird:   HERO + '.png',
  head:   HERO + 'head.png',
  jump:   HERO + 'jump.mp3',
  hit1:   HERO + 'hit1.mp3',
  hit2:   HERO + 'hit2.mp3'
};

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;

// ---------- assets ----------
const birdImg = new Image();  birdImg.src = A.bird;
const headImg = new Image();  headImg.src = A.head;
const sJump = new Audio(A.jump);
const hit1 = new Audio(A.hit1);
const hit2 = new Audio(A.hit2);
let lastHit = 1; // alternate mp3 on each hit

// ---------- game state ----------
let bird, pipes, score, playing, started, dead;
let frame = 0, hitFlash = 0;

const GRAVITY = 0.28;          // low gravity (slow fall)
const FLAP = -6.2;
const PIPE_SPEED = 1.8;        // slow speed as requested
const PIPE_GAP = 170;
const PIPE_W = 62;

function reset(){
  bird = { x:90, y:H/2, vy:0, size:44, angle:0 };
  pipes = [];
  score = 0; playing = false; started = false; dead = false;
  frame = 0;
  document.getElementById('scoreHud').textContent = 'SCORE: 0';
  document.getElementById('playScreen').style.display = 'none';
  document.getElementById('clickToPlay').classList.remove('hidden');
}

function flap(){
  bird.vy = FLAP;
  sJump.currentTime = 0; sJump.play();
}

function startGame(){
  document.getElementById('clickToPlay').classList.add('hidden');
  playing = true; started = true;
}

function die(){
  dead = true; playing = false;
  // alternate hit sounds: 1st hit -> hit1, next -> hit2, repeat
  if (lastHit === 1){ hit1.play(); lastHit = 2; }
  else { hit2.play(); lastHit = 1; }
  hitFlash = 12;
  document.getElementById('finalScore').textContent = 'SCORE: ' + score;
  document.getElementById('playScreen').style.display = 'flex';
}
function restart(){ reset(); startGame(); }

// ---------- pipes ----------
function spawnPipe(){
  const topH = 90 + Math.random() * (H - PIPE_GAP - 220);
  pipes.push({ x: W + 20, top: topH, passed: false });
}

function update(){
  if (!playing || dead) return;
  frame++;

  bird.vy += GRAVITY;
  bird.y  += bird.vy;
  bird.angle = Math.min(Math.PI/2, Math.max(-0.5, bird.vy * 0.08));

  if (bird.y + bird.size > H - 40 || bird.y < -20) { die(); return; }

  if (frame % 110 === 0) spawnPipe();
  for (const p of pipes){
    p.x -= PIPE_SPEED;
    // collision
    if (bird.x + bird.size*0.7 > p.x && bird.x + bird.size*0.3 < p.x + PIPE_W &&
        (bird.y < p.top || bird.y + bird.size > p.top + PIPE_GAP)) { die(); return; }
    if (!p.passed && p.x + PIPE_W < bird.x){
      p.passed = true; score++;
      document.getElementById('scoreHud').textContent = 'SCORE: ' + score;
    }
  }
  pipes = pipes.filter(p => p.x + PIPE_W > -10);
}

// ---------- draw ----------
function draw(){
  // sky background (animated gradient feel)
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#1b2a5e'); g.addColorStop(.6,'#3a2a6e'); g.addColorStop(1,'#0a0a1a');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

  // parallax stars
  ctx.fillStyle = 'rgba(255,255,255,.8)';
  for (let i=0;i<25;i++){
    const sx = (i*137 - frame*0.3) % W; const sy = (i*89) % (H-100);
    ctx.fillRect((sx+W)%W, sy, 2, 2);
  }

  // scrolling ground
  ctx.fillStyle = '#2a4a2a'; ctx.fillRect(0, H-40, W, 40);
  ctx.fillStyle = '#ffd700';
  for (let i=0;i<W/30;i++){
    const gx = (i*30 - frame*PIPE_SPEED % 30 + 30) % (W+30) - 30;
    ctx.fillRect(gx, H-40, 20, 4);
  }

  // pipes (fantasy style)
  for (const p of pipes){
    const pg = ctx.createLinearGradient(p.x,0,p.x+PIPE_W,0);
    pg.addColorStop(0,'#7a3fa0'); pg.addColorStop(.5,'#b06ee0'); pg.addColorStop(1,'#5a2a80');
    ctx.fillStyle = pg;
    ctx.fillRect(p.x, 0, PIPE_W, p.top);
    ctx.fillRect(p.x, p.top + PIPE_GAP, PIPE_W, H - p.top - PIPE_GAP - 40);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
    ctx.strokeRect(p.x, 0, PIPE_W, p.top);
    ctx.strokeRect(p.x, p.top + PIPE_GAP, PIPE_W, H - p.top - PIPE_GAP - 40);
  }

  // bird body (rotates when jumping/falling)
  ctx.save();
  ctx.translate(bird.x + bird.size/2, bird.y + bird.size/2);
  ctx.rotate(bird.angle);
  ctx.drawImage(birdImg, -bird.size/2, -bird.size/2, bird.size, bird.size);
  ctx.restore();

  // head — stays upright, follows bird position
  if (headImg.complete && headImg.naturalWidth)
    ctx.drawImage(headImg, bird.x + 2, bird.y - 8, bird.size*0.7, bird.size*0.7);

  // red flash on hit
  if (hitFlash > 0){
    ctx.fillStyle = `rgba(255,0,0,${hitFlash/20})`;
    ctx.fillRect(0,0,W,H);
    hitFlash--;
  }
}

function loop(){ update(); draw(); requestAnimationFrame(loop); }

// ---------- input ----------
document.getElementById('clickToPlay').addEventListener('click', startGame);
cv.addEventListener('click', () => { if (started && playing) flap(); });
window.addEventListener('keydown', e => {
  if (e.code === 'Space'){ e.preventDefault();
    if (!started) startGame(); else if (playing) flap(); }
});

reset(); loop();
