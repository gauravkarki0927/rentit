import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { Button, Input, Alert } from "../../components/common/UIComponents";
import { Mail, Lock, User } from "lucide-react";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "both",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.includes("@")) newErrors.email = "Valid email is required";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.userType
    );

    if (result.success) {
      navigate("/dashboard");
    } else {
      setErrors({ submit: result.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Create Account</h2>
          <p className="text-center text-gray-600 mb-6">Join RentIt and start earning today</p>

          {errors.submit && <Alert type="error" message={errors.submit} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={<User size={18} />}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail size={18} />}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="renter">Owner (Want to rent room)</option>
                <option value="owner">Tenant (Want to rent out room)</option>
              </select>
            </div>

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={<Lock size={18} />}
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={<Lock size={18} />}
            />

            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Address</h3>
              <Input
                label="Street Address"
                name="address.street"
                type="text"
                placeholder="123 Main Street"
                value={formData.address.street}
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 gap-2 mt-3">
                <Input
                  label="City"
                  name="address.city"
                  type="text"
                  placeholder="New York"
                  value={formData.address.city}
                  onChange={handleChange}
                />

                <Input
                  label="State"
                  name="address.state"
                  type="text"
                  placeholder="NY"
                  value={formData.address.state}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Zip Code"
                name="address.zipCode"
                type="text"
                placeholder="10001"
                value={formData.address.zipCode}
                onChange={handleChange}
                className="mt-3"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-pink-600 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
