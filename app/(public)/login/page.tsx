"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const { login, isLoading, user } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email);
    };

    // Redirect if already logged in (Effect could be better, but this works for simple flows)
    if (user) {
        if (user.role === 'admin') router.push('/admin');
        else router.push('/student');
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Welcome Back</h1>
                <p>Enter your email to access the dojo.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. admin@karate.com"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? "Bow to Sensei..." : "Enter Dojo"}
                    </button>
                </form>

                <div className="demo-credentials">
                    <p><strong>Demo Credentials:</strong></p>
                    <button type="button" onClick={() => setEmail('admin@karate.com')}>Admin</button>
                    <button type="button" onClick={() => setEmail('john@karate.com')}>Student</button>
                </div>
            </div>

            <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--secondary-color);
          padding: var(--spacing-md);
        }
        .login-card {
          background: white;
          padding: var(--spacing-2xl);
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: var(--shadow-lg);
        }
        h1 {
          color: var(--primary-color);
          margin-bottom: var(--spacing-sm);
        }
        p {
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xl);
        }
        .form-group {
          margin-bottom: var(--spacing-lg);
          text-align: left;
        }
        label {
          display: block;
          margin-bottom: var(--spacing-xs);
          font-weight: 500;
          color: var(--text-primary);
        }
        input {
          width: 100%;
          padding: var(--spacing-md);
          border: 1px solid #E5E7EB;
          border-radius: var(--radius-md);
          font-size: 1rem;
          transition: border-color var(--transition-fast);
        }
        input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.1);
        }
        .btn {
          width: 100%;
          padding: var(--spacing-md);
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color var(--transition-fast);
        }
        .btn:hover {
          background-color: var(--primary-dark);
        }
        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .demo-credentials {
          margin-top: var(--spacing-xl);
          padding-top: var(--spacing-lg);
          border-top: 1px solid #F3F4F6;
          font-size: 0.875rem;
        }
        .demo-credentials button {
          background: none;
          border: 1px solid var(--text-muted);
          padding: 4px 8px;
          margin: 0 4px;
          border-radius: 4px;
          cursor: pointer;
          color: var(--text-secondary);
        }
        .demo-credentials button:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }
      `}</style>
        </div>
    );
}
