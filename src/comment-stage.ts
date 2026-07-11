import type { Comment, Stamp } from "./comment.js";
import { STAMPS } from "./stamps.js";
import { COMMENT_CONFIG as CFG } from "./comment-config.js";
import { pick, randInt } from "./random.js";

export class CommentStage {
  private lastConfettiAt = 0;

  constructor(private readonly root: HTMLElement) {}

  spawn(comment: Comment): void {
    const el = document.createElement("div");
    el.className = "comment";
    el.textContent = comment.text;

    const fontSize = pick(CFG.fontSizes);
    el.style.fontSize = `${fontSize}px`;
    el.style.color = pick(CFG.colors);
    el.style.fontWeight = `${CFG.fontWeight}`;
    if (CFG.outlineWidth > 0) {
      const w = CFG.outlineWidth;
      const c = CFG.outlineColor;
      el.style.textShadow = `${w}px ${w}px 0 ${c}, -${w}px ${w}px 0 ${c}, ${w}px -${w}px 0 ${c}, -${w}px -${w}px 0 ${c}`;
    } else {
      el.style.textShadow = "none";
    }

    const top = randInt(0, Math.max(0, this.root.clientHeight - fontSize - 8));
    el.style.top = `${top}px`;

    el.style.animationDuration = `${randInt(CFG.flowSeconds.min, CFG.flowSeconds.max)}s`;
    el.addEventListener("animationend", () => el.remove());
    this.root.appendChild(el);

    if (CFG.celebrateWords.some((w) => comment.text.includes(w))) {
      this.spawnConfetti();
    }
  }

  // お祝いモード: 画面上部から紙吹雪が舞い落ちる
  private spawnConfetti(): void {
    // 連投されても3秒に1回まで
    const now = Date.now();
    if (now - this.lastConfettiAt < 3000) return;
    this.lastConfettiAt = now;

    for (let i = 0; i < CFG.confettiCount; i++) {
      const p = document.createElement("span");
      p.className = "confetti";
      p.style.left = `${Math.random() * 100}%`;
      p.style.width = `${randInt(6, 11)}px`;
      p.style.height = `${randInt(9, 16)}px`;
      p.style.background = pick(CFG.colors);
      p.style.setProperty("--drift", `${randInt(-120, 120)}px`);
      p.style.setProperty("--spin", `${randInt(360, 1080)}deg`);
      p.style.animationDuration = `${randInt(2500, 4500)}ms`;
      p.style.animationDelay = `${randInt(0, 800)}ms`;
      p.addEventListener("animationend", () => p.remove());
      this.root.appendChild(p);
    }
  }

  spawnStamp(stamp: Stamp): void {
    const src = STAMPS[stamp.code];
    if (!src) return; // 未知のコードは無視

    // 拍手は通常のバーストではなく、画面下から大量に湧き上がる専用演出
    if ((CFG.clapCodes as readonly string[]).includes(stamp.code)) {
      const emoji = src.startsWith("emoji:") ? src.slice("emoji:".length) : "👏";
      this.spawnClapWave(emoji);
      return;
    }

    // 画面のランダムな位置にポンと現れて消える
    const size = CFG.stampSize;
    const wrap = document.createElement("div");
    wrap.className = "stamp-burst";
    wrap.style.width = `${size}px`;
    wrap.style.height = `${size}px`;
    const top = randInt(0, Math.max(0, this.root.clientHeight - size - 8));
    const left = randInt(0, Math.max(0, this.root.clientWidth - size - 8));
    wrap.style.top = `${top}px`;
    wrap.style.left = `${left}px`;

    // "emoji:🎉" 形式は画像ではなく絵文字をそのまま表示する
    let el: HTMLElement;
    if (src.startsWith("emoji:")) {
      el = document.createElement("div");
      el.className = "stamp stamp-emoji";
      el.textContent = src.slice("emoji:".length);
      el.style.fontSize = `${Math.round(size * 0.8)}px`;
    } else {
      const img = document.createElement("img");
      img.className = "stamp";
      img.src = src;
      img.alt = stamp.code;
      el = img;
    }
    el.style.animationDuration = `${randInt(CFG.stampMs.min, CFG.stampMs.max)}ms`;
    // 本体のアニメーションが一番長いので、終わったら火花ごと片付ける
    el.addEventListener("animationend", () => wrap.remove());
    wrap.appendChild(el);

    this.spawnParticles(wrap);
    this.root.appendChild(wrap);
  }

  // 画面下のあちこちから拍手がポコポコ湧き上がって消える
  private spawnClapWave(emoji: string): void {
    for (let i = 0; i < CFG.clapBurstCount; i++) {
      const el = document.createElement("span");
      el.className = "clap";
      el.textContent = emoji;
      el.style.left = `${Math.random() * 96}%`;
      el.style.bottom = `${randInt(0, 10)}%`;
      el.style.fontSize = `${randInt(28, 72)}px`;
      el.style.setProperty("--rise", `${randInt(90, 240)}px`);
      el.style.setProperty("--sway", `${randInt(-70, 70)}px`);
      el.style.setProperty("--tilt", `${randInt(-24, 24)}deg`);
      el.style.animationDuration = `${randInt(1200, 2200)}ms`;
      el.style.animationDelay = `${randInt(0, 600)}ms`;
      el.addEventListener("animationend", () => el.remove());
      this.root.appendChild(el);
    }
  }

  private spawnParticles(wrap: HTMLElement): void {
    const count = randInt(12, 16);
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "particle";

      // 全方位に均等ばら撒き + 角度と距離を少し揺らす
      const angle =
        (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const dist = randInt(70, 140);
      p.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      p.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);

      const dot = randInt(6, 12);
      p.style.width = `${dot}px`;
      p.style.height = `${dot}px`;
      p.style.background = pick(CFG.colors);
      p.style.animationDuration = `${randInt(500, 900)}ms`;
      p.style.animationDelay = `${randInt(0, 120)}ms`;

      wrap.appendChild(p);
    }
  }
}
