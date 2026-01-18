"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.push('/admin');
      else router.push('/student');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: 'New Student' } // Default name
          }
        });
        if (error) alert(error.message);
        else alert("Sign up successful! Please check your email for verification (if enabled) or sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) alert(error.message);
        // AuthContext will detect change and redirect
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{isSignUp ? "Join the Dojo" : "Welcome Back"}</h1>
        <p>{isSignUp ? "Register for your first class" : "Enter your email to access the dojo."}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <div className="mode-switch">
          <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Already have an account? Sign In" : "Register to start your journey"}
          </button>
        </div>

        <div className="back-link">
          <Link href="/">← Back to Home</Link>
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
        .mode-switch {
            margin-top: var(--spacing-md);
        }
        .mode-switch button {
            background: none;
            border: none;
            color: var(--primary-color);
            cursor: pointer;
            text-decoration: underline;
        }
        .back-link { margin-top: var(--spacing-lg); }
        .back-link a { color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; }
        .back-link a:hover { color: var(--primary-color); }
      `}</style>
    </div>
  );
}
