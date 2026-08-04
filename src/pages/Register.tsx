import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Stethoscope, User, Mail, Lock, Briefcase, Calendar, AlertCircle } from "lucide-react";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [specialization, setSpecialization] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
        specialization: role === "DOCTOR" ? specialization : undefined,
        yearsOfExperience: role === "DOCTOR" ? Number(yearsOfExperience) : undefined,
      });

      alert("Registration Successful");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration Failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #f5f3ff 100%)',
      padding: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
      width: '100%',
      maxWidth: '480px',
      padding: '40px 32px',
    },
    header: {
      textAlign: 'center' as const,
    },
    logo: {
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      width: '64px',
      height: '64px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)',
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #2563eb, #1e40af)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginTop: '16px',
      marginBottom: '4px',
    },
    subtitle: {
      color: '#64748b',
      fontSize: '14px',
      marginTop: '0',
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
    },
    errorIcon: {
      marginTop: '2px',
      flexShrink: 0,
    },
    errorText: {
      color: '#dc2626',
      fontSize: '14px',
    },
    form: {
      marginTop: '24px',
    },
    fieldGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      color: '#334155',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '6px',
    },
    inputWrapper: {
      position: 'relative' as const,
    },
    inputIcon: {
      position: 'absolute' as const,
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8',
    },
    input: {
      width: '100%',
      padding: '10px 12px 10px 40px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box' as const,
      backgroundColor: '#f8fafc',
      transition: 'all 0.2s',
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box' as const,
      backgroundColor: '#f8fafc',
      transition: 'all 0.2s',
      WebkitAppearance: 'none' as const,
      MozAppearance: 'none' as const,
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
    },
    button: {
      width: '100%',
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
      marginTop: '8px',
    },
    buttonDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
    registerText: {
      textAlign: 'center' as const,
      fontSize: '14px',
      color: '#64748b',
      marginTop: '24px',
    },
    registerLink: {
      color: '#2563eb',
      fontWeight: '600',
      textDecoration: 'none',
    },
    doctorFields: {
      marginTop: '8px',
    },
    spinner: {
      animation: 'spin 1s linear infinite',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <Stethoscope size={32} color="white" />
          </div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join MediBox Today</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} color="#dc2626" style={styles.errorIcon} />
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} style={styles.form}>
          {/* Full Name */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Enter your full name"
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  e.target.style.backgroundColor = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#f8fafc';
                }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="Enter your email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  e.target.style.backgroundColor = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#f8fafc';
                }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                placeholder="Create a password (min 6 characters)"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  e.target.style.backgroundColor = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#f8fafc';
                }}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>I am a</label>
            <select
              style={styles.select}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = '#f8fafc';
              }}
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
            </select>
          </div>

          {/* Doctor-specific fields */}
          {role === "DOCTOR" && (
            <div style={styles.doctorFields}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Specialization</label>
                <div style={styles.inputWrapper}>
                  <Briefcase size={18} style={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="e.g., Cardiologist, Neurologist"
                    style={styles.input}
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                    required={role === "DOCTOR"}
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Years of Experience</label>
                <div style={styles.inputWrapper}>
                  <Calendar size={18} style={styles.inputIcon} />
                  <input
                    type="number"
                    placeholder="Enter years of experience"
                    style={styles.input}
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                    required={role === "DOCTOR"}
                    min={0}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8, #1e40af)';
                e.currentTarget.style.transform = 'scale(1.01)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {isLoading ? (
              <>
                <span style={styles.spinner}>⟳</span>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Login Link */}
        <p style={styles.registerText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.registerLink}>
            Login Here
          </Link>
        </p>
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

export default Register;