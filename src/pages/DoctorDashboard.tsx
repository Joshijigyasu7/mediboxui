import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  User,
  LogOut,
  Clock3,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import api from "../services/api";

const socket: Socket = io(import.meta.env.VITE_SOCKET_URL);

interface Profile {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Consultation {
  id: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED";
  patient: {
    id: number;
    name: string;
  };
  doctor: {
    id: number;
    name: string;
  };
}

function DoctorDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  // Socket connection for real-time updates
  useEffect(() => {
    if (profile?.id) {
      socket.emit("join-doctor", profile.id);

      socket.on("consultation-request", (data: { patientName: string; consultationId: number }) => {
        alert(`${data.patientName} wants to consult you.`);
        loadDashboard();
      });

      return () => {
        socket.off("consultation-request");
      };
    }
  }, [profile?.id]);

  const loadDashboard = async () => {
    try {
      const profileRes = await api.get("/auth/profile");
      setProfile(profileRes.data.data);

      const consultationRes = await api.get("/consultations");
      setConsultations(consultationRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const activateConsultation = async (id: number) => {
    try {
      await api.patch(`/consultations/${id}/status`, {
        status: "ACTIVE",
      });
      loadDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to activate consultation");
    }
  };

  const pending = consultations.filter((c) => c.status === "PENDING").length;
  const active = consultations.filter((c) => c.status === "ACTIVE").length;
  const completed = consultations.filter((c) => c.status === "COMPLETED").length;

  // Helper function to format doctor name
  const formatDoctorName = (name: string) => 
    name ? `Dr. ${name.replace(/^Dr\.?\s*/i, '').trim()}` : "Doctor";

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    navbar: {
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    navbarContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    brand: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logo: {
      backgroundColor: '#2563eb',
      padding: '12px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandText: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#2563eb',
      margin: 0,
    },
    brandSubtext: {
      fontSize: '14px',
      color: '#64748b',
      margin: 0,
    },
    logoutBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      transition: 'background-color 0.2s',
    },
    mainContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '24px',
    },
    welcomeCard: {
      background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
      borderRadius: '24px',
      padding: '32px',
      color: 'white',
      boxShadow: '0 20px 60px rgba(37, 99, 235, 0.3)',
    },
    welcomeTitle: {
      fontSize: '36px',
      fontWeight: '700',
      margin: 0,
    },
    welcomeSubtext: {
      color: '#bfdbfe',
      marginTop: '8px',
      marginBottom: 0,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '20px',
      marginTop: '32px',
    },
    statCard: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '16px',
      padding: '20px',
      backdropFilter: 'blur(10px)',
    },
    statRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    statLabel: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.8)',
      margin: 0,
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      margin: 0,
    },
    sectionTitle: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      marginTop: '40px',
      marginBottom: '24px',
    },
    consultationsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '24px',
    },
    consultationCard: {
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      padding: '24px',
      transition: 'all 0.3s',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    patientInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    avatar: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      backgroundColor: '#dbeafe',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    patientName: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0,
    },
    consultationId: {
      color: '#64748b',
      margin: 0,
    },
    statusBadge: {
      padding: '8px 16px',
      borderRadius: '9999px',
      fontSize: '14px',
      fontWeight: '600',
    },
    statusPending: {
      backgroundColor: '#fef3c7',
      color: '#d97706',
    },
    statusActive: {
      backgroundColor: '#d1fae5',
      color: '#059669',
    },
    statusCompleted: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
    },
    buttonGroup: {
      display: 'flex',
      gap: '16px',
      marginTop: '32px',
    },
    primaryBtn: {
      flex: 1,
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    successBtn: {
      flex: 1,
      backgroundColor: '#059669',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    disabledBtn: {
      flex: 1,
      backgroundColor: '#d1d5db',
      color: '#6b7280',
      border: 'none',
      padding: '12px',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '16px',
      cursor: 'not-allowed',
    },
    emptyState: {
      gridColumn: '1 / -1',
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '40px',
      textAlign: 'center' as const,
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    },
    emptyTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#374151',
      margin: 0,
    },
    emptySubtext: {
      color: '#6b7280',
      marginTop: '8px',
      marginBottom: 0,
    },
    loadingContainer: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '24px',
      fontWeight: '700',
      color: '#2563eb',
    },
    errorBox: {
      marginBottom: '16px',
      padding: '12px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      color: '#dc2626',
      fontSize: '14px',
    },
    spinner: {
      animation: 'spin 1s linear infinite',
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <span style={styles.spinner}>⟳</span>
        <span style={{ marginLeft: '12px' }}>Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navbarContent}>
          <div style={styles.brand}>
            <div style={styles.logo}>
              <Stethoscope size={24} color="white" />
            </div>
            <div>
              <h1 style={styles.brandText}>MediBox</h1>
              <p style={styles.brandSubtext}>Doctor Portal</p>
            </div>
          </div>
          <button
            onClick={logout}
            style={styles.logoutBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Welcome Card */}
        <div style={styles.welcomeCard}>
          <h2 style={styles.welcomeTitle}>
            Welcome {formatDoctorName(profile?.name || "")} 👋
          </h2>
          <p style={styles.welcomeSubtext}>
            Manage consultations and assist your patients.
          </p>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statRow}>
                <Clock3 size={20} />
                <div>
                  <p style={styles.statLabel}>Pending</p>
                  <h3 style={styles.statValue}>{pending}</h3>
                </div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statRow}>
                <Activity size={20} />
                <div>
                  <p style={styles.statLabel}>Active</p>
                  <h3 style={styles.statValue}>{active}</h3>
                </div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statRow}>
                <CheckCircle2 size={20} />
                <div>
                  <p style={styles.statLabel}>Completed</p>
                  <h3 style={styles.statValue}>{completed}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consultations Section */}
        <h2 style={styles.sectionTitle}>Consultations</h2>

        <div style={styles.consultationsGrid}>
          {consultations.length === 0 ? (
            <div style={styles.emptyState}>
              <h3 style={styles.emptyTitle}>No Consultations Yet</h3>
              <p style={styles.emptySubtext}>
                New consultations from patients will appear here.
              </p>
            </div>
          ) : (
            consultations.map((consultation) => {
              const statusStyles = {
                PENDING: styles.statusPending,
                ACTIVE: styles.statusActive,
                COMPLETED: styles.statusCompleted,
              };

              return (
                <div
                  key={consultation.id}
                  style={styles.consultationCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div style={styles.patientInfo}>
                      <div style={styles.avatar}>
                        <User size={32} color="#2563eb" />
                      </div>
                      <div>
                        <h3 style={styles.patientName}>
                          {consultation.patient.name}
                        </h3>
                        <p style={styles.consultationId}>
                          Consultation #{consultation.id}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...statusStyles[consultation.status],
                      }}
                    >
                      {consultation.status}
                    </span>
                  </div>

                  <div style={styles.buttonGroup}>
                    {consultation.status === "PENDING" && (
                      <button
                        onClick={() => activateConsultation(consultation.id)}
                        style={styles.primaryBtn}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1d4ed8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                        }}
                      >
                        Activate Consultation
                      </button>
                    )}

                    {consultation.status === "ACTIVE" && (
                      <button
                        onClick={() => navigate(`/chat/${consultation.id}`)}
                        style={styles.successBtn}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#047857';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#059669';
                        }}
                      >
                        Join Consultation
                      </button>
                    )}

                    {consultation.status === "COMPLETED" && (
                      <button style={styles.disabledBtn} disabled>
                        Consultation Completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default DoctorDashboard;