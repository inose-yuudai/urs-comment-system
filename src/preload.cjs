const { contextBridge } = require("electron");

// main から additionalArguments で渡された値を取り出す
const read = (key) => {
  const prefix = `--${key}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : "";
};

contextBridge.exposeInMainWorld("supabaseEnv", {
  url: read("supabase-url"),
  publishableKey: read("supabase-publishable-key"),
});
