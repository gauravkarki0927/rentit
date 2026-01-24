import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Input,
  Alert,
  Card,
} from "../../components/common/UIComponents";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function VerifySignup() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const { setAuthData } = useAuth();
  // route: /verify-signup/:email

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-signup`, {
        email: email,
        code: code,
      });

      if (response.data.success) {
        setAuthData(response.data.user, response.data.token);
        setSuccess(response.data.message);

        // Navigate to dashboard after short delay to show success message
        setTimeout(() => {
          navigate(
            response.data.user.userType === "admin"
              ? "/admin"
              : response.data.user.userType === "owner"
                ? "/owner-dashboard"
                : "/tenant-dashboard",
            { replace: true }
          );
        }, 500);
      } else {
        setError(response.data.message || "Verification failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Email Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Verify Your Email
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Please enter the verification code sent to your email.
          <br />
          <span className="text-xs text-gray-500">
            (Check console for mock code in dev)
          </span>
        </p>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Verification Code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="Enter 6-digit code"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
