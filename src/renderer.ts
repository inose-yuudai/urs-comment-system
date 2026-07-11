import type { CommentSource } from "./comment.js";
import { CommentStage } from "./comment-stage.js";
import { SupabaseCommentSource } from "./supabase-comment-source.js";

const stage = new CommentStage(
  document.getElementById("stage") as HTMLDivElement,
);
// web/index.html の送信側と同じルームに接続する（.env の ROOM_ID で変更できる）
const source: CommentSource = new SupabaseCommentSource(
  window.supabaseEnv.roomId,
);

source.subscribe((comment) => stage.spawn(comment));
source.subscribeStamps((stamp) => stage.spawnStamp(stamp));
source.start();

