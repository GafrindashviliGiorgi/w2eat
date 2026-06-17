import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { changePassword } from "../features/auth/api/authApi";
import changePasswordVisual from "../../design/photoDeatails/changepasicon.png";

const MIN_PASSWORD_LENGTH = 6;

const LockIcon = () => (
  <svg
    aria-hidden="true"
    className="h-5 w-5 text-slate-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5M6.75 10.5h10.5a1.5 1.5 0 0 1 1.5 1.5v6.75a1.5 1.5 0 0 1-1.5 1.5H6.75a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5Z"
    />
  </svg>
);

const EyeIcon = () => (
  <svg
    aria-hidden="true"
    className="h-5 w-5 text-slate-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg
    aria-hidden="true"
    className="h-8 w-8 flex-none text-green-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3.75 5.25 6v5.1c0 4.2 2.85 8.12 6.75 9.15 3.9-1.03 6.75-4.95 6.75-9.15V6L12 3.75Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m9.25 12.2 1.85 1.85 3.85-4.1"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    aria-hidden="true"
    className="h-3.5 w-3.5 flex-none text-green-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2.4"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
  </svg>
);

const BackArrowIcon = () => (
  <svg
    aria-hidden="true"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m6-6-6 6 6 6" />
  </svg>
);

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
    <section className="min-h-[calc(100vh-72px)] bg-[#fbfaf8] px-4 py-10 text-slate-950 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-lg border border-slate-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.09)] lg:grid-cols-[0.38fr_0.62fr]">
        <aside className="flex min-h-[360px] flex-col items-center justify-center bg-[#fff8f4] px-8 py-10 text-center lg:min-h-[610px]">
          <div
            className="h-40 w-40 rounded-full bg-cover bg-center shadow-[0_18px_45px_rgba(255,70,16,0.14)] sm:h-48 sm:w-48"
            style={{ backgroundImage: `url(${changePasswordVisual})` }}
          />
          <h1 className="mt-9 max-w-xs text-3xl font-extrabold leading-tight text-[#051943]">
            Keep Your Account Secure
          </h1>
          <p className="mt-5 max-w-xs text-base leading-7 text-slate-600">
            Choose a strong password and don't share it with anyone.
          </p>
        </aside>

        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-16">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-xl flex-col gap-6"
            noValidate
          >
            <div>
              <h2 className="text-3xl font-extrabold text-[#051943]">
                Change Password
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Update your password to keep your account secure.
              </p>
            </div>

            <div>
              <label
                htmlFor="currentPassword"
                className="mb-2 block text-sm font-semibold text-[#07183a]"
              >
                Current Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
                  <LockIcon />
                </span>
                <input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  className={`h-12 w-full rounded-md border bg-white px-14 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 ${
                    errors.currentPassword
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                  autoComplete="current-password"
                />
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2">
                  <EyeIcon />
                </span>
              </div>
              {errors.currentPassword && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-semibold text-[#07183a]"
              >
                New Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
                  <LockIcon />
                </span>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  className={`h-12 w-full rounded-md border bg-white px-14 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 ${
                    errors.newPassword ? "border-red-400" : "border-slate-200"
                  }`}
                  autoComplete="new-password"
                />
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2">
                  <EyeIcon />
                </span>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmNewPassword"
                className="mb-2 block text-sm font-semibold text-[#07183a]"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
                  <LockIcon />
                </span>
                <input
                  id="confirmNewPassword"
                  type="password"
                  name="confirmNewPassword"
                  value={form.confirmNewPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  className={`h-12 w-full rounded-md border bg-white px-14 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 ${
                    errors.confirmNewPassword
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                  autoComplete="new-password"
                />
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2">
                  <EyeIcon />
                </span>
              </div>
              {errors.confirmNewPassword && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.confirmNewPassword}
                </p>
              )}
            </div>

            <div className="flex gap-4 rounded-md border border-green-100 bg-green-50/80 px-5 py-4 text-xs text-slate-600 shadow-sm">
              <ShieldIcon />
              <div>
                <p className="font-bold text-[#07183a]">
                  Password must contain:
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    `At least ${MIN_PASSWORD_LENGTH} characters`,
                    "One uppercase letter",
                    "One number",
                    "One special character",
                  ].map((requirement) => (
                    <span
                      key={requirement}
                      className="flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <CheckIcon />
                      {requirement}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-md bg-[#ff2f08] text-base font-bold text-white shadow-[0_10px_24px_rgba(255,47,8,0.22)] transition hover:bg-[#ef2803] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Changing..." : "Update Password"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mx-auto flex items-center gap-2 text-sm font-semibold text-[#ff2f08] transition hover:text-[#d92707]"
            >
              <BackArrowIcon />
              Back to Profile
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ChangePassword;
