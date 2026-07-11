# URS

画面の上にコメントとスタンプがニコニコ風に流れるコメントシステムです。

- **送信側**: Web ページ(スマホ/PC のブラウザ)からコメント・定型文・スタンプを送る。今何人がページを開いているかも「👥 ◯人参加中」と表示される
- **受信側**: Mac / Windows のデスクトップアプリ。画面全体に透明なオーバーレイを重ね、届いたコメントが流れる(クリックは透過するので作業や発表の邪魔をしない)

通信には Supabase Realtime を使っています。

## 🔗 コメント送信ページ(デフォルトルーム)

> **https://urs-flame.vercel.app/**
>
> ルームを分けたいときは `?room=好きな名前` を付けます(例: `https://urs-flame.vercel.app/?room=event2`)。

---

## 🚀 0からのセットアップ(新しい PC)

Mac / Windows どちらも手順は同じで、違うのは「1. 必要なもの」の入れ方と、あとで使うショートカットキーだけです。

### 1. 必要なもの

| ツール | 用途 | Mac での入手 | Windows での入手 |
|---|---|---|---|
| Node.js (v20以上) | ビルドと実行 | https://nodejs.org/ja | https://nodejs.org/ja (同じインストーラーページで Windows 版を選択) |
| Git | ソースコードの取得 | `xcode-select --install` を実行 | https://git-scm.com/download/win (Git for Windows) |

> **Windows の場合**: 以降のコマンドは **PowerShell**(スタートメニューで「PowerShell」を検索)に貼り付けて実行してください。Mac のターミナルと同じコマンドがそのまま使えます。

### 2. ソースコードを取得

```bash
git clone https://github.com/inose-yuudai/urs.git
cd urs
```

### 3. 依存パッケージをインストール

```bash
npm install
```

(初回は Electron 本体を約130MBダウンロードするので数分かかります)

### 4. `.env` を作成

プロジェクト直下(`package.json` と同じ場所)に `.env` というファイルを作り、次の3行を書きます。
Windows でメモ帳を使う場合は、保存時に `.env.txt` にならないよう「ファイルの種類: すべてのファイル」を選んでください:

```env
SUPABASE_URL=https://yuhztxmuqqlefdeptecd.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_QpYyfaifwzb8dH1RfcqfzQ_7iHZS-Jn
ROOM_ID=default
```

- 上2つは Supabase の接続情報(公開用キーなのでこのまま使えます)
- `ROOM_ID` は送信ページの `?room=xxx` と合わせる(通常は `default` のまま)

### 5. 起動

```bash
npm run dev
```

画面に透明なオーバーレイが表示されれば成功です。送信ページからコメントを送ると画面に流れます。

---

## 🎮 操作方法(受信アプリ)

| 操作 | Mac | Windows |
|---|---|---|
| 表示するモニターを切り替え(押すたびに次へ) | `Ctrl + Cmd + Y` | `Ctrl + Alt + Y` |
| コメントを一時的に隠す / 戻す | `Ctrl + Cmd + H` | `Ctrl + Alt + H` |
| メニューから操作・終了 | メニューバー右上のロゴアイコン | タスクバー右下の通知領域のロゴアイコン |

- Google スライドや Keynote の**全画面プレゼンの上にも表示されます**
- Zoom で「画面全体」を共有すればコメントごと配信にのります(「ウィンドウ共有」だとのりません)
- Mac では Dock にアイコンが出ません(全画面の上に重ねるための仕様です)

---

## 🎨 カスタマイズ

### コメントの色・大きさ・速さ

[`src/comment-config.ts`](src/comment-config.ts) の値を書き換えて `npm run dev` で反映されます。
文字色・フォントサイズ・縁取り・流れる速さ・スタンプの大きさ・お祝いモードの単語などが変えられます。

### お祝いモード 🎉

「おめでとう」「祝」「🎉」を含むコメントが来ると画面全体に紙吹雪が舞います。
トリガーの単語は `comment-config.ts` の `celebrateWords` で変更できます。

### 拍手の演出 👏

👏 スタンプが届くと、画面下から拍手の絵文字が大量に湧き上がります。
一度に湧く数は `comment-config.ts` の `clapBurstCount`、対象のスタンプは `clapCodes` で変更できます。

### 定型文(迷ったらこれ)

[`web/index.html`](web/index.html) の `PRESETS` 配列を書き換えます。1行 = 1ボタンです。
変更後は `git push` すると Vercel に自動デプロイされます。

### スタンプを増やす

スタンプは**送信側と受信側の両方に同じコードで登録**します:

1. 画像を `src/stamps/` と `web/stamps/` の両方に置く(例: `wow.png`)
2. [`src/stamps.ts`](src/stamps.ts) に `wow: "stamps/wow.png",` を追加
3. `web/index.html` の `STAMPS` にも同じ行を追加

**絵文字スタンプ**なら画像不要で、両方の登録表に1行足すだけです:

```js
party: "emoji:🥳",
```

---

## 🌐 Web(送信ページ)のデプロイ

Vercel と GitHub 連携済みなので、**`main` に push するだけで自動デプロイ**されます。
静的サイト構成(`vercel.json` で `web/` フォルダを公開)なのでビルド設定は不要です。

## 📦 配布用ビルド

```bash
npm run dist       # Mac 用 (dmg / zip)
npm run dist:win   # Windows 用 (インストーラー / zip) ※Windows 上で実行
```

`release/` フォルダに成果物が作られます(`.env` も同梱されます)。
