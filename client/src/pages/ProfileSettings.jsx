import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/context/useAuth";
import defaultProfilePicture, {
  hasCustomProfilePicture,
  resolveProfilePicture,
} from "../features/auth/utils/profilePicture";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ProfileSettings = () => {
  const {
    user,
    updateProfilePicture,
    removeProfilePicture,
    language,
    setLanguage,
    t,
  } = useAuth();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(() =>
    resolveProfilePicture(user?.profileImg),
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (!file) setPreview(resolveProfilePicture(user?.profileImg));
  }, [file, user?.profileImg]);

  useEffect(
    () => () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (!ALLOWED_TYPES.includes(nextFile.type)) {
      toast.error(t("Choose a JPG, PNG or WebP image"));
      event.target.value = "";
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      toast.error(t("The image must be 5MB or smaller"));
      event.target.value = "";
      return;
    }

    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error(t("Please choose an image first"));
      return;
    }

    try {
      setIsUploading(true);
      await updateProfilePicture(file);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      toast.success(t("Profile picture updated"));
    } catch (error) {
      toast.error(t(error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!hasCustomProfilePicture(user?.profileImg)) return;

    const confirmed = window.confirm(
      t("Remove your custom profile photo and use the default image?"),
    );
    if (!confirmed) return;

    try {
      setIsRemoving(true);
      await removeProfilePicture();
      setFile(null);
      setPreview(defaultProfilePicture);
      if (inputRef.current) inputRef.current.value = "";
      toast.success(t("Profile picture removed"));
    } catch (error) {
      toast.error(t(error.message));
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-88px)] bg-[#fffaf5] px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[#efe4d8] bg-white shadow-[0_24px_60px_rgba(7,23,57,0.10)]">
        <div className="bg-gradient-to-r from-[#f15a1d] to-[#ffad32] px-7 py-8 text-white sm:px-10">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-white/80">
            W2Eat
          </p>
          <h1 className="mt-2 text-3xl font-black">{t("Profile Settings")}</h1>
          <p className="mt-2 font-semibold text-white/90">
            {t("Update your profile picture")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-7 sm:p-10">
          <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-start">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="group relative h-40 w-40 shrink-0 overflow-hidden rounded-full border-4 border-[#fff0e9] bg-[#fff7f1] shadow-[0_14px_35px_rgba(237,51,23,0.16)] outline-none ring-[#ed3317]/20 transition hover:ring-8 focus:ring-8"
              aria-label={t("Choose a photo")}
            >
              <img src={preview} alt="" className="h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-[#071739]/75 py-2 text-xs font-black text-white opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">
                {t("Choose a photo")}
              </span>
            </button>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h2 className="truncate text-2xl font-black text-[#071739]">
                {user?.username}
              </h2>
              <p className="mt-1 truncate text-sm font-semibold text-[#697184]">
                {user?.email}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
              />
              <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploading || isRemoving}
                  className="rounded-full border-2 border-[#ed3317] px-5 py-2.5 text-sm font-black text-[#ed3317] transition hover:bg-[#ed3317] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("Choose a photo")}
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={
                    !hasCustomProfilePicture(user?.profileImg) ||
                    isUploading ||
                    isRemoving
                  }
                  className="rounded-full border-2 border-red-200 px-5 py-2.5 text-sm font-black text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isRemoving ? t("Removing...") : t("Remove Photo")}
                </button>
              </div>
              <p className="mt-3 text-xs font-semibold text-[#7c8494]">
                {t("JPG, PNG or WebP, up to 5MB.")}
              </p>
            </div>
          </div>

          <section className="mt-9 border-t border-[#efe7dd] pt-7">
            <h2 className="text-xl font-black text-[#071739]">
              {t("Language")}
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#697184]">
              {t("Choose the language used throughout the application.")}
            </p>
            <div
              className="mt-5 grid gap-3 sm:grid-cols-2"
              role="group"
              aria-label={t("Change language")}
            >
              {[
                { value: "en", shortLabel: "EN", label: "English" },
                { value: "ka", shortLabel: "GE", label: "Georgian" },
              ].map((option) => {
                const isActive = language === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLanguage(option.value)}
                    aria-pressed={isActive}
                    className={`flex h-14 items-center justify-between rounded-xl border-2 px-5 text-left transition ${
                      isActive
                        ? "border-[#ed3317] bg-[#fff3ef] text-[#ed3317] shadow-sm"
                        : "border-[#e5e7eb] bg-white text-[#596174] hover:border-[#f2a68f]"
                    }`}
                  >
                    <span className="text-sm font-black">
                      {t(option.label)}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black shadow-sm">
                      {option.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="mt-9 flex flex-col-reverse gap-3 border-t border-[#efe7dd] pt-6 sm:flex-row sm:justify-end">
            <Link
              to="/"
              className="inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-black text-[#596174] transition hover:bg-[#f4f1ed]"
            >
              {t("Cancel")}
            </Link>
            <button
              type="submit"
              disabled={!file || isUploading || isRemoving}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#ed3317] px-7 text-sm font-black text-white shadow-[0_12px_28px_rgba(237,51,23,0.24)] transition hover:bg-[#d82b12] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? t("Uploading...") : t("Upload new picture")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ProfileSettings;
