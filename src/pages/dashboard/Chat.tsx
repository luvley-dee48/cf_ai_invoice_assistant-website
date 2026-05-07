import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, Plus, Paperclip, Sparkles, Send, Brain, Loader2 } from "lucide-react";
import {
  ChatMessage,
  sendMessage,
  saveToMemory,
  createTask,
  getChatMemory,
} from "@/lib/chat";
import { toast } from "sonner";

const CONVERSATION_ID = "default-conversation";

const suggestions = [
  "Prep me for the Stripe onsite",
  "Draft a follow-up to Priya",
  "Compare Linear vs Vercel offers",
  "What did I learn from the Cloudflare call?",
];

export default function Chat() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [context, setContext] = useState<Record<string, unknown>>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadContext = async () => {
      try {
        const memories = await getChatMemory();
        // Show count of saved memories in context panel
        setContext({ savedMemories: memories.length });
      } catch (error) {
        console.error("Failed to load chat context:", error);
      }
    };
    loadContext();
  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() && attachments.length === 0) return;

    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      from: "user",
      text: messageText,
      timestamp: new Date().toISOString(),
      attachments: attachments.map((file) => ({
        type: file.type.startsWith("image/") ? "image" : "document",
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
      })),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMsg("");
    setAttachments([]);

    try {
      const aiMessage = await sendMessage(CONVERSATION_ID, messageText, attachments);
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to send message";
      toast.error(errMsg);
      // Show error inline so the user sees it in the chat
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          from: "ai",
          text: `⚠️ ${errMsg}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Save to Memory ──────────────────────────────────────────────────────────
  const handleSaveToMemory = async () => {
    if (messages.length === 0) {
      toast.error("No messages to save. Start a conversation first.");
      return;
    }

    setIsSaving(true);
    try {
      const title = `Chat on ${new Date().toLocaleDateString()} — ${messages[0]?.text?.slice(0, 40) || "conversation"}`;
      await saveToMemory(CONVERSATION_ID, title);
      toast.success("Conversation saved to memory!");
      // Refresh context count
      const memories = await getChatMemory();
      setContext((prev) => ({ ...prev, savedMemories: memories.length }));
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to save to memory";
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Create Task ─────────────────────────────────────────────────────────────
  const handleCreateTask = async () => {
    const title = taskTitle.trim() || (messages.length > 0
      ? `Follow up: ${messages[messages.length - 1]?.text?.slice(0, 60)}`
      : "New task from chat");

    setIsCreatingTask(true);
    try {
      await createTask({
        title,
        description: messages.length > 0
          ? `Created from chat conversation.\nLast message: ${messages[messages.length - 1]?.text}`
          : "",
        priority: "medium",
        conversationId: CONVERSATION_ID,
      });
      toast.success("Task created!");
      setShowTaskModal(false);
      setTaskTitle("");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to create task";
      toast.error(errMsg);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col rounded-2xl border border-border bg-card shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-sm font-semibold">AI Invoice Assistant</div>
            <div className="text-xs text-muted-foreground">Llama 3.3 · Cloudflare Workers AI</div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={handleSaveToMemory}
              disabled={isSaving || messages.length === 0}
            >
              {isSaving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Bookmark className="mr-1.5 h-3.5 w-3.5" />
              )}
              Save to memory
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => setShowTaskModal(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Create task
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
          {messages.length === 0 ? (
            <>
              <div className="text-center text-muted-foreground py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-accent" />
                <p className="text-sm">Start a conversation with your AI assistant</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 justify-center">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSendMessage(s)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          ) : (
            messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    message.from === "user"
                      ? "rounded-br-sm bg-secondary"
                      : "rounded-bl-sm bg-accent-soft"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {attachment.type === "image" && attachment.url ? (
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="h-16 w-16 rounded object-cover"
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              <Paperclip className="h-3 w-3" />
                              <span>{attachment.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-accent-soft px-4 py-2.5 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(msg);
          }}
          className="border-t border-border p-3"
        >
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs"
                >
                  <Paperclip className="h-3 w-3" />
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Ask your AI assistant anything…"
              className="border-0 shadow-none focus-visible:ring-0"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-lg"
              disabled={isLoading || (!msg.trim() && attachments.length === 0)}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Context</h3>
            <Brain className="h-4 w-4 text-accent" />
          </div>
          <div className="space-y-2 text-sm">
            {(context.savedMemories as number) > 0 && (
              <div className="rounded-lg bg-secondary px-3 py-2 text-xs">
                {context.savedMemories as number} saved{" "}
                {(context.savedMemories as number) === 1 ? "memory" : "memories"}
              </div>
            )}
            {messages.length > 0 && (
              <div className="rounded-lg bg-secondary px-3 py-2 text-xs">
                {messages.length} message{messages.length !== 1 ? "s" : ""} in this session
              </div>
            )}
            {messages.length === 0 && !(context.savedMemories as number) && (
              <p className="text-xs text-muted-foreground">No context yet. Start chatting!</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-accent" /> Tools available
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>· web.search</li>
            <li>· calendar.create_event</li>
            <li>· memory.save</li>
            <li>· tracker.update_status</li>
            <li>· invoice.process</li>
            <li>· document.extract</li>
          </ul>
        </div>
      </aside>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h2 className="mb-4 text-sm font-semibold">Create Task</h2>
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title…"
              className="mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateTask();
                if (e.key === "Escape") setShowTaskModal(false);
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowTaskModal(false); setTaskTitle(""); }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateTask} disabled={isCreatingTask}>
                {isCreatingTask ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}