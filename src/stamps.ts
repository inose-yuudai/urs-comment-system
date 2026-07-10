// スタンプ登録表: 通信ではコードだけを送り、表示側でこの表から画像を引く。
// 新しいスタンプを追加するときは stamps/ に画像を置いてここに1行足す
// （web/index.html の STAMPS にも同じコードを足すこと）。
export const STAMPS: Readonly<Record<string, string>> = {
  keke: "stamps/keke.png",
};
