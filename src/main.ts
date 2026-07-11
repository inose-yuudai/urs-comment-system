import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  globalShortcut,
  nativeImage,
  screen,
} from "electron";
import type { Display, MenuItemConstructorOptions } from "electron";
import path from "node:path";

try {
  // パッケージ版では .env は Resources に同梱される（package.json の extraResources）
  const envPath = app.isPackaged
    ? path.join(process.resourcesPath, ".env")
    : path.join(process.cwd(), ".env");
  process.loadEnvFile(envPath);
} catch {
  console.warn(".env が見つかりません。Supabase 接続情報が未設定です。");
}

let win: BrowserWindow | null = null;
let tray: Tray | null = null;
let currentDisplayId: number | null = null;

function createWindow(display: Display): void {
  const { x, y, width, height } = display.workArea;
  currentDisplayId = display.id;

  win = new BrowserWindow({
    width,
    height,
    x,
    y,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    movable: false,
    focusable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: "#00000000",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(import.meta.dirname, "preload.cjs"),
      additionalArguments: [
        `--supabase-url=${process.env.SUPABASE_URL ?? ""}`,
        `--supabase-publishable-key=${process.env.SUPABASE_PUBLISHABLE_KEY ?? ""}`,
        `--room-id=${process.env.ROOM_ID ?? "default"}`,
      ],
    },
  });

  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true, { forward: true });

  win.loadFile(path.join(import.meta.dirname, "index.html"));
}

function moveToDisplay(display: Display): void {
  if (!win) return;
  currentDisplayId = display.id;
  // resizable: false のままだと setBounds のサイズ変更が効かないので一時的に解除する
  win.setResizable(true);
  win.setBounds(display.workArea);
  win.setResizable(false);
  updateMenus();
}

function displayMenuItems(): MenuItemConstructorOptions[] {
  return screen.getAllDisplays().map((d, i) => ({
    label: `${d.label || `ディスプレイ ${i + 1}`} (${d.bounds.width}×${d.bounds.height})`,
    type: "radio" as const,
    checked: d.id === currentDisplayId,
    click: () => moveToDisplay(d),
  }));
}

// 上部メニューバー（アプリメニューの並び）とトレイの両方に同じ切り替えメニューを出す
function updateMenus(): void {
  const appMenu = Menu.buildFromTemplate([
    { role: "appMenu" },
    { label: "表示先ディスプレイ", submenu: displayMenuItems() },
  ]);
  Menu.setApplicationMenu(appMenu);

  if (tray) {
    tray.setContextMenu(
      Menu.buildFromTemplate([
        { label: "表示先ディスプレイ", enabled: false },
        ...displayMenuItems(),
        { type: "separator" },
        {
          label: win?.isVisible()
            ? "コメントを一時非表示 (⌃⌘H)"
            : "コメント表示を再開 (⌃⌘H)",
          click: toggleOverlay,
        },
        { type: "separator" },
        { label: "終了", role: "quit" },
      ]),
    );
  }

}

// Ctrl+Cmd+H でコメント表示を一時的に隠す/戻す
function toggleOverlay(): void {
  if (!win) return;
  if (win.isVisible()) {
    win.hide();
  } else {
    // show() だとフォーカスを奪おうとするので showInactive() を使う
    win.showInactive();
  }
  updateMenus();
}

// Ctrl+Cmd+Y で次のディスプレイへ順繰りに移動する
function cycleDisplay(): void {
  const displays = screen.getAllDisplays();
  if (displays.length < 2) return;
  const i = displays.findIndex((d) => d.id === currentDisplayId);
  moveToDisplay(displays[(i + 1) % displays.length]);
}

function createTray(): void {
  const icon = nativeImage.createFromPath(
    path.join(import.meta.dirname, "tray.png"),
  );
  // 画像が読めなかった環境でも文字だけで常駐できるようにしておく
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setTitle("URS");
  tray.setToolTip("URS - 表示先ディスプレイを切り替え");
}

app.whenReady().then(() => {
  // 他アプリの全画面（フルスクリーンSpace）の上に重ねるには
  // Dock アイコンを隠したエージェントアプリである必要がある
  app.dock?.hide();

  createWindow(screen.getPrimaryDisplay());
  createTray();
  updateMenus();

  globalShortcut.register("Control+Command+Y", cycleDisplay);
  globalShortcut.register("Control+Command+H", toggleOverlay);

  // モニターの抜き差しに追従してメニューを作り直す
  screen.on("display-added", updateMenus);
  screen.on("display-removed", () => {
    // 表示中のモニターが抜かれたらプライマリに戻す
    const displays = screen.getAllDisplays();
    if (!displays.some((d) => d.id === currentDisplayId)) {
      moveToDisplay(screen.getPrimaryDisplay());
    }
    updateMenus();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(screen.getPrimaryDisplay());
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
