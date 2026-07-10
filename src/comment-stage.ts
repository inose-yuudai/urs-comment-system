import type { Comment, Stamp } from "./comment.js";
import { STAMPS } from "./stamps.js";
import { pick, randInt } from "./random.js";

export class CommentStage {
  private static readonly COLORS: readonly string[] = [
    "#ffffff",
    "#ffeb3b",
    "#ff5252",
    "#69f0ae",
    "#40c4ff",
    "#ff80ab",
    "#b388ff",
  ];
  private static readonly FONT_SIZES: readonly number[] = [24, 32, 40, 56];
  private static readonly STAMP_SIZE = 96;

  constructor(private readonly root: HTMLElement) {}

  spawn(comment: Comment): void {
    const el = document.createElement("div");
    el.className = "comment";
    el.textContent = comment.text;

    const fontSize = pick(CommentStage.FONT_SIZES);
    el.style.fontSize = `${fontSize}px`;
    el.style.color = pick(CommentStage.COLORS);

    const top = randInt(0, Math.max(0, this.root.clientHeight - fontSize - 8));
    el.style.top = `${top}px`;

    el.style.animationDuration = `${randInt(5, 10)}s`;
    el.addEventListener("animationend", () => el.remove());
    this.root.appendChild(el);
  }

  spawnStamp(stamp: Stamp): void {
    const src = STAMPS[stamp.code];
    if (!src) return; // 未知のコードは無視

    // 画面のランダムな位置にポンと現れて消える
    const size = CommentStage.STAMP_SIZE;
    const wrap = document.createElement("div");
    wrap.className = "stamp-burst";
    const top = randInt(0, Math.max(0, this.root.clientHeight - size - 8));
    const left = randInt(0, Math.max(0, this.root.clientWidth - size - 8));
    wrap.style.top = `${top}px`;
    wrap.style.left = `${left}px`;

    const el = document.createElement("img");
    el.className = "stamp";
    el.src = src;
    el.alt = stamp.code;
    el.style.animationDuration = `${randInt(1800, 2600)}ms`;
    // 本体のアニメーションが一番長いので、終わったら火花ごと片付ける
    el.addEventListener("animationend", () => wrap.remove());
    wrap.appendChild(el);

    this.spawnParticles(wrap);
    this.root.appendChild(wrap);
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
      p.style.background = pick(CommentStage.COLORS);
      p.style.animationDuration = `${randInt(500, 900)}ms`;
      p.style.animationDelay = `${randInt(0, 120)}ms`;

      wrap.appendChild(p);
    }
  }
}
