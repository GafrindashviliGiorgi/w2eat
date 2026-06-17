import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { loginSchema } from "../validation/loginSchema";
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

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (data) => {
    try {
      await login(data);
      const nextPath = location.state?.from?.pathname || "/";
      navigate(nextPath, { replace: true });
    } catch (error) {
      setError("root", {
        message: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fffaf4] px-4 py-8 text-[#071739] sm:px-6 lg:px-10">
      <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative min-h-[520px] lg:min-h-[700px]">
          <div className="relative z-10 max-w-xl pt-2 sm:pt-8 lg:pt-12">
            <h1 className="max-w-[540px] text-4xl font-bold leading-tight text-[#071739] sm:text-5xl lg:text-6xl">
              Welcome back
              <br />
              to{" "}
              <span className="text-[#ed3317]">
                better eating
                <img
                  src={leaf}
                  alt=""
                  className="ml-2 inline-block h-11 w-11 scale-[2.2] object-cover align-middle sm:h-12 sm:w-12"
                />
              </span>
            </h1>
            <p className="mt-6 max-w-[430px] text-base leading-8 text-[#283247] sm:text-lg">
              Sign in to continue discovering healthy, personalized recipes
              that fit your goals.
            </p>

            <div className="mt-10 grid gap-7 sm:max-w-[470px]">
              {featureItems.map((item) => (
                <div key={item.title} className="flex items-center gap-5">
                  <div
                    className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full ${item.tone}`}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      className="h-16 w-16 object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#071739]">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-[320px] text-sm leading-6 text-[#3d465a]">
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
            className="pointer-events-none absolute -bottom-48 left-[90%] z-0 hidden w-[620px] max-w-none -translate-x-1/4 lg:block xl:left-[94%] xl:w-[680px]"
          />
        </section>

        <section className="relative z-10 flex flex-col items-center gap-7">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-[520px] space-y-7 rounded-[28px] border border-white/80 bg-white/95 p-7 shadow-[0_24px_70px_rgba(7,23,57,0.13)] backdrop-blur sm:p-10"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#071739] sm:text-3xl">
                Sign in to your account
              </h2>
              <p className="mt-3 text-sm text-[#465066] sm:text-base">
                Enter your email and password to continue
              </p>
            </div>

            {errors.root && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                {errors.root.message}
              </p>
            )}

            {/* Email */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#071739]">
                Email address
              </label>
              <input
                type="email"
                placeholder="Email"
                {...register("email")}
                className="w-full rounded-xl border border-[#d9dde6] bg-white px-4 py-4 text-[#071739] outline-none transition placeholder:text-[#8a92a3] focus:border-[#ed3317] focus:ring-4 focus:ring-[#ed3317]/10"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#071739]">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className="w-full rounded-xl border border-[#d9dde6] bg-white px-4 py-4 text-[#071739] outline-none transition placeholder:text-[#8a92a3] focus:border-[#ed3317] focus:ring-4 focus:ring-[#ed3317]/10"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#ed3317] py-4 text-base font-bold text-white shadow-[0_12px_30px_rgba(237,51,23,0.24)] transition hover:bg-[#d82b12] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Loading..." : "Login"}
            </button>

            <p className="text-center text-sm text-[#5f6676]">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#ed3317] hover:underline"
              >
                Register
              </Link>
            </p>
          </form>

          <p className="relative z-20 rounded-full bg-[#fffaf4]/90 px-4 py-2 text-center text-sm text-[#596174] shadow-sm">
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

export default LoginForm;
