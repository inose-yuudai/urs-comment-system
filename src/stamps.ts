// スタンプ登録表: 通信ではコードだけを送り、表示側でこの表から画像を引く。
// 新しいスタンプを追加するときは stamps/ に画像を置いてここに1行足す
// （web/index.html の STAMPS にも同じコードを足すこと）。
// 値を "emoji:🎉" のようにすると、画像ファイルなしで絵文字がそのままスタンプになる。
export const STAMPS: Readonly<Record<string, string>> = {
  logo: "stamps/logo.png",
  uno: "stamps/uno.png",
  urs: "stamps/urs.png",
  tada: "emoji:🎉",
  clap: "emoji:👏",
  lol: "emoji:😂",
  heart: "emoji:❤️",
  fire: "emoji:🔥",
};
