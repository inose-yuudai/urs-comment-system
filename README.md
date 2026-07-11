# URS

画面の上にコメントとスタンプがニコニコ風に流れるコメントシステムです。

- **送信側**: Web ページ(スマホ/PC のブラウザ)からコメント・定型文・スタンプを送る。今何人がページを開いているかも「👥 ◯人参加中」と表示される
- **受信側**: Mac のデスクトップアプリ。画面全体に透明なオーバーレイを重ね、届いたコメントが流れる(クリックは透過するので作業や発表の邪魔をしない)

通信には Supabase Realtime を使っています。

## 🔗 コメント送信ページ(デフォルトルーム)

> **https://urs-flame.vercel.app/**
>
> ※ Vercel のダッシュボードに表示される本番 URL に差し替えてください。
> ルームを分けたいときは `?room=好きな名前` を付けます(例: `https://urs-xxxx.vercel.app/?room=event2`)。

---

## 🚀 0からのセットアップ(新しい PC)

### 1. 必要なもの

| ツール | 用途 | 入手先 |
|---|---|---|
| Node.js (v20以上) | ビルドと実行 | https://nodejs.org/ja |
| Git | ソースコードの取得 | Xcode Command Line Tools に同梱(`xcode-select --install`) |

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

プロジェクト直下に `.env` というファイルを作り、次の3行を書きます:

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

| 操作 | 方法 |
|---|---|
| 表示するモニターを切り替え | `Ctrl + Cmd + Y`(押すたびに次のモニターへ) |
| コメントを一時的に隠す / 戻す | `Ctrl + Cmd + H` |
| メニューから操作・終了 | メニューバー右上のロゴアイコンをクリック |

- Google スライドや Keynote の**全画面プレゼンの上にも表示されます**
- Zoom で「画面全体」を共有すればコメントごと配信にのります(「ウィンドウ共有」だとのりません)
- Dock にはアイコンが出ません(全画面の上に重ねるための仕様です)

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

## 📦 配布用ビルド(Mac アプリ)

```bash
npm run dist
```

`release/` フォルダに dmg / zip が作られます(`.env` も同梱されます)。
