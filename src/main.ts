import { app, BrowserWindow, screen } from "electron";
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

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
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
      ],
    },
  });

  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true, { forward: true });

  win.loadFile(path.join(import.meta.dirname, "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
