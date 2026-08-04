import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Mail,
  Stethoscope,
  Calendar,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

interface Profile {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  doctor: {
    specialization: string;
    yearsOfExperience: number;
  };
}

function PatientDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const profileRes = await api.get("/auth/profile");
      setProfile(profileRes.data.data);

      const doctorsRes = await api.get("/doctors");
      setDoctors(doctorsRes.data.data);
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

  const createConsultation = async (doctorId: number) => {
    try {
      const res = await api.post("/consultations", {
        doctorId,
      });

      navigate(`/chat/${res.data.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Unable to create consultation");
    }
  };

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
    logoutBtnHover: {
      backgroundColor: '#dc2626',
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginTop: '32px',
    },
    statCard: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '16px',
      padding: '16px',
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
      fontWeight: '600',
      margin: 0,
    },
    sectionTitle: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      marginTop: '40px',
      marginBottom: '24px',
    },
    doctorsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px',
    },
    doctorCard: {
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      transition: 'all 0.3s',
    },
    doctorHeader: {
      background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
      height: '96px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    doctorAvatar: {
      width: '96px',
      height: '96px',
      borderRadius: '50%',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
      transform: 'translateY(40px)',
    },
    doctorBody: {
      padding: '56px 24px 24px 24px',
    },
    doctorName: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1e293b',
      textAlign: 'center' as const,
      margin: 0,
    },
    doctorSpecialization: {
      textAlign: 'center' as const,
      color: '#64748b',
      marginTop: '4px',
      marginBottom: 0,
    },
    doctorInfo: {
      marginTop: '24px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    infoLabel: {
      color: '#64748b',
    },
    infoValue: {
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    consultBtn: {
      width: '100%',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '32px',
      transition: 'background-color 0.2s',
    },
    consultBtnHover: {
      backgroundColor: '#1d4ed8',
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
      marginTop: '16px',
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
              <p style={styles.brandSubtext}>Patient Portal</p>
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
            Welcome, {profile?.name} 👋
          </h2>
          <p style={styles.welcomeSubtext}>
            Manage your consultations and connect with doctors instantly.
          </p>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statRow}>
                <User size={20} />
                <div>
                  <p style={styles.statLabel}>Name</p>
                  <h3 style={styles.statValue}>{profile?.name}</h3>
                </div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statRow}>
                <Mail size={20} />
                <div>
                  <p style={styles.statLabel}>Email</p>
                  <h3 style={styles.statValue}>{profile?.email}</h3>
                </div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statRow}>
                <Stethoscope size={20} />
                <div>
                  <p style={styles.statLabel}>Role</p>
                  <h3 style={styles.statValue}>{profile?.role}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Section */}
        <h2 style={styles.sectionTitle}>Available Doctors</h2>

        <div style={styles.doctorsGrid}>
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              style={styles.doctorCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.doctorHeader}>
                <div style={styles.doctorAvatar}>
                  <User size={48} color="#2563eb" />
                </div>
              </div>
              <div style={styles.doctorBody}>
                <h3 style={styles.doctorName}>
  {doctor.name ? `Dr. ${doctor.name.replace(/^Dr\.?\s*/i, '').trim()}` : "Doctor"}
</h3>
                <p style={styles.doctorSpecialization}>
                  {doctor.doctor.specialization}
                </p>

                <div style={styles.doctorInfo}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Experience</span>
                    <span style={styles.infoValue}>
                      <Calendar size={18} />
                      {doctor.doctor.yearsOfExperience} Years
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Email</span>
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>
                      {doctor.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => createConsultation(doctor.id)}
                  style={styles.consultBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }}
                >
                  Start Consultation
                </button>
              </div>
            </div>
          ))}
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

export default PatientDashboard;