import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ------------------------------------------------------------------ */
/*  Seed demo conversations & messages if DB is completely empty       */
/* ------------------------------------------------------------------ */
async function seedDemoIfEmpty() {
  const count = await db.chatConversation.count();
  if (count > 0) return;

  const now = new Date();

  const conv1 = await db.chatConversation.create({
    data: {
      customerName: 'Ayşe Yılmaz',
      customerEmail: 'ayse@email.com',
      subject: 'Sipariş durumu sorgulama',
      status: 'active',
      priority: 'high',
      assignedTo: 'Ahmet Y.',
    },
  });

  const conv2 = await db.chatConversation.create({
    data: {
      customerName: 'Mehmet Kaya',
      customerEmail: 'mehmet@email.com',
      subject: 'İade talebi',
      status: 'active',
      priority: 'urgent',
    },
  });

  const conv3 = await db.chatConversation.create({
    data: {
      customerName: 'Fatma Demir',
      customerEmail: 'fatma@email.com',
      subject: 'Teşekkür',
      status: 'waiting',
      priority: 'normal',
    },
  });

  const conv4 = await db.chatConversation.create({
    data: {
      customerName: 'Ali Öztürk',
      customerEmail: 'ali@email.com',
      subject: 'Renk seçeneği',
      status: 'active',
      priority: 'normal',
      assignedTo: 'Elif K.',
    },
  });

  const conv5 = await db.chatConversation.create({
    data: {
      customerName: 'Burak Şahin',
      customerEmail: 'burak@email.com',
      subject: 'Ödeme sorunu',
      status: 'closed',
      priority: 'high',
      assignedTo: 'Mehmet S.',
    },
  });

  const t = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60000).toISOString();

  // Conversation 1 messages
  await db.chatMessage.createMany({
    data: [
      { conversationId: conv1.id, sender: 'system', senderName: 'Sistem', content: 'Yeni görüşme başladı.', type: 'system', isRead: true, createdAt: new Date(t(55)) },
      { conversationId: conv1.id, sender: 'customer', senderName: 'Ayşe Yılmaz', content: 'Merhaba, siparişimin durumu hakkında bilgi alabilir miyim? Sipariş no: #12345', type: 'text', isRead: false, createdAt: new Date(t(50)) },
      { conversationId: conv1.id, sender: 'customer', senderName: 'Ayşe Yılmaz', content: '3 gündür kargoya verilmediğini görüyorum.', type: 'text', isRead: false, createdAt: new Date(t(45)) },
      { conversationId: conv1.id, sender: 'agent', senderName: 'Ahmet Y.', content: 'Merhaba Ayşe Hanım, siparişinizi inceliyorum. Bir dakika lütfen.', type: 'text', isRead: true, createdAt: new Date(t(40)) },
      { conversationId: conv1.id, sender: 'customer', senderName: 'Ayşe Yılmaz', content: 'Siparişimin durumu hakkında bilgi alabilir miyim?', type: 'text', isRead: false, createdAt: new Date(t(5)) },
    ],
  });

  // Conversation 2 messages
  await db.chatMessage.createMany({
    data: [
      { conversationId: conv2.id, sender: 'system', senderName: 'Sistem', content: 'Yeni görüşme başladı.', type: 'system', isRead: true, createdAt: new Date(t(30)) },
      { conversationId: conv2.id, sender: 'customer', senderName: 'Mehmet Kaya', content: 'Ürünü iade etmek istiyorum, kargoyu nasıl oluştururum?', type: 'text', isRead: false, createdAt: new Date(t(25)) },
    ],
  });

  // Conversation 3 messages
  await db.chatMessage.createMany({
    data: [
      { conversationId: conv3.id, sender: 'system', senderName: 'Sistem', content: 'Yeni görüşme başladı.', type: 'system', isRead: true, createdAt: new Date(t(120)) },
      { conversationId: conv3.id, sender: 'customer', senderName: 'Fatma Demir', content: 'Sorunum çözüldü, teşekkür ederim!', type: 'text', isRead: true, createdAt: new Date(t(100)) },
      { conversationId: conv3.id, sender: 'agent', senderName: 'Destek Ekibi', content: 'Rica ederiz Fatma Hanım, iyi günler dileriz!', type: 'text', isRead: true, createdAt: new Date(t(95)) },
      { conversationId: conv3.id, sender: 'customer', senderName: 'Fatma Demir', content: 'Teşekkür ederim, sorun çözüldü.', type: 'text', isRead: true, createdAt: new Date(t(90)) },
    ],
  });

  // Conversation 4 messages
  await db.chatMessage.createMany({
    data: [
      { conversationId: conv4.id, sender: 'system', senderName: 'Sistem', content: 'Yeni görüşme başladı.', type: 'system', isRead: true, createdAt: new Date(t(180)) },
      { conversationId: conv4.id, sender: 'customer', senderName: 'Ali Öztürk', content: 'Bu ürünün farklı renk seçeneği var mı?', type: 'text', isRead: false, createdAt: new Date(t(170)) },
      { conversationId: conv4.id, sender: 'agent', senderName: 'Elif K.', content: 'Merhaba, şu an stokta mavi ve siyah renkleri mevcuttur.', type: 'text', isRead: true, createdAt: new Date(t(160)) },
      { conversationId: conv4.id, sender: 'customer', senderName: 'Ali Öztürk', content: 'Farklı renk seçeneği var mı?', type: 'text', isRead: false, createdAt: new Date(t(5)) },
    ],
  });

  // Conversation 5 messages
  await db.chatMessage.createMany({
    data: [
      { conversationId: conv5.id, sender: 'system', senderName: 'Sistem', content: 'Yeni görüşme başladı.', type: 'system', isRead: true, createdAt: new Date(t(1440)) },
      { conversationId: conv5.id, sender: 'customer', senderName: 'Burak Şahin', content: 'Ödeme sorunu yaşıyorum, kartım kabul edilmiyor.', type: 'text', isRead: true, createdAt: new Date(t(1430)) },
      { conversationId: conv5.id, sender: 'agent', senderName: 'Mehmet S.', content: 'Farklı bir kartla deneyebilir misiniz?', type: 'text', isRead: true, createdAt: new Date(t(1420)) },
      { conversationId: conv5.id, sender: 'customer', senderName: 'Burak Şahin', content: 'Olmadı, başka bir yöntem var mı?', type: 'text', isRead: true, createdAt: new Date(t(1410)) },
      { conversationId: conv5.id, sender: 'agent', senderName: 'Mehmet S.', content: 'Havale/EFT seçeneğini deneyebilirsiniz.', type: 'text', isRead: true, createdAt: new Date(t(1400)) },
      { conversationId: conv5.id, sender: 'system', senderName: 'Sistem', content: 'Görüşme kapatıldı.', type: 'system', isRead: true, createdAt: new Date(t(1390)) },
    ],
  });
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function mapConversation(conv: {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  priority: string;
  assignedTo: string;
  updatedAt: Date;
  createdAt: Date;
  messages: Array<{ content: string; sender: string; createdAt: Date }>;
  _count: { messages: number };
}) {
  const lastMsg = Array.isArray(conv.messages) && conv.messages.length > 0 ? conv.messages[0] : null;
  return {
    id: conv.id,
    customerName: conv.customerName || 'Bilinmeyen Müşteri',
    customerEmail: conv.customerEmail || '',
    lastMessage: lastMsg ? lastMsg.content : 'Henüz mesaj yok',
    lastMessageTime: lastMsg ? lastMsg.createdAt.toISOString() : conv.updatedAt.toISOString(),
    status: conv.status || 'active',
    priority: conv.priority || 'normal',
    unreadCount: 0, // computed separately if needed
    assignedTo: conv.assignedTo || null,
    createdAt: conv.createdAt.toISOString(),
  };
}

function mapMessage(msg: {
  id: string;
  conversationId: string;
  sender: string;
  senderName: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}) {
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    sender: msg.sender || 'customer',
    senderName: msg.senderName || (msg.sender === 'agent' ? 'Destek Ekibi' : msg.sender === 'system' ? 'Sistem' : 'Müşteri'),
    content: msg.content,
    timestamp: msg.createdAt.toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/*  GET handler – list conversations with stats                        */
/* ------------------------------------------------------------------ */

export async function GET(req: Request) {
  try {
    // Seed demo data if DB is empty
    await seedDemoIfEmpty();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const where: Record<string, unknown> = {};

    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { subject: { contains: search } },
      ];
    }

    const conversations = await db.chatConversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, sender: true, createdAt: true },
        },
      },
    });

    // Compute unread counts per conversation
    const unreadCounts = await db.chatMessage.groupBy({
      by: ['conversationId'],
      where: { isRead: false, sender: { not: 'agent' } },
      _count: { id: true },
    });

    const unreadMap: Record<string, number> = {};
    if (Array.isArray(unreadCounts)) {
      for (const item of unreadCounts) {
        unreadMap[item.conversationId] = item._count.id;
      }
    }

    const mappedConversations = Array.isArray(conversations)
      ? conversations.map((conv) => ({
          ...mapConversation(conv as unknown as Parameters<typeof mapConversation>[0]),
          unreadCount: unreadMap[conv.id] || 0,
        }))
      : [];

    // Stats
    const totalCount = await db.chatConversation.count();
    const activeCount = await db.chatConversation.count({ where: { status: 'active' } });
    const answeredToday = await db.chatMessage.count({
      where: {
        sender: 'agent',
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const stats = {
      totalConversations: totalCount,
      activeConversations: activeCount,
      answeredToday,
      avgResponseTime: '2.4 dk',
    };

    return NextResponse.json({
      conversations: mappedConversations,
      stats,
    });
  } catch (error) {
    console.error('[GET /api/live-chat]', error);
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST handler – actions: create-conversation, send-message, etc.    */
/* ------------------------------------------------------------------ */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      /* ---- Create a new conversation ---- */
      case 'create-conversation': {
        const conversation = await db.chatConversation.create({
          data: {
            customerName: body.customerName || '',
            customerEmail: body.customerEmail || '',
            subject: body.subject || '',
            priority: body.priority || 'normal',
            channel: body.channel || 'widget',
            storeId: body.storeId || 'default',
          },
        });

        // Create a system message
        await db.chatMessage.create({
          data: {
            conversationId: conversation.id,
            sender: 'system',
            senderName: 'Sistem',
            content: 'Görüşme oluşturuldu.',
            type: 'system',
            isRead: true,
          },
        });

        return NextResponse.json({
          id: conversation.id,
          customerName: conversation.customerName,
          customerEmail: conversation.customerEmail,
          status: conversation.status,
          priority: conversation.priority,
          assignedTo: conversation.assignedTo || null,
          createdAt: conversation.createdAt,
        }, { status: 201 });
      }

      /* ---- Send a message ---- */
      case 'send-message': {
        const { conversationId, sender, senderName, content, type } = body;
        if (!conversationId || !content) {
          return NextResponse.json({ error: 'conversationId and content are required' }, { status: 400 });
        }

        const message = await db.chatMessage.create({
          data: {
            conversationId,
            sender: sender || 'customer',
            senderName: senderName || '',
            content,
            type: type || 'text',
            storeId: body.storeId || 'default',
          },
        });

        // Update conversation timestamp
        await db.chatConversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        return NextResponse.json(mapMessage(message as unknown as Parameters<typeof mapMessage>[0]), { status: 201 });
      }

      /* ---- Close a conversation ---- */
      case 'close-conversation': {
        const { conversationId } = body;
        if (!conversationId) {
          return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
        }

        const conversation = await db.chatConversation.update({
          where: { id: conversationId },
          data: { status: 'closed' },
        });

        // Add system message
        await db.chatMessage.create({
          data: {
            conversationId,
            sender: 'system',
            senderName: 'Sistem',
            content: 'Görüşme kapatıldı.',
            type: 'system',
            isRead: true,
          },
        });

        return NextResponse.json({
          id: conversation.id,
          status: conversation.status,
        });
      }

      /* ---- Assign a conversation ---- */
      case 'assign-conversation': {
        const { conversationId, assignedTo } = body;
        if (!conversationId) {
          return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
        }

        const conversation = await db.chatConversation.update({
          where: { id: conversationId },
          data: { assignedTo: assignedTo || '' },
        });

        return NextResponse.json({
          id: conversation.id,
          assignedTo: conversation.assignedTo || null,
        });
      }

      /* ---- Get messages for a conversation ---- */
      case 'get-messages': {
        const { conversationId, limit, offset } = body;
        if (!conversationId) {
          return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
        }

        const take = limit ? Math.min(Math.max(Number(limit), 1), 100) : 50;
        const skip = offset ? Math.max(Number(offset), 0) : 0;

        const conversation = await db.chatConversation.findUnique({
          where: { id: conversationId },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              take,
              skip,
            },
          },
        });

        if (!conversation) {
          return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const msgs = Array.isArray(conversation.messages)
          ? conversation.messages.map((m) => mapMessage(m as unknown as Parameters<typeof mapMessage>[0]))
          : [];

        // Mark unread customer messages as read
        await db.chatMessage.updateMany({
          where: {
            conversationId,
            isRead: false,
            sender: { not: 'agent' },
          },
          data: { isRead: true },
        });

        return NextResponse.json({
          messages: msgs,
          conversation: {
            id: conversation.id,
            customerName: conversation.customerName,
            customerEmail: conversation.customerEmail,
            status: conversation.status,
            priority: conversation.priority,
            assignedTo: conversation.assignedTo || null,
          },
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error(`[POST /api/live-chat]`, error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
