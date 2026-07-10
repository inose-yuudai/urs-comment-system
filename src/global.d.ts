export {};

declare global {
  interface Window {
    // preload (contextBridge) 経由で渡される Supabase 接続情報
    supabaseEnv: {
      url: string;
      publishableKey: string;
    };
  }
}
