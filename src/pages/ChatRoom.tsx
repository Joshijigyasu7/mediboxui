import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import {
  ArrowLeft,
  CircleDot,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";

const socket: Socket = io("http://localhost:3000");

interface User {
  id: number;
  name: string;
  role: string;
}

interface Message {
  id: number;
  senderId: number;
  consultationId: number;
  message: string;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    role: string;
  };
}

interface Consultation {
  id: number;
  status: string;
  patient: {
    id: number;
    name: string;
  };
  doctor: {
    id: number;
    name: string;
  };
}

function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refreshChat = async () => {
    if (!id) return;

    try {
      const [profileRes, consultationRes, messageRes] = await Promise.all([
        api.get("/auth/profile"),
        api.get(`/consultations/${id}`),
        api.get(`/consultations/${id}/messages?limit=100`),
      ]);

      setCurrentUser(profileRes.data.data);
      setConsultation(consultationRes.data.data);
      setMessages(messageRes.data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadEverything = async () => {
      setLoading(true);
      await refreshChat();
      setLoading(false);
    };

    loadEverything();

    if (id) {
      socket.emit("join-consultation", Number(id));
    }

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((item) => item.id === msg.id)) {
          return prev;
        }
        return [...prev, msg];
      });
    };

    socket.on("new-message", handleNewMessage);

    const handleAiSuggestions = (suggestions: string[]) => {
      console.log("AI Suggestions:", suggestions);
      setAiSuggestions(suggestions);
    };

    socket.on("ai-suggestions", handleAiSuggestions);
    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("ai-suggestions", handleAiSuggestions);
    };
  }, [id]);

  useEffect(() => {
    if (currentUser?.role === "DOCTOR" && currentUser?.id) {
      socket.emit("join-doctor", currentUser.id);
    }
  }, [currentUser?.id, currentUser?.role]);

  // Auto-refresh every 3 seconds
  useEffect(() => {
    if (!id) return;

    const interval = window.setInterval(() => {
      refreshChat();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !id || !consultation || consultation.status !== "ACTIVE") {
      return;
    }

    setIsSending(true);

    try {
      await api.post(`/consultations/${id}/messages`, { message: message.trim() });
      setMessage("");
      setAiSuggestions([]);
      await refreshChat();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const activateConsultation = async () => {
    if (!id) return;
    setIsActivating(true);

    try {
      await api.patch(`/consultations/${id}/status`, { status: "ACTIVE" });
      await refreshChat();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to activate consultation");
    } finally {
      setIsActivating(false);
    }
  };

  const endConsultation = async () => {
    if (!id || !currentUser) return;
    
    // Confirm with the doctor
    if (currentUser.role === "DOCTOR") {
      const confirmEnd = window.confirm(
        "Are you sure you want to end this consultation? This action cannot be undone."
      );
      if (!confirmEnd) return;
    }

    setIsEnding(true);

    try {
      await api.patch(`/consultations/${id}/status`, { status: "COMPLETED" });
      
      // Show success message
      alert("Consultation ended successfully!");
      
      // Navigate to dashboard
      navigate(currentUser.role === "DOCTOR" ? "/doctor" : "/patient");
    } catch (err: any) {
      alert(err.response?.data?.message || "Unable to end consultation");
      setIsEnding(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #eff6ff, #f8fafc)',
      padding: '12px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    loadingCard: {
      maxWidth: '400px',
      margin: '0 auto',
      padding: '40px 32px',
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: '28px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
      textAlign: 'center' as const,
      marginTop: '40px',
    },
    loadingIcon: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      backgroundColor: '#dbeafe',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
    },
    loadingTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1e293b',
      marginTop: '20px',
      marginBottom: '8px',
    },
    loadingSubtext: {
      color: '#64748b',
      fontSize: '14px',
      margin: 0,
    },
    pendingContainer: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '32px',
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: '32px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
      marginTop: '40px',
    },
    pendingHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
    },
    backBtn: {
      padding: '8px',
      borderRadius: '50%',
      border: '1px solid #e2e8f0',
      background: 'white',
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    statusBadge: {
      backgroundColor: '#fef3c7',
      color: '#d97706',
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '14px',
      fontWeight: '500',
    },
    pendingCard: {
      backgroundColor: '#0f172a',
      padding: '32px',
      borderRadius: '24px',
      color: 'white',
    },
    pendingCardIcon: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      padding: '12px',
      borderRadius: '50%',
      display: 'inline-block',
    },
    pendingCardTitle: {
      fontSize: '24px',
      fontWeight: '600',
      marginTop: '12px',
      marginBottom: '4px',
    },
    pendingCardSubtext: {
      color: '#94a3b8',
      fontSize: '14px',
      margin: 0,
    },
    infoBox: {
      marginTop: '24px',
      padding: '24px',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
    },
    infoBoxHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    infoBoxTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0,
    },
    refreshBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '9999px',
      border: '1px solid #cbd5e1',
      background: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: '#475569',
      transition: 'background 0.2s',
    },
    infoList: {
      marginTop: '16px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
    },
    infoItem: {
      display: 'flex',
      gap: '8px',
      fontSize: '14px',
      color: '#475569',
    },
    doctorActivateBtn: {
      width: '100%',
      marginTop: '24px',
      padding: '12px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    chatContainer: {
      maxWidth: '1280px',
      margin: '0 auto',
      height: 'calc(100vh - 24px)',
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: '32px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    },
    chatHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: 'rgba(255,255,255,0.8)',
    },
    chatHeaderLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    chatHeaderName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0,
    },
    chatHeaderStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#64748b',
    },
    statusDot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: '#10b981',
    },
    chatHeaderActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    headerRefreshBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '9999px',
      border: '1px solid #e2e8f0',
      background: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: '#475569',
      transition: 'background 0.2s',
    },
    endBtn: {
      padding: '8px 16px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '9999px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    endBtnDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
    },
    chatMessages: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '24px',
      background: 'linear-gradient(180deg, #f8fbff 0%, #f8fafc 100%)',
    },
    messagesContainer: {
      maxWidth: '768px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    secureBadge: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '16px',
    },
    secureBadgeInner: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#ecfdf5',
      padding: '8px 16px',
      borderRadius: '9999px',
      border: '1px solid #a7f3d0',
      fontSize: '14px',
      fontWeight: '500',
      color: '#065f46',
    },
    emptyState: {
      padding: '32px',
      borderRadius: '24px',
      border: '2px dashed #cbd5e1',
      backgroundColor: 'rgba(255,255,255,0.7)',
      textAlign: 'center' as const,
      color: '#64748b',
      fontSize: '14px',
    },
    messageWrapper: {
      display: 'flex',
      flexDirection: 'column' as const,
    },
    messageMine: {
      alignItems: 'flex-end',
    },
    messageOther: {
      alignItems: 'flex-start',
    },
    messageBubble: {
      maxWidth: '85%',
      padding: '12px 16px',
      borderRadius: '22px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    messageBubbleMine: {
      backgroundColor: '#2563eb',
      color: 'white',
    },
    messageBubbleOther: {
      backgroundColor: 'white',
      color: '#1e293b',
    },
    messageSender: {
      fontSize: '12px',
      fontWeight: '600',
      marginBottom: '4px',
    },
    messageSenderMine: {
      color: '#93c5fd',
    },
    messageSenderOther: {
      color: '#64748b',
    },
    messageText: {
      fontSize: '14px',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap' as const,
    },
    chatFooter: {
      padding: '12px 24px',
      borderTop: '1px solid #e2e8f0',
      backgroundColor: 'rgba(255,255,255,0.9)',
    },
    footerInner: {
      maxWidth: '768px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    messageInput: {
      flex: 1,
      padding: '12px 16px',
      borderRadius: '9999px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s',
    },
    sendBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px',
      borderRadius: '50%',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    sendBtnDisabled: {
      backgroundColor: '#cbd5e1',
      cursor: 'not-allowed',
    },
    spinner: {
      animation: 'spin 1s linear infinite',
    },
  };

  if (loading || !consultation || !currentUser) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          </div>
          <h1 style={styles.loadingTitle}>Preparing your consultation</h1>
          <p style={styles.loadingSubtext}>We are loading the chat room and patient details.</p>
        </div>
      </div>
    );
  }

  // COMPLETED STATE - Consultation has ended
  if (consultation.status === "COMPLETED") {
    return (
      <div style={styles.container}>
        <div style={styles.pendingContainer}>
          <div style={styles.pendingHeader}>
            <button
              onClick={() => navigate(currentUser.role === "DOCTOR" ? "/doctor" : "/patient")}
              style={styles.backBtn}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div style={{
              ...styles.statusBadge,
              backgroundColor: '#d1fae5',
              color: '#065f46',
            }}>
              <CheckCircle2 className="h-4 w-4 inline-block mr-1" />
              Completed
            </div>
          </div>

          <div style={{
            ...styles.pendingCard,
            background: 'linear-gradient(135deg, #065f46, #047857)',
          }}>
            <div style={styles.pendingCardIcon}>
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
            </div>
            <h2 style={styles.pendingCardTitle}>
              Consultation Completed
            </h2>
            <p style={styles.pendingCardSubtext}>
              This consultation has been successfully completed. 
              You can return to your dashboard to view other consultations.
            </p>
          </div>

          <button
            onClick={() => navigate(currentUser.role === "DOCTOR" ? "/doctor" : "/patient")}
            style={{
              ...styles.doctorActivateBtn,
              background: 'linear-gradient(135deg, #065f46, #047857)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #047857, #065f46)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #065f46, #047857)';
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // PENDING STATE - Patient waiting for doctor
  if (consultation.status === "PENDING") {
    const isDoctor = currentUser.role === "DOCTOR";

    return (
      <div style={styles.container}>
        <div style={styles.pendingContainer}>
          <div style={styles.pendingHeader}>
            <button
              onClick={() => navigate(isDoctor ? "/doctor" : "/patient")}
              style={styles.backBtn}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div style={styles.statusBadge}>
              {isDoctor ? "Pending Activation" : "Waiting for Doctor"}
            </div>
          </div>

          <div style={styles.pendingCard}>
            <div style={styles.pendingCardIcon}>
              <Sparkles className="h-6 w-6 text-sky-300" />
            </div>
            <h2 style={styles.pendingCardTitle}>
              {isDoctor 
                ? "Activate this consultation to start chatting" 
                : "Waiting for Doctor to Join"}
            </h2>
            <p style={styles.pendingCardSubtext}>
              {isDoctor
  ? "Once you activate the consultation, the room will open instantly for both sides."
  : `${consultation.doctor.name ? `Dr. ${consultation.doctor.name.replace(/^Dr\.?\s*/i, '').trim()}` : "Doctor"} will join the consultation shortly. Please wait...`}
            </p>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.infoBoxHeader}>
              <h3 style={styles.infoBoxTitle}>What happens next?</h3>
              <button
                onClick={() => refreshChat()}
                style={styles.refreshBtn}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <CircleDot className="h-4 w-4 text-sky-500" />
                <span>Describe symptoms clearly and keep the conversation focused.</span>
              </div>
              <div style={styles.infoItem}>
                <CircleDot className="h-4 w-4 text-sky-500" />
                <span>Avoid sharing sensitive information like OTPs, passwords, or payment details.</span>
              </div>
              <div style={styles.infoItem}>
                <CircleDot className="h-4 w-4 text-sky-500" />
                <span>Messages are encrypted and secure. The chat updates in real-time.</span>
              </div>
            </div>
          </div>

          {isDoctor && (
            <button
              onClick={activateConsultation}
              disabled={isActivating}
              style={{
                ...styles.doctorActivateBtn,
                opacity: isActivating ? 0.7 : 1,
                cursor: isActivating ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActivating) {
                  e.currentTarget.style.background = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActivating) {
                  e.currentTarget.style.background = '#2563eb';
                }
              }}
            >
              {isActivating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Activating...
                </>
              ) : (
                "Activate Consultation Now"
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ACTIVE STATE - Chat is live
  const otherUser = currentUser.role === "DOCTOR" ? consultation.patient : consultation.doctor;

  return (
    <div style={styles.container}>
      <div style={styles.chatContainer}>
        {/* Header */}
        <header style={styles.chatHeader}>
          <div style={styles.chatHeaderLeft}>
            <button
              onClick={() => navigate(currentUser.role === "DOCTOR" ? "/doctor" : "/patient")}
              style={styles.backBtn}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div style={styles.avatar}>
              <UserCircle2 className="h-7 w-7 text-white" />
            </div>

            <div>
              <h2 style={styles.chatHeaderName}>{otherUser.name}</h2>
              <div style={styles.chatHeaderStatus}>
                <span style={styles.statusDot} />
                Live now
              </div>
            </div>
          </div>

          <div style={styles.chatHeaderActions}>
            <button
              onClick={() => {
                setIsRefreshing(true);
                refreshChat().finally(() => setIsRefreshing(false));
              }}
              style={styles.headerRefreshBtn}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            {currentUser.role === "DOCTOR" && consultation.status === "ACTIVE" && (
              <button
                onClick={endConsultation}
                disabled={isEnding}
                style={{
                  ...styles.endBtn,
                  ...(isEnding ? styles.endBtnDisabled : {}),
                }}
                onMouseEnter={(e) => {
                  if (!isEnding) {
                    e.currentTarget.style.background = '#dc2626';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isEnding) {
                    e.currentTarget.style.background = '#ef4444';
                  }
                }}
              >
                {isEnding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ending...
                  </>
                ) : (
                  "End Consultation"
                )}
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <main style={styles.chatMessages}>
          <div style={styles.messagesContainer}>
            <div style={styles.secureBadge}>
              <div style={styles.secureBadgeInner}>
                <ShieldCheck className="h-4 w-4" />
                Secure and instant consultation chat
              </div>
            </div>

            {messages.length === 0 ? (
              <div style={styles.emptyState}>
                No messages yet. Start the conversation with a clear question or update.
              </div>
            ) : (
              messages.map((msg) => {
                const mine = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    style={{
                      ...styles.messageWrapper,
                      ...(mine ? styles.messageMine : styles.messageOther),
                    }}
                  >
                    <div
                      style={{
                        ...styles.messageBubble,
                        ...(mine ? styles.messageBubbleMine : styles.messageBubbleOther),
                      }}
                    >
                      <div
                        style={{
                          ...styles.messageSender,
                          ...(mine ? styles.messageSenderMine : styles.messageSenderOther),
                        }}
                      >
                        {mine ? "You" : msg.sender?.name}
                      </div>
                      <div style={styles.messageText}>{msg.message}</div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
        
        {/* 🤖 AI Suggestions */}
{currentUser.role === "DOCTOR" &&
 aiSuggestions.length > 0 && (

<div
style={{
    maxWidth: "768px",
    margin: "10px auto",
    padding: "14px",
    background: "#eef6ff",
    borderRadius: "12px",
    border: "1px solid #bfdbfe"
}}
>

<h4
style={{
    marginBottom: "10px",
    color: "#1d4ed8"
}}
>
🤖 AI Suggested Replies
</h4>

<div
style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "10px"
}}
>

{aiSuggestions.map((reply,index)=>(

<button

key={index}

onClick={()=>setMessage(reply)}

style={{
padding:"10px 14px",
borderRadius:"20px",
border:"1px solid #93c5fd",
background:"white",
cursor:"pointer"
}}

>

{reply}

</button>

))}

</div>

</div>

)}


        {/* Input - Only show if consultation is active */}
        {consultation.status === "ACTIVE" && (
          
          <footer style={styles.chatFooter}>
            <div style={styles.footerInner}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                style={styles.messageInput}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.background = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = '#f8fafc';
                }}
                disabled={consultation.status !== "ACTIVE"}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || isSending || consultation.status !== "ACTIVE"}
                style={{
                  ...styles.sendBtn,
                  ...(!message.trim() || isSending || consultation.status !== "ACTIVE" ? styles.sendBtnDisabled : {}),
                }}
                onMouseEnter={(e) => {
                  if (message.trim() && !isSending && consultation.status === "ACTIVE") {
                    e.currentTarget.style.background = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (message.trim() && !isSending && consultation.status === "ACTIVE") {
                    e.currentTarget.style.background = '#2563eb';
                  }
                }}
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </footer>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ChatRoom;