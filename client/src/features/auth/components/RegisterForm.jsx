import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { registerSchema } from "../validation/registerSchema";
import { useAuth } from "../context/useAuth";
import icon1 from "../../../../design/photoDeatails/icon1.png";
import icon2 from "../../../../design/photoDeatails/icon2.png";
import leaf from "../../../../design/photoDeatails/leaf.png";
import signinSignupDetail from "../../../../design/photoDeatails/singinSingupDtl.png";

const featureItems = [
  {
    title: "Personalized for You",
    description: "Get recipe recommendations based on your preferences.",
    icon: icon1,
    tone: "bg-[#fff1e8]",
  },
  {
    title: "Healthy & Nutritious",
    description: "Access meals that support your health and fitness goals.",
    icon: icon2,
    tone: "bg-[#f2f7df]",
  },
  {
    title: "Save Time",
    description: "Find the right meals faster with smart ingredient search.",
    icon: leaf,
    tone: "bg-[#fff1e8]",
  },
];

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const { register: registerWithApi } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await registerWithApi(data);
      navigate("/login", { replace: true });
    } catch (error) {
      setError("root", {
        message: error.message,
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] overflow-hidden bg-[#fffaf4] px-4 py-4 text-[#071739] sm:px-6 lg:px-10">
      <main className="mx-auto grid min-h-[calc(100vh-100px)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative min-h-[420px] lg:min-h-[560px]">
          <div className="relative z-10 max-w-lg pt-1 sm:pt-5 lg:pt-8">
            <h1 className="max-w-[500px] text-4xl font-bold leading-tight text-[#071739] sm:text-[44px] lg:text-[52px]">
              Start your
              <br />
              <span className="text-[#ed3317]">
                better eating
                <img
                  src={leaf}
                  alt=""
                  className="ml-2 inline-block h-9 w-9 scale-[2] object-cover align-middle sm:h-10 sm:w-10"
                />
              </span>
            </h1>
            <p className="mt-4 max-w-[390px] text-base leading-7 text-[#283247]">
              Create an account to discover healthy, personalized recipes that
              fit your goals.
            </p>

            <div className="mt-7 grid gap-5 sm:max-w-[430px]">
              {featureItems.map((item) => (
                <div key={item.title} className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ${item.tone}`}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      className="h-14 w-14 object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#071739]">
                      {item.title}
                    </h3>
                    <p className="mt-1 max-w-[300px] text-sm leading-6 text-[#3d465a]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <img
            src={signinSignupDetail}
            alt=""
            className="pointer-events-none absolute -bottom-24 left-[88%] z-0 hidden w-[420px] max-w-none -translate-x-1/4 lg:block xl:left-[92%] xl:w-[470px]"
          />
        </section>

        <section className="relative z-10 flex flex-col items-center gap-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-[500px] space-y-4 rounded-[22px] border border-white/80 bg-white/95 p-6 shadow-[0_20px_56px_rgba(7,23,57,0.12)] backdrop-blur sm:p-7"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#071739]">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-[#465066]">
                Enter your details to start your healthy recipe journey
              </p>
            </div>

            {errors.root && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                {errors.root.message}
              </p>
            )}

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#071739]">
                Name
              </label>
              <input
                type="text"
                placeholder="Name"
                {...register("username")}
                className="w-full rounded-xl border border-[#d9dde6] bg-white px-4 py-2.5 text-[#071739] outline-none transition placeholder:text-[#8a92a3] focus:border-[#ed3317] focus:ring-4 focus:ring-[#ed3317]/10"
              />
              {errors.username && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#071739]">
                Email address
              </label>
              <input
                type="email"
                placeholder="Email"
                {...register("email")}
                className="w-full rounded-xl border border-[#d9dde6] bg-white px-4 py-2.5 text-[#071739] outline-none transition placeholder:text-[#8a92a3] focus:border-[#ed3317] focus:ring-4 focus:ring-[#ed3317]/10"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#071739]">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className="w-full rounded-xl border border-[#d9dde6] bg-white px-4 py-2.5 text-[#071739] outline-none transition placeholder:text-[#8a92a3] focus:border-[#ed3317] focus:ring-4 focus:ring-[#ed3317]/10"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#071739]">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword")}
                className="w-full rounded-xl border border-[#d9dde6] bg-white px-4 py-2.5 text-[#071739] outline-none transition placeholder:text-[#8a92a3] focus:border-[#ed3317] focus:ring-4 focus:ring-[#ed3317]/10"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#ed3317] py-3 text-base font-bold text-white shadow-[0_12px_30px_rgba(237,51,23,0.24)] transition hover:bg-[#d82b12] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Loading..." : "Register"}
            </button>

            <p className="text-center text-sm text-[#5f6676]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#ed3317] hover:underline"
              >
                Login
              </Link>
            </p>
          </form>

          <p className="relative z-20 rounded-full bg-[#fffaf4]/90 px-4 py-2 text-center text-xs text-[#596174] shadow-sm sm:text-sm">
            Your data is safe with us.{" "}
            <span className="font-semibold text-[#4f8b16]">
              We never share your information.
            </span>
          </p>
        </section>
      </main>
    </div>
  );
};

export default RegisterForm;
