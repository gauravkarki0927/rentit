import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Button, Input, Alert, Card } from "../../components/common/UIComponents";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Request Code, 2: Reset Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setStep(2);
      setSuccess("Reset code sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email,
        code,
        password
      });
      setSuccess("Password reset successfully. You can now login.");
      setTimeout(() => {
        // redirected by link or user action, or auto redirect?
        // navigate('/login')
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </h2>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your registered email"
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending Code..." : "Send Reset Code"}
            </Button>
            <div className="text-center mt-4">
              <Link to="/login" className="text-pink-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
             <Input
              label="Email"
              type="email"
              value={email}
              disabled
            />
            <Input
              label="Reset Code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="Enter 6-digit code"
            />
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter new password"
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
             <div className="text-center mt-4">
              <Link to="/login" className="text-pink-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
