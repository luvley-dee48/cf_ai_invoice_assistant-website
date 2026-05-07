import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, Plus, Paperclip, Sparkles, Send, Brain, Loader2 } from "lucide-react";
import { useSendMessage, useChatMemory, ChatMessage, sendMessage } from "@/lib/chat";
import { toast } from "sonner";

const suggestions = ["Prep me for the Stripe onsite", "Draft a follow-up to Priya", "Compare Linear vs Vercel offers", "What did I learn from the Cloudflare call?"];

export default function Chat() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<any>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getMemory, updateContext } = useChatMemory();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load initial context
    const loadContext = async () => {
      try {
        const memory = await getMemory();
        setContext(memory);
      } catch (error) {
        console.error('Failed to load chat context:', error);
      }
    };
    loadContext();
  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() && attachments.length === 0) return;

    setIsLoading(true);
    
    try {
      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        from: 'user',
        text: messageText,
        timestamp: new Date().toISOString(),
        attachments: attachments.map(file => ({
          type: file.type.startsWith('image/') ? 'image' : 'document',
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size
        }))
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Send message to backend
      const response = await sendMessage('default-conversation', messageText, attachments);
      
      // Add AI response
      setMessages(prev => [...prev, response]);
      
      // Clear input
      setMsg("");
      setAttachments([]);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
      // Remove the user message if it failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-sm font-semibold">AI Invoice Assistant</div>
            <div className="text-xs text-muted-foreground">Llama 3.3 · Cloudflare Workers AI</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-full">
              <Bookmark className="mr-1.5 h-3.5 w-3.5" /> Save to memory
            </Button>
            <Button size="sm" variant="outline" className="rounded-full">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Create task
            </Button>
          </div>
        </div>
        
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-accent" />
              <p className="text-sm">Start a conversation with your AI assistant</p>
            </div>
          ) : (
            messages.map((message, i) => (
              <div key={i} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  message.from === "user" 
                    ? "rounded-br-sm bg-secondary" 
                    : "rounded-bl-sm bg-accent-soft"
                }`}>
                  <p>{message.text}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {attachment.type === 'image' ? (
                            <img src={attachment.url} alt={attachment.name} className="h-16 w-16 rounded object-cover" />
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
          
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {suggestions.map((s) => (
                <button 
                  key={s} 
                  onClick={() => handleSuggestionClick(s)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-accent-soft px-4 py-2.5 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(msg); }} className="border-t border-border p-3">
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((file, idx) => (
                <div key={idx} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs">
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
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Context</h3>
            <Brain className="h-4 w-4 text-accent" />
          </div>
          <div className="space-y-2 text-sm">
            {context.goal && (
              <div className="rounded-lg bg-secondary px-3 py-2 text-xs">
                Goal: {context.goal}
              </div>
            )}
            {context.cv && (
              <div className="rounded-lg bg-secondary px-3 py-2 text-xs">
                CV: {context.cv}
              </div>
            )}
            {context.contacts && context.contacts.length > 0 && (
              <div className="rounded-lg bg-secondary px-3 py-2 text-xs">
                Contacts: {context.contacts.join(', ')}
              </div>
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
    </div>
  );
}