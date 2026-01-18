import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Search, Plus } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'booking_proposal' | 'contract';
}

interface Conversation {
  id: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'archived' | 'blocked';
  messages: Message[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    artistId: 'artist1',
    artistName: 'The Jazz Quartet',
    artistAvatar: '🎵',
    lastMessage: 'Sounds great! Can we confirm the date?',
    lastMessageTime: new Date(Date.now() - 3600000),
    unreadCount: 2,
    status: 'active',
    messages: [
      {
        id: '1',
        senderId: 'artist1',
        senderName: 'The Jazz Quartet',
        senderAvatar: '🎵',
        content: 'Hi! We are interested in performing at your venue.',
        timestamp: new Date(Date.now() - 86400000),
        read: true,
        type: 'text',
      },
      {
        id: '2',
        senderId: 'user1',
        senderName: 'You',
        senderAvatar: '🏢',
        content: 'Great! What dates work for you?',
        timestamp: new Date(Date.now() - 82800000),
        read: true,
        type: 'text',
      },
      {
        id: '3',
        senderId: 'artist1',
        senderName: 'The Jazz Quartet',
        senderAvatar: '🎵',
        content: 'We are available next month. How about March 15th?',
        timestamp: new Date(Date.now() - 7200000),
        read: true,
        type: 'booking_proposal',
      },
      {
        id: '4',
        senderId: 'artist1',
        senderName: 'The Jazz Quartet',
        senderAvatar: '🎵',
        content: 'Sounds great! Can we confirm the date?',
        timestamp: new Date(Date.now() - 3600000),
        read: false,
        type: 'text',
      },
    ],
  },
  {
    id: '2',
    artistId: 'artist2',
    artistName: 'Electric Dreams',
    artistAvatar: '⚡',
    lastMessage: 'Contract looks good. Ready to sign.',
    lastMessageTime: new Date(Date.now() - 7200000),
    unreadCount: 0,
    status: 'active',
    messages: [],
  },
  {
    id: '3',
    artistId: 'artist3',
    artistName: 'Acoustic Vibes',
    artistAvatar: '🎸',
    lastMessage: 'What is your budget for this event?',
    lastMessageTime: new Date(Date.now() - 172800000),
    unreadCount: 1,
    status: 'active',
    messages: [],
  },
];

export default function VenueMessages() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(MOCK_CONVERSATIONS[0]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'user1',
      senderName: 'You',
      senderAvatar: '🏢',
      content: messageInput,
      timestamp: new Date(),
      read: true,
      type: 'text',
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: messageInput,
              lastMessageTime: new Date(),
            }
          : conv
      )
    );

    setSelectedConversation((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, newMessage],
            lastMessage: messageInput,
            lastMessageTime: new Date(),
          }
        : null
    );

    setMessageInput('');
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`w-full px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50 transition ${
                selectedConversation?.id === conversation.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{conversation.artistAvatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 truncate">{conversation.artistName}</p>
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-0.5">{conversation.lastMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatTime(conversation.lastMessageTime)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* New Conversation Button */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            <Plus size={20} />
            New Message
          </button>
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedConversation.artistAvatar}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedConversation.artistName}</h3>
                <p className="text-sm text-gray-600">Active now</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition">
                <Phone size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition">
                <Video size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {selectedConversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === 'user1' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.senderId === 'user1'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {message.type === 'booking_proposal' ? (
                    <div className="space-y-2">
                      <p className="font-semibold">Booking Proposal</p>
                      <p className="text-sm">{message.content}</p>
                      <button className="mt-2 px-3 py-1 bg-white text-purple-600 rounded text-sm font-medium hover:bg-gray-100 transition">
                        View Details
                      </button>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <p className={`text-xs mt-1 ${message.senderId === 'user1' ? 'text-purple-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
