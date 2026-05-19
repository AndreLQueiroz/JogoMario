import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const W = 800;
const H = 380;
const TILE = 40;
const GRAVITY = 0.30;
const JUMP_FORCE = -10;
const PLAYER_SPEED = 2.0;
const LEVEL_W = 6400;

const GROUND_Y = H - TILE;

function buildLevel() {
  const platforms = [];
  const coins = [];
  const questionBlocks = [];
  const goombas = [];
  const pipes = [];

  for (let x = 0; x < LEVEL_W; x += TILE) {
    platforms.push({ x, y: GROUND_Y, w: TILE, h: TILE, type: 'ground' });
    platforms.push({ x, y: GROUND_Y + TILE, w: TILE, h: TILE, type: 'ground' });
  }

  const floats = [
    [200, 240, 3], [400, 180, 2], [560, 260, 4],
    [800, 200, 3], [1040, 260, 2], [1200, 160, 5],
    [1600, 220, 3], [1800, 160, 4], [2100, 240, 2],
    [2400, 180, 4], [2700, 200, 3], [2950, 260, 2],
    [3200, 180, 5], [3600, 220, 3], [3900, 160, 4],
    [4200, 200, 3], [4500, 240, 2], [4800, 180, 4],
    [5100, 200, 3], [5400, 160, 5],
  ];

  floats.forEach(([fx, fy, len]) => {
    for (let i = 0; i < len; i++) {
      platforms.push({ x: fx + i * TILE, y: fy, w: TILE, h: TILE, type: 'brick' });
    }
  });

  const pipePositions = [480, 960, 1440, 1920, 2560, 3040, 3520, 4000, 4640, 5120, 5760];

  pipePositions.forEach((px) => {
    pipes.push({ x: px, y: GROUND_Y - TILE * 2, w: TILE * 2, h: TILE * 2 });
  });

  const qbPos = [
    [240, 200], [440, 140], [760, 160], [1060, 220],
    [1240, 120], [1640, 180], [1840, 120], [2440, 140],
    [2740, 160], [3240, 140], [3640, 180], [4240, 160],
    [4540, 200], [4840, 140], [5140, 160], [5440, 120],
  ];

  qbPos.forEach(([qx, qy]) => {
    questionBlocks.push({ x: qx, y: qy, w: TILE, h: TILE, hit: false });
  });

  const coinRows = [
    [320, 200, 4], [600, 180, 3], [880, 200, 5], [1100, 140, 3],
    [1300, 200, 4], [1700, 180, 3], [2000, 200, 4], [2200, 160, 5],
    [2500, 200, 3], [2800, 180, 4], [3100, 200, 5], [3400, 160, 3],
    [3700, 180, 4], [4000, 200, 3], [4300, 160, 5], [4600, 180, 3],
    [4900, 200, 4], [5200, 160, 5], [5500, 180, 3],
  ];

  coinRows.forEach(([cx, cy, count]) => {
    for (let i = 0; i < count; i++) {
      coins.push({ x: cx + i * TILE, y: cy, collected: false });
    }
  });

  const goombaPos = [
    [700, GROUND_Y - TILE], [900, GROUND_Y - TILE], [1100, GROUND_Y - TILE],
    [1400, GROUND_Y - TILE], [1700, GROUND_Y - TILE], [2000, GROUND_Y - TILE],
    [2300, GROUND_Y - TILE], [2600, GROUND_Y - TILE], [2900, GROUND_Y - TILE],
    [3200, GROUND_Y - TILE], [3500, GROUND_Y - TILE], [3800, GROUND_Y - TILE],
    [4100, GROUND_Y - TILE], [4400, GROUND_Y - TILE], [4700, GROUND_Y - TILE],
    [5000, GROUND_Y - TILE], [5300, GROUND_Y - TILE], [5600, GROUND_Y - TILE],
  ];

  goombaPos.forEach(([gx, gy], i) => {
    goombas.push({ id: i, x: gx, y: gy, vx: -1.2, dead: false, deadTimer: 0 });
  });

  return { platforms, coins, questionBlocks, goombas, pipes };
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function drawGame(ctx, state, cam) {
  const { player, platforms, coins, questionBlocks, goombas, pipes, score, lives, won, dead } = state;

  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = '#6ab0de';
  ctx.fillRect(0, 0, W, H);

  drawClouds(ctx, cam);

  const tx = -cam;

  pipes.forEach(({ x, y, w, h }) => {
    const sx = x + tx;
    if (sx + w < -20 || sx > W + 20) return;

    ctx.fillStyle = '#5aaf1c';
    ctx.fillRect(sx, y, w, h);

    ctx.fillStyle = '#4a9a10';
    ctx.fillRect(sx + 2, y, w - 4, h);

    ctx.fillStyle = '#6dc420';
    ctx.fillRect(sx, y, w, TILE * 0.3);

    ctx.fillStyle = '#5aaf1c';
    ctx.fillRect(sx - 3, y, w + 6, TILE * 0.28);

    ctx.fillStyle = '#3d8a0e';
    ctx.fillRect(sx + w - 4, y, 4, h);
  });

  platforms.forEach(({ x, y, w, h, type }) => {
    const sx = x + tx;
    if (sx + w < -20 || sx > W + 20) return;

    if (type === 'ground') {
      ctx.fillStyle = '#c87137';
      ctx.fillRect(sx, y, w, h);

      ctx.fillStyle = '#5a8a3c';
      ctx.fillRect(sx, y, w, 10);

      ctx.fillStyle = '#9e5828';
      ctx.fillRect(sx, y + 10, w, h - 10);

      ctx.strokeStyle = '#7a3c18';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx, y, w, h);
    } else {
      ctx.fillStyle = '#c87137';
      ctx.fillRect(sx, y, w, h);

      ctx.fillStyle = '#9e5828';
      ctx.fillRect(sx + 2, y + 2, w - 4, h - 4);

      ctx.fillStyle = '#7a3c18';
      ctx.fillRect(sx, y + h / 2, w, 2);
      ctx.fillRect(sx + w / 2, y, 2, h);
    }
  });

  questionBlocks.forEach((qb) => {
    const sx = qb.x + tx;
    if (sx + TILE < -20 || sx > W + 20) return;

    if (qb.hit) {
      ctx.fillStyle = '#a0724c';
      ctx.fillRect(sx, qb.y, TILE, TILE);

      ctx.fillStyle = '#7a5232';
      ctx.fillRect(sx + 2, qb.y + 2, TILE - 4, TILE - 4);
    } else {
      ctx.fillStyle = '#f0a830';
      ctx.fillRect(sx, qb.y, TILE, TILE);

      ctx.fillStyle = '#d48010';
      ctx.fillRect(sx + 2, qb.y + 2, TILE - 4, TILE - 4);

      ctx.fillStyle = '#f8d870';
      ctx.font = 'bold 22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', sx + TILE / 2, qb.y + TILE / 2 + 1);
    }
  });

  coins.forEach(({ x, y, collected }) => {
    if (collected) return;

    const sx = x + tx;
    if (sx + TILE < -20 || sx > W + 20) return;

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(sx + TILE / 2, y + TILE / 2, TILE / 2 - 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffec6e';
    ctx.beginPath();
    ctx.arc(sx + TILE / 2 - 3, y + TILE / 2 - 3, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  goombas.forEach((g) => {
    if (g.dead && g.deadTimer <= 0) return;

    const sx = g.x + tx;
    if (sx + TILE < -20 || sx > W + 20) return;

    const squish = g.dead ? 0.35 : 1;
    const gh = TILE * squish;
    const gy2 = g.y + TILE - gh;

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(sx, gy2, TILE, gh);

    ctx.fillStyle = '#a0522d';
    ctx.fillRect(sx + 4, gy2 + 4, TILE - 8, gh - 8);

    if (!g.dead) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(sx + 6, gy2 + 6, 8, 8);
      ctx.fillRect(sx + TILE - 14, gy2 + 6, 8, 8);

      ctx.fillStyle = '#000';
      ctx.fillRect(sx + 8, gy2 + 8, 4, 4);
      ctx.fillRect(sx + TILE - 12, gy2 + 8, 4, 4);

      ctx.fillStyle = '#5c2e00';
      ctx.fillRect(sx + 2, gy2 + gh - 8, 10, 8);
      ctx.fillRect(sx + TILE - 12, gy2 + gh - 8, 10, 8);
    }
  });

  drawPlayer(ctx, player, tx);

  const flagX = LEVEL_W - TILE * 4 + tx;
  const flagBaseY = GROUND_Y - TILE * 8;

  ctx.fillStyle = '#888';
  ctx.fillRect(flagX + TILE / 2 - 2, flagBaseY, 4, TILE * 8);

  ctx.fillStyle = '#00aa00';
  ctx.fillRect(flagX + TILE / 2 + 2, flagBaseY, 30, 20);

  ctx.fillStyle = '#008800';
  ctx.fillRect(flagX + TILE / 2 + 4, flagBaseY + 2, 26, 16);

  drawHUD(ctx, score, lives);

  if (won) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 48px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎉 YOU WIN!', W / 2, H / 2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '22px serif';
    ctx.fillText(`Score: ${score}`, W / 2, H / 2 + 30);

    ctx.font = '16px sans-serif';
    ctx.fillText('Press Enter or tap to play again', W / 2, H / 2 + 65);
  }

  if (dead && lives <= 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 48px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.fillText('Press Enter or tap to try again', W / 2, H / 2 + 20);
  }
}

function drawClouds(ctx, cam) {
  const cloudData = [
    [120, 60], [420, 40], [700, 70], [1000, 50], [1300, 65],
    [1600, 45], [1900, 60], [2200, 40], [2500, 70], [2800, 55],
    [3100, 45], [3400, 65], [3700, 50], [4000, 60], [4300, 40],
    [4600, 70], [4900, 55], [5200, 45], [5500, 65],
  ];

  cloudData.forEach(([cx, cy]) => {
    const sx = cx - cam * 0.4;

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc((sx % W) + W, cy, 28, 0, Math.PI * 2);
    ctx.arc((sx % W) + W + 30, cy - 10, 22, 0, Math.PI * 2);
    ctx.arc((sx % W) + W + 55, cy, 24, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPlayer(ctx, p, tx) {
  const sx = p.x + tx;
  const sy = p.y;
  const facing = p.vx < 0 ? -1 : 1;

  ctx.save();

  if (facing === -1) {
    ctx.translate(sx + TILE, sy);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(sx, sy);
  }

  ctx.fillStyle = '#e63322';
  ctx.fillRect(4, 14, 28, 20);

  ctx.fillStyle = '#3355cc';
  ctx.fillRect(4, 24, 28, 12);
  ctx.fillRect(4, 14, 10, 12);
  ctx.fillRect(22, 14, 10, 12);

  ctx.fillStyle = '#e63322';
  ctx.fillRect(2, 8, 32, 8);
  ctx.fillRect(8, 2, 20, 8);

  ctx.fillStyle = '#f5c48a';
  ctx.fillRect(8, 14, 20, 12);

  ctx.fillStyle = '#000';
  ctx.fillRect(14, 16, 4, 4);
  ctx.fillRect(20, 16, 4, 4);

  ctx.fillStyle = '#5c3010';
  ctx.fillRect(10, 22, 16, 4);

  ctx.fillStyle = '#5c3010';
  ctx.fillRect(2, 34, 12, 6);
  ctx.fillRect(22, 34, 12, 6);

  ctx.restore();
}

function drawHUD(ctx, score, lives) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, W, 44);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`🪙 ${score}`, 16, 22);

  ctx.textAlign = 'center';
  ctx.fillText('SUPER MARIO', W / 2, 22);

  ctx.textAlign = 'right';
  ctx.fillText(`❤️ × ${Math.max(0, lives)}`, W - 16, 22);
}

function makeInitState() {
  const { platforms, coins, questionBlocks, goombas, pipes } = buildLevel();

  return {
    player: {
      x: 80,
      y: GROUND_Y - TILE,
      vx: 0,
      vy: 0,
      onGround: false,
      big: false,
    },
    platforms,
    coins,
    questionBlocks,
    goombas,
    pipes,
    score: 0,
    lives: 3,
    cam: 0,
    won: false,
    dead: false,
    deadTimer: 0,
  };
}

export default function MarioGame() {
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const stateRef = useRef(makeInitState());
  const keysRef = useRef({});
  const rafRef = useRef(null);
  const [display, setDisplay] = useState({ score: 0, lives: 3 });

  const reset = useCallback(() => {
    stateRef.current = makeInitState();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function physicsStep() {
      const s = stateRef.current;

      if (s.won) return;

      if (s.dead) {
        s.deadTimer--;

        if (s.deadTimer <= 0) {
          if (s.lives <= 0) return;

          s.player.x = 80;
          s.player.y = GROUND_Y - TILE;
          s.player.vx = 0;
          s.player.vy = 0;
          s.cam = 0;
          s.dead = false;
        }

        return;
      }

      const p = s.player;
      const keys = keysRef.current;

      if (keys.ArrowLeft || keys.a || keys.A) {
        p.vx = -PLAYER_SPEED;
      } else if (keys.ArrowRight || keys.d || keys.D) {
        p.vx = PLAYER_SPEED;
      } else {
        p.vx *= 0.8;
      }

      if ((keys.ArrowUp || keys[' '] || keys.w || keys.W) && p.onGround) {
        p.vy = JUMP_FORCE;
        p.onGround = false;
      }

      p.vy += GRAVITY;

      if (p.vy > 18) p.vy = 18;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = 0;
      if (p.x + TILE > LEVEL_W) p.x = LEVEL_W - TILE;

      p.onGround = false;

      const allSolids = [
        ...s.platforms,
        ...s.pipes.map((pipe) => ({
          x: pipe.x,
          y: pipe.y,
          w: pipe.w,
          h: pipe.h,
        })),
      ];

      allSolids.forEach(({ x, y, w, h }) => {
        if (!rectsOverlap(p.x, p.y, TILE, TILE, x, y, w, h)) return;

        const overlapL = p.x + TILE - x;
        const overlapR = x + w - p.x;
        const overlapT = p.y + TILE - y;
        const overlapB = y + h - p.y;
        const minO = Math.min(overlapL, overlapR, overlapT, overlapB);

        if (minO === overlapT && p.vy >= 0) {
          p.y = y - TILE;
          p.vy = 0;
          p.onGround = true;
        } else if (minO === overlapB && p.vy < 0) {
          p.y = y + h;
          p.vy = 1;
        } else if (minO === overlapL) {
          p.x = x - TILE;
        } else if (minO === overlapR) {
          p.x = x + w;
        }
      });

      s.questionBlocks.forEach((qb) => {
        if (qb.hit) return;

        if (rectsOverlap(p.x, p.y, TILE, TILE, qb.x, qb.y, TILE, TILE)) {
          const hitFromBelow = p.y + TILE <= qb.y + 8 && p.vy < 0;

          if (hitFromBelow) {
            qb.hit = true;
            s.score += 100;
            p.vy = 1;
            p.y = qb.y + TILE;
          } else {
            const overlapT = p.y + TILE - qb.y;
            const overlapB = qb.y + TILE - p.y;

            if (overlapT < overlapB && p.vy >= 0) {
              p.y = qb.y - TILE;
              p.vy = 0;
              p.onGround = true;
            }
          }
        }
      });

      s.coins.forEach((c) => {
        if (c.collected) return;

        if (rectsOverlap(p.x, p.y, TILE, TILE, c.x + 6, c.y + 6, TILE - 12, TILE - 12)) {
          c.collected = true;
          s.score += 50;
        }
      });

      s.goombas.forEach((g) => {
        if (g.dead) {
          g.deadTimer--;
          return;
        }

        g.x += g.vx;

        if (g.x < 0 || g.x + TILE > LEVEL_W) {
          g.vx *= -1;
        }

        s.platforms.forEach(({ x, y, w, h, type }) => {
          if (type !== 'ground' && rectsOverlap(g.x, g.y, TILE, TILE, x, y, w, h)) {
            const overlapL = g.x + TILE - x;
            const overlapR = x + w - g.x;

            if (overlapL < overlapR) {
              g.vx = Math.abs(g.vx);
            } else {
              g.vx = -Math.abs(g.vx);
            }
          }
        });

        if (rectsOverlap(p.x, p.y, TILE, TILE, g.x, g.y, TILE, TILE)) {
          const stomped = p.vy > 0 && p.y + TILE < g.y + TILE * 0.6;

          if (stomped) {
            g.dead = true;
            g.deadTimer = 20;
            s.score += 200;
            p.vy = JUMP_FORCE * 0.5;
          } else {
            s.lives--;
            s.dead = true;
            s.deadTimer = 60;
            p.vy = -10;
          }
        }
      });

      if (p.y > H + 60) {
        s.lives--;
        s.dead = true;
        s.deadTimer = 40;
      }

      if (p.x >= LEVEL_W - TILE * 5) {
        s.won = true;
        s.score += 1000;
      }

      const targetCam = p.x - W / 3;
      s.cam += (targetCam - s.cam) * 0.12;
      s.cam = Math.max(0, Math.min(LEVEL_W - W, s.cam));
    }

    function loop() {
      physicsStep();

      const s = stateRef.current;

      drawGame(ctx, s, s.cam);
      setDisplay({ score: s.score, lives: s.lives });

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      keysRef.current[e.key] = true;

      if (e.key === 'Enter') {
        const s = stateRef.current;

        if (s.won || s.lives <= 0) {
          reset();
        }
      }

      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };

    const onUp = (e) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);

    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [reset]);

  const mobilePress = (key, down) => {
    keysRef.current[key] = down;
  };

  const handleCanvasTap = () => {
    const s = stateRef.current;

    if (s.won || s.lives <= 0) {
      reset();
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <button
          style={styles.backBtn}
          onClick={() => navigate('/')}
        >
          ← Voltar para Home
        </button>

        <h1 style={styles.title}>MarioVerse Game</h1>

        <div style={styles.statsBox}>
          🪙 {display.score} | ❤️ {display.lives}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={styles.canvas}
        onClick={handleCanvasTap}
      />

      <div style={styles.controls}>
        <div style={styles.dpad}>
          <div style={styles.dpadRow}>
            <button
              style={styles.btn}
              onPointerDown={() => mobilePress('ArrowLeft', true)}
              onPointerUp={() => mobilePress('ArrowLeft', false)}
              onPointerLeave={() => mobilePress('ArrowLeft', false)}
            >
              ◀
            </button>

            <button
              style={{ ...styles.btn, ...styles.btnJump }}
              onPointerDown={() => mobilePress(' ', true)}
              onPointerUp={() => mobilePress(' ', false)}
              onPointerLeave={() => mobilePress(' ', false)}
            >
              ▲
            </button>

            <button
              style={styles.btn}
              onPointerDown={() => mobilePress('ArrowRight', true)}
              onPointerUp={() => mobilePress('ArrowRight', false)}
              onPointerLeave={() => mobilePress('ArrowRight', false)}
            >
              ▶
            </button>
          </div>
        </div>

        <p style={styles.hint}>
          ← ▲ → para mover | Espaço / W / ▲ para pular
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#1a1a2e',
    minHeight: '100vh',
    padding: '20px 16px',
    fontFamily: 'monospace',
  },

  topBar: {
    width: '100%',
    maxWidth: `${W}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '16px',
  },

  title: {
    color: '#fff',
    margin: 0,
    fontSize: '24px',
    textShadow: '0 0 10px rgba(255,255,255,0.3)',
  },

  backBtn: {
    padding: '12px 18px',
    background: '#ffd700',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#000',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },

  statsBox: {
    padding: '10px 14px',
    color: '#fff',
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,215,0,0.4)',
    borderRadius: '10px',
    fontWeight: 'bold',
  },

  canvas: {
    display: 'block',
    width: '100%',
    maxWidth: `${W}px`,
    imageRendering: 'pixelated',
    borderRadius: '8px',
    border: '3px solid #ffd700',
    boxShadow: '0 0 40px rgba(255,215,0,0.25)',
    cursor: 'pointer',
  },

  controls: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },

  dpad: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },

  dpadRow: {
    display: 'flex',
    gap: '8px',
  },

  btn: {
    width: '56px',
    height: '56px',
    fontSize: '20px',
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,215,0,0.4)',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    touchAction: 'manipulation',
    userSelect: 'none',
  },

  btnJump: {
    background: 'rgba(255,215,0,0.2)',
    border: '2px solid #ffd700',
  },

  hint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
    margin: 0,
  },
};