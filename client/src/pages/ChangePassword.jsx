import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { changePassword } from "../features/auth/api/authApi";

const MIN_PASSWORD_LENGTH = 6;

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const next = {};

    if (!form.currentPassword) {
      next.currentPassword = "Current password is required";
    }

    if (!form.newPassword) {
      next.newPassword = "New password is required";
    } else if (form.newPassword.length < MIN_PASSWORD_LENGTH) {
      next.newPassword = `New password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    if (!form.confirmNewPassword) {
      next.confirmNewPassword = "Please confirm your new password";
    } else if (form.newPassword !== form.confirmNewPassword) {
      next.confirmNewPassword = "Passwords do not match";
    }

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully");
      navigate("/");
    } catch (err) {
      if (
        err.message?.toLowerCase().includes("incorrect") ||
        err.message?.toLowerCase().includes("wrong") ||
        err.message?.toLowerCase().includes("invalid")
      ) {
        setErrors({ currentPassword: err.message });
      } else {
        toast.error(err.message || "Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 flex flex-col gap-4"
        noValidate
      >
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Current Password
          </label>
          <input
            id="currentPassword"
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-orange-200 focus:border-orange-400 ${
              errors.currentPassword ? "border-red-400" : "border-gray-300"
            }`}
            autoComplete="current-password"
          />
          {errors.currentPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.currentPassword}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-orange-200 focus:border-orange-400 ${
              errors.newPassword ? "border-red-400" : "border-gray-300"
            }`}
            autoComplete="new-password"
          />
          {errors.newPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmNewPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm New Password
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            name="confirmNewPassword"
            value={form.confirmNewPassword}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-orange-200 focus:border-orange-400 ${
              errors.confirmNewPassword ? "border-red-400" : "border-gray-300"
            }`}
            autoComplete="new-password"
          />
          {errors.confirmNewPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.confirmNewPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
