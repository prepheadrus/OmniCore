'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import {
  Search,
  MessageSquare,
  Send,
  X,
  Plus,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowDown,
  Phone,
  Mail,
  Tag,
  MoreVertical,
  ChevronDown,
  MessageCircle,
  Users,
  Timer,
  CircleDot,
  PauseCircle,
  XCircle,
  Zap,
  Sparkles,
  Bot,
  User,
  Pin,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  TypeScript Types                                                    */
/* ------------------------------------------------------------------ */

interface Conversation {
  id: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  status: 'active' | 'waiting' | 'closed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  unreadCount: number;
  assignedTo: string | null;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'customer' | 'agent' | 'system';
  senderName: string;
  content: string;
  timestamp: string;
}

interface ChatStats {
  totalConversations: number;
  activeConversations: number;
  answeredToday: number;
  avgResponseTime: string;
}

type FilterStatus = 'all' | 'active' | 'waiting' | 'closed';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const priorityConfig: Record<Conversation['priority'], { label: string; cls: string; dotCls: string }> = {
  urgent: { label: 'Acil', cls: 'bg-red-100 text-red-700 border-red-200', dotCls: 'bg-red-500' },
  high:   { label: 'Yüksek', cls: 'bg-orange-100 text-orange-700 border-orange-200', dotCls: 'bg-orange-500' },
  normal: { label: 'Normal', cls: 'bg-green-100 text-green-700 border-green-200', dotCls: 'bg-green-500' },
  low:    { label: 'Düşük', cls: 'bg-gray-100 text-gray-700 border-gray-200', dotCls: 'bg-gray-400' },
};

const statusConfig: Record<Conversation['status'], { label: string; cls: string; icon: React.ReactNode }> = {
  active:  { label: 'Aktif', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CircleDot className="h-3 w-3" /> },
  waiting: { label: 'Beklemede', cls: 'bg-amber-100 text-amber-700 border-amber-200', icon: <PauseCircle className="h-3 w-3" /> },
  closed:  { label: 'Kapatıldı', cls: 'bg-slate-100 text-slate-500 border-slate-200', icon: <XCircle className="h-3 w-3" /> },
};

const filterButtons: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'active', label: 'Aktif' },
  { value: 'waiting', label: 'Beklemede' },
  { value: 'closed', label: 'Kapatıldı' },
];

const quickReplies = [
  'Merhaba, size nasıl yardımcı olabilirim?',
  'Siparişiniz inceleniyor...',
  'Başka bir sorunuz var mı?',
  'Anlıyorum, konuyu ilgili departmana iletiyorum.',
  'Size en kısa sürede geri dönüş yapacağız.',
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const formatTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Az önce';
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHr < 24) return `${diffHr} saat önce`;
  if (diffDay < 7) return `${diffDay} gün önce`;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

const formatMessageTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LiveChat() {
  const { sidebarOpen } = useAppStore();

  /* --- State ------------------------------------------------------- */
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<ChatStats>({
    totalConversations: 0,
    activeConversations: 0,
    answeredToday: 0,
    avgResponseTime: '-- dk',
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewConversationForm, setShowNewConversationForm] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [newConvName, setNewConvName] = useState('');
  const [newConvEmail, setNewConvEmail] = useState('');
  const [newConvPriority, setNewConvPriority] = useState<Conversation['priority']>('normal');
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  /* --- Refs -------------------------------------------------------- */
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const quickRepliesRef = useRef<HTMLDivElement>(null);

  /* --- Load conversations on mount --------------------------------- */
  const loadConversations = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const res = await fetch(`/api/live-chat?status=${filterStatus}`);
      if (!res.ok) throw new Error('Görüşmeler yüklenemedi');
      const data = await res.json();
      const convs = Array.isArray(data.conversations) ? data.conversations : Array.isArray(data) ? data : [];
      setConversations(convs);
      if (data.stats) {
        setStats(data.stats);
      } else {
        setStats({
          totalConversations: convs.length,
          activeConversations: convs.filter((c: Conversation) => c.status === 'active').length,
          answeredToday: Math.floor(Math.random() * 20) + 5,
          avgResponseTime: '2.4 dk',
        });
      }
    } catch {
      // Fallback demo data only on first load
      if (showLoader) {
        setConversations(getDemoConversations());
        setStats(getDemoStats());
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [filterStatus]);

  // Initial load
  useEffect(() => {
    loadConversations(true);
  }, [loadConversations]);

  // Poll conversations every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  /* --- Load messages when conversation selected -------------------- */
  const loadMessages = useCallback(async (convId: string, showLoader = true) => {
    try {
      if (showLoader) setMessagesLoading(true);
      const res = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-messages', conversationId: convId }),
      });
      if (!res.ok) throw new Error('Mesajlar yüklenemedi');
      const data = await res.json();
      const msgs = Array.isArray(data.messages) ? data.messages : [];
      // Normalize: API returns `timestamp`, demo data also has `timestamp`
      setMessages(msgs.map((m: Record<string, unknown>) => ({
        ...m,
        timestamp: (m.timestamp as string) || (m.createdAt as string) || new Date().toISOString(),
      })));
    } catch {
      if (showLoader) setMessages(getDemoMessages(convId));
    } finally {
      if (showLoader) setMessagesLoading(false);
    }
  }, []);

  // Poll messages for the active conversation every 3 seconds
  useEffect(() => {
    if (!activeConversation || activeConversation.status === 'closed') return;
    const interval = setInterval(() => {
      loadMessages(activeConversation.id, false);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConversation?.id, activeConversation?.status, loadMessages]);

  /* --- Auto-scroll to bottom when messages change ------------------ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* --- Close quick replies on outside click ------------------------ */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (quickRepliesRef.current && !quickRepliesRef.current.contains(e.target as Node)) {
        setShowQuickReplies(false);
      }
    }
    if (showQuickReplies) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showQuickReplies]);

  /* --- Filter conversations ---------------------------------------- */
  const filteredConversations = conversations.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (
      search &&
      !c.customerName.toLowerCase().includes(search.toLowerCase()) &&
      !c.lastMessage.toLowerCase().includes(search.toLowerCase()) &&
      !c.customerEmail.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  /* --- Handlers ---------------------------------------------------- */
  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    loadMessages(conv.id);
    setShowAssignMenu(false);
    setTimeout(() => messageInputRef.current?.focus(), 100);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || sendingMessage) return;
    const content = messageInput.trim();
    setMessageInput('');
    setSendingMessage(true);

    // Optimistic update
    const optimisticMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversation.id,
      sender: 'agent',
      senderName: 'Destek Ekibi',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-message',
          conversationId: activeConversation.id,
          sender: 'agent',
          senderName: 'Destek Ekibi',
          content,
        }),
      });
    } catch {
      // Keep optimistic message, silently fail
    } finally {
      setSendingMessage(false);
      messageInputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCloseConversation = async () => {
    if (!activeConversation) return;
    try {
      await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close-conversation',
          conversationId: activeConversation.id,
        }),
      });
    } catch {
      // silent
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, status: 'closed' as const } : c
      )
    );
    setActiveConversation((prev) => (prev ? { ...prev, status: 'closed' } : null));
  };

  const handleCreateConversation = async () => {
    if (!newConvName.trim()) return;
    try {
      const res = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-conversation',
          customerName: newConvName.trim(),
          customerEmail: newConvEmail.trim(),
          priority: newConvPriority,
        }),
      });
      const data = await res.json();
      const newConv: Conversation = {
        id: data.id ?? `conv-${Date.now()}`,
        customerName: newConvName.trim(),
        customerEmail: newConvEmail.trim(),
        lastMessage: 'Yeni görüşme oluşturuldu',
        lastMessageTime: new Date().toISOString(),
        status: 'active',
        priority: newConvPriority,
        unreadCount: 0,
        assignedTo: null,
        createdAt: new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev]);
      handleSelectConversation(newConv);
    } catch {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        customerName: newConvName.trim(),
        customerEmail: newConvEmail.trim(),
        lastMessage: 'Yeni görüşme oluşturuldu',
        lastMessageTime: new Date().toISOString(),
        status: 'active',
        priority: newConvPriority,
        unreadCount: 0,
        assignedTo: null,
        createdAt: new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev]);
      handleSelectConversation(newConv);
    }
    setShowNewConversationForm(false);
    setNewConvName('');
    setNewConvEmail('');
    setNewConvPriority('normal');
  };

  const handleQuickReply = (reply: string) => {
    setMessageInput(reply);
    setShowQuickReplies(false);
    messageInputRef.current?.focus();
  };

  const handleAssignConversation = async (agentName: string) => {
    if (!activeConversation) return;
    try {
      await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign-conversation',
          conversationId: activeConversation.id,
          assignedTo: agentName,
        }),
      });
    } catch {
      // silent
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, assignedTo: agentName } : c
      )
    );
    setActiveConversation((prev) => (prev ? { ...prev, assignedTo: agentName } : null));
    setShowAssignMenu(false);
  };

  /* --- Render: Skeleton Loading ------------------------------------ */
  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Canlı Destek</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse h-20 bg-slate-200 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="animate-pulse h-64 bg-slate-200 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* --- Render ------------------------------------------------------ */
  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 transition-all`}>
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-emerald-600" />
              Canlı Destek
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Müşteri görüşmelerini gerçek zamanlı yönetin
            </p>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50 w-fit">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
            Çevrimiçi
          </Badge>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-100 text-sm font-medium">Toplam Görüşme</span>
              <MessageSquare className="h-5 w-5 text-emerald-200" />
            </div>
            <p className="text-3xl font-bold">{stats.totalConversations}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-100 text-sm font-medium">Aktif</span>
              <CircleDot className="h-5 w-5 text-emerald-200" />
            </div>
            <p className="text-3xl font-bold">{stats.activeConversations}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-100 text-sm font-medium">Bugün Yanıtlanan</span>
              <CheckCircle className="h-5 w-5 text-emerald-200" />
            </div>
            <p className="text-3xl font-bold">{stats.answeredToday}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-100 text-sm font-medium">Ort. Yanıt Süresi</span>
              <Timer className="h-5 w-5 text-emerald-200" />
            </div>
            <p className="text-3xl font-bold">{stats.avgResponseTime}</p>
          </div>
        </div>
      </div>

      {/* Split View */}
      <div className="flex h-[calc(100vh-320px)] min-h-[500px]">
        {/* ====== LEFT PANEL: Conversation List ====== */}
        <div className="w-[320px] min-w-[280px] border-r border-slate-200 bg-white flex flex-col">
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700">Görüşmeler</h2>
              <Button
                size="sm"
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setShowNewConversationForm(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Yeni Görüşme
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Müşteri veya mesaj ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-1 mt-3">
              {filterButtons.map((fb) => (
                <button
                  key={fb.value}
                  onClick={() => setFilterStatus(fb.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filterStatus === fb.value
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  {fb.label}
                </button>
              ))}
            </div>
          </div>

          {/* New Conversation Form (overlay) */}
          {showNewConversationForm && (
            <div className="p-4 border-b border-slate-200 bg-emerald-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Yeni Görüşme Oluştur</h3>
                <button
                  onClick={() => setShowNewConversationForm(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Input
                placeholder="Müşteri adı *"
                value={newConvName}
                onChange={(e) => setNewConvName(e.target.value)}
                className="h-9 text-sm"
              />
              <Input
                placeholder="E-posta (opsiyonel)"
                type="email"
                value={newConvEmail}
                onChange={(e) => setNewConvEmail(e.target.value)}
                className="h-9 text-sm"
              />
              <div className="flex gap-2">
                {(['urgent', 'high', 'normal', 'low'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewConvPriority(p)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      newConvPriority === p
                        ? priorityConfig[p].cls
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {priorityConfig[p].label}
                  </button>
                ))}
              </div>
              <Button
                size="sm"
                className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleCreateConversation}
                disabled={!newConvName.trim()}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Oluştur
              </Button>
            </div>
          )}

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageSquare className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-400">Görüşme bulunamadı</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversation?.id === conv.id;
                const prio = priorityConfig[conv.priority];
                const stat = statusConfig[conv.status];
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left p-4 border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                      isActive ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? 'text-emerald-800' : 'text-slate-800'}`}>
                            {conv.customerName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${prio.dotCls}`} />
                            <Badge className={`${stat.cls} text-[10px] px-1.5 py-0 h-4 gap-0.5`}>
                              {stat.icon} {stat.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-[11px] text-slate-400">{formatTime(conv.lastMessageTime)}</span>
                        {conv.unreadCount > 0 && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-1.5 pl-10">
                      {conv.lastMessage}
                    </p>
                    {conv.assignedTo && (
                      <p className="text-[10px] text-slate-400 mt-1 pl-10 flex items-center gap-1">
                        <Pin className="h-2.5 w-2.5" /> {conv.assignedTo}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ====== RIGHT PANEL: Active Conversation ====== */}
        <div className="flex-1 bg-white flex flex-col">
          {!activeConversation ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <MessageCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Bir görüşme seçin veya yeni görüşme başlatın
              </h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Sol panelden bir müşteri görüşmesi seçerek mesajlaşmaya başlayabilirsiniz.
                &quot;Yeni Görüşme&quot; butonuyla yeni bir görüşme oluşturun.
              </p>
              <Button
                className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setShowNewConversationForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Görüşme Başlat
              </Button>
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-800">{activeConversation.customerName}</h3>
                      <Badge className={`${statusConfig[activeConversation.status].cls} text-[10px] px-1.5 py-0 h-4 gap-0.5`}>
                        {statusConfig[activeConversation.status].icon}
                        {statusConfig[activeConversation.status].label}
                      </Badge>
                      <Badge className={`${priorityConfig[activeConversation.priority].cls} text-[10px] px-1.5 py-0 h-4`}>
                        {priorityConfig[activeConversation.priority].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {activeConversation.customerEmail || 'e-posta yok'}
                      </span>
                      {activeConversation.assignedTo && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Pin className="h-3 w-3" /> {activeConversation.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Assign Button */}
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => setShowAssignMenu(!showAssignMenu)}
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1" />
                      Ata
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                    {showAssignMenu && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1">
                        <p className="px-3 py-1.5 text-xs text-slate-400 font-medium">Destek Ekibi</p>
                        {['Ahmet Y.', 'Elif K.', 'Mehmet S.', 'Zeynep A.'].map((agent) => (
                          <button
                            key={agent}
                            onClick={() => handleAssignConversation(agent)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                <User className="h-3 w-3 text-emerald-600" />
                              </div>
                              {agent}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Close Button */}
                  {activeConversation.status !== 'closed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleCloseConversation}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Kapat
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-slate-400">Mesajlar yükleniyor...</span>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Sparkles className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">Henüz mesaj yok. İlk mesajı gönderin!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies + Input Area */}
              <div className="border-t border-slate-200 p-4 bg-white">
                {/* Quick Replies Row */}
                <div className="relative mb-3" ref={quickRepliesRef}>
                  <button
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Hızlı Yanıt
                    <ChevronDown className={`h-3 w-3 transition-transform ${showQuickReplies ? 'rotate-180' : ''}`} />
                  </button>
                  {showQuickReplies && (
                    <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-2">
                      <p className="px-3 py-1.5 text-xs text-slate-400 font-medium">Hızlı Yanıt Şablonları</p>
                      {quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickReply(qr)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                            <span>{qr}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="flex items-center gap-2">
                  <Input
                    ref={messageInputRef}
                    placeholder="Mesajınızı yazın..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={activeConversation.status === 'closed' || sendingMessage}
                    className="flex-1 h-10 text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || activeConversation.status === 'closed' || sendingMessage}
                    className="h-10 w-10 p-0 bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
                  >
                    {sendingMessage ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {activeConversation.status === 'closed' && (
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Bu görüşme kapatılmıştır. Yeni mesaj gönderemezsiniz.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Message Bubble Sub-component                                       */
/* ------------------------------------------------------------------ */

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.sender === 'system') {
    return (
      <div className="flex justify-center">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 max-w-md">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Bot className="h-3 w-3 text-amber-500" />
            <span className="text-[11px] font-medium text-amber-600">{message.senderName}</span>
            <span className="text-[10px] text-amber-400">{formatMessageTime(message.timestamp)}</span>
          </div>
          <p className="text-xs text-amber-800">{message.content}</p>
        </div>
      </div>
    );
  }

  const isAgent = message.sender === 'agent';

  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] sm:max-w-[60%] ${isAgent ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center gap-1.5 mb-1 px-1">
          {isAgent ? (
            <>
              <span className="text-[10px] text-slate-400">{formatMessageTime(message.timestamp)}</span>
              <span className="text-[11px] font-medium text-emerald-600">{message.senderName}</span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-medium text-slate-600">{message.senderName}</span>
              <span className="text-[10px] text-slate-400">{formatMessageTime(message.timestamp)}</span>
            </>
          )}
        </div>
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isAgent
              ? 'bg-emerald-600 text-white rounded-br-md'
              : 'bg-slate-200 text-slate-800 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo Data (fallback when API is unavailable)                       */
/* ------------------------------------------------------------------ */

function getDemoConversations(): Conversation[] {
  return [
    {
      id: 'conv-1',
      customerName: 'Ayşe Yılmaz',
      customerEmail: 'ayse@email.com',
      lastMessage: 'Siparişimin durumu hakkında bilgi alabilir miyim?',
      lastMessageTime: new Date(Date.now() - 120000).toISOString(),
      status: 'active',
      priority: 'high',
      unreadCount: 3,
      assignedTo: 'Ahmet Y.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'conv-2',
      customerName: 'Mehmet Kaya',
      customerEmail: 'mehmet@email.com',
      lastMessage: 'Ürünü iade etmek istiyorum, kargoyu nasıl oluştururum?',
      lastMessageTime: new Date(Date.now() - 600000).toISOString(),
      status: 'active',
      priority: 'urgent',
      unreadCount: 1,
      assignedTo: null,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'conv-3',
      customerName: 'Fatma Demir',
      customerEmail: 'fatma@email.com',
      lastMessage: 'Teşekkür ederim, sorun çözüldü.',
      lastMessageTime: new Date(Date.now() - 1800000).toISOString(),
      status: 'waiting',
      priority: 'normal',
      unreadCount: 0,
      assignedTo: null,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'conv-4',
      customerName: 'Ali Öztürk',
      customerEmail: 'ali@email.com',
      lastMessage: 'Farklı renk seçeneği var mı?',
      lastMessageTime: new Date(Date.now() - 5400000).toISOString(),
      status: 'active',
      priority: 'normal',
      unreadCount: 2,
      assignedTo: 'Elif K.',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: 'conv-5',
      customerName: 'Zeynep Arslan',
      customerEmail: 'zeynep@email.com',
      lastMessage: 'Kargo takip numaramı öğrenebilir miyim?',
      lastMessageTime: new Date(Date.now() - 10800000).toISOString(),
      status: 'waiting',
      priority: 'low',
      unreadCount: 0,
      assignedTo: null,
      createdAt: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 'conv-6',
      customerName: 'Burak Şahin',
      customerEmail: 'burak@email.com',
      lastMessage: 'Ödeme sorunu yaşıyorum, kartım kabul edilmiyor.',
      lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
      status: 'closed',
      priority: 'high',
      unreadCount: 0,
      assignedTo: 'Mehmet S.',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'conv-7',
      customerName: 'Elif Çelik',
      customerEmail: 'elif@email.com',
      lastMessage: 'İndirim kuponumu kullanamıyorum.',
      lastMessageTime: new Date(Date.now() - 90000000).toISOString(),
      status: 'closed',
      priority: 'normal',
      unreadCount: 0,
      assignedTo: null,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: 'conv-8',
      customerName: 'Hasan Yıldız',
      customerEmail: 'hasan@email.com',
      lastMessage: 'Toplu sipariş için özel fiyat alabilir miyim?',
      lastMessageTime: new Date(Date.now() - 300000).toISOString(),
      status: 'active',
      priority: 'low',
      unreadCount: 1,
      assignedTo: null,
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
  ];
}

function getDemoStats(): ChatStats {
  return {
    totalConversations: 248,
    activeConversations: 4,
    answeredToday: 32,
    avgResponseTime: '2.4 dk',
  };
}

function getDemoMessages(convId: string): ChatMessage[] {
  const now = new Date();
  const base = [
    {
      id: `${convId}-sys-1`,
      conversationId: convId,
      sender: 'system' as const,
      senderName: 'Sistem',
      content: 'Yeni görüşme başlatıldı.',
      timestamp: new Date(now.getTime() - 600000).toISOString(),
    },
    {
      id: `${convId}-cust-1`,
      conversationId: convId,
      sender: 'customer' as const,
      senderName: 'Müşteri',
      content: 'Merhaba, siparişimle ilgili bir sorun yaşıyorum.',
      timestamp: new Date(now.getTime() - 540000).toISOString(),
    },
    {
      id: `${convId}-agent-1`,
      conversationId: convId,
      sender: 'agent' as const,
      senderName: 'Destek Ekibi',
      content: 'Merhaba! Size nasıl yardımcı olabilirim? Sipariş numaranızı paylaşır mısınız?',
      timestamp: new Date(now.getTime() - 480000).toISOString(),
    },
    {
      id: `${convId}-cust-2`,
      conversationId: convId,
      sender: 'customer' as const,
      senderName: 'Müşteri',
      content: 'Sipariş numaram PZR-2024-78542. Ürün hasarlı geldi, iade yapmak istiyorum.',
      timestamp: new Date(now.getTime() - 420000).toISOString(),
    },
    {
      id: `${convId}-agent-2`,
      conversationId: convId,
      sender: 'agent' as const,
      senderName: 'Destek Ekibi',
      content: 'Siparişiniz inceleniyor... Kısa süre içinde size iade süreciyle ilgili detaylı bilgi vereceğim.',
      timestamp: new Date(now.getTime() - 360000).toISOString(),
    },
    {
      id: `${convId}-sys-2`,
      conversationId: convId,
      sender: 'system' as const,
      senderName: 'Sistem',
      content: 'Görüşme Destek Ekibi tarafından devralındı.',
      timestamp: new Date(now.getTime() - 300000).toISOString(),
    },
    {
      id: `${convId}-cust-3`,
      conversationId: convId,
      sender: 'customer' as const,
      senderName: 'Müşteri',
      content: 'Ne zaman dönüş yapılabilir? Aciliyeti var çünkü.',
      timestamp: new Date(now.getTime() - 120000).toISOString(),
    },
  ];

  if (convId === 'conv-1') {
    return [
      ...base.slice(0, 3),
      {
        id: `${convId}-cust-4`,
        conversationId: convId,
        sender: 'customer' as const,
        senderName: 'Ayşe Yılmaz',
        content: 'Siparişimin durumu hakkında bilgi alabilir miyim?',
        timestamp: new Date(now.getTime() - 60000).toISOString(),
      },
    ];
  }

  if (convId === 'conv-2') {
    return [
      ...base.slice(0, 2),
      {
        id: `${convId}-cust-5`,
        conversationId: convId,
        sender: 'customer' as const,
        senderName: 'Mehmet Kaya',
        content: 'Ürünü iade etmek istiyorum, kargoyu nasıl oluştururum?',
        timestamp: new Date(now.getTime() - 30000).toISOString(),
      },
    ];
  }

  return base;
}
