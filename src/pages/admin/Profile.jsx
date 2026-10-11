import { useEffect, useState } from "react";
import { getProfile, updatePassword, updateProfile } from "../../api/user";
import {
  isStrongPassword,
  isPasswordMatched,
} from "../../utility/inputValidation";
import InputField from "../../components/InputField";
import PasswordField from "../../components/PasswordField";

const emptyProfile = { name: "", email: "" };
const emptyPassword = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [draft, setDraft] = useState(emptyProfile);
  const [passwords, setPasswords] = useState(emptyPassword);
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;
    getProfile()
      .then((loadedProfile) => {
        if (isMounted) {
          setProfile(loadedProfile);
          setDraft(loadedProfile);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(
            loadError.response?.data?.message || "Unable to load profile.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  function clearFeedback() {
    setError("");
    setNotice("");
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    clearFeedback();
    setBusy("profile");
    try {
      const savedProfile = await updateProfile(draft);
      setProfile(savedProfile);
      setDraft(savedProfile);
      const storedUser = JSON.parse(
        window.localStorage.getItem("user") || "{}",
      );
      window.localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, ...savedProfile }),
      );
      setIsEditing(false);
      setNotice("Profile details updated successfully.");
    } catch (saveError) {
      setError(
        saveError.response?.data?.message || "Unable to update profile.",
      );
    } finally {
      setBusy("");
    }
  }

  function handleCurrentPasswordChange(val) {
    setPasswords((prev) => ({ ...prev, currentPassword: val }));
    if (passwordErrors.currentPassword) {
      setPasswordErrors((prev) => ({ ...prev, currentPassword: "" }));
    }
    clearFeedback();
  }

  function handleNewPasswordChange(val) {
    setPasswords((prev) => ({ ...prev, newPassword: val }));
    if (
      passwordErrors.newPassword &&
      isStrongPassword(val) === "Password is Strong"
    ) {
      setPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
    }
    if (passwords.confirmPassword) {
      const isMatched = isPasswordMatched(val, passwords.confirmPassword);
      setPasswordErrors((prev) => ({
        ...prev,
        confirmPassword: isMatched ? "" : "Password doesn't Match!",
      }));
    }
    clearFeedback();
  }

  function handleConfirmPasswordChange(val) {
    setPasswords((prev) => ({ ...prev, confirmPassword: val }));
    if (!val) {
      setPasswordErrors((prev) => ({ ...prev, confirmPassword: "" }));
      return;
    }
    const isMatched = isPasswordMatched(passwords.newPassword, val);
    setPasswordErrors((prev) => ({
      ...prev,
      confirmPassword: isMatched ? "" : "Password doesn't Match!",
    }));
    clearFeedback();
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    clearFeedback();
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let hasError = false;

    if (!passwords.currentPassword.trim()) {
      errors.currentPassword = "Please enter your current password.";
      hasError = true;
    }

    if (!passwords.newPassword) {
      errors.newPassword = "Please enter a new password.";
      hasError = true;
    } else if (
      isStrongPassword(passwords.newPassword) !== "Password is Strong"
    ) {
      errors.newPassword =
        "Use a valid password with at least 8 characters, including uppercase, lowercase, number, and symbol.";
      hasError = true;
    } else if (
      passwords.currentPassword &&
      passwords.currentPassword === passwords.newPassword
    ) {
      errors.newPassword =
        "New password must be different from current password.";
      hasError = true;
    }

    if (!passwords.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
      hasError = true;
    } else if (
      !isPasswordMatched(passwords.newPassword, passwords.confirmPassword)
    ) {
      errors.confirmPassword = "Password doesn't Match!";
      hasError = true;
    }

    if (hasError) {
      setPasswordErrors(errors);
      setError(
        errors.currentPassword ||
          errors.newPassword ||
          errors.confirmPassword ||
          "Please fix the errors before updating your password.",
      );
      return;
    }

    setBusy("password");
    try {
      await updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords(emptyPassword);
      setPasswordErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setNotice("Password updated successfully.");
    } catch (passwordError) {
      const msg =
        passwordError.response?.data?.message || "Unable to update password.";
      setError(msg);
      if (
        passwordError.response?.status === 400 &&
        msg.toLowerCase().includes("current password")
      ) {
        setPasswordErrors((prev) => ({ ...prev, currentPassword: msg }));
      }
    } finally {
      setBusy("");
    }
  }

  const nextPasswordCriteria = [
    {
      label: "At least 8 characters",
      met:
        typeof passwords.newPassword === "string" &&
        passwords.newPassword.length >= 8,
    },
    {
      label: "Uppercase letter (A-Z)",
      met: /[A-Z]/.test(passwords.newPassword),
    },
    {
      label: "Lowercase letter (a-z)",
      met: /[a-z]/.test(passwords.newPassword),
    },
    { label: "Number (0-9)", met: /\d/.test(passwords.newPassword) },
    {
      label: "Special symbol (!@#$...)",
      met: /[^A-Za-z0-9\s]/.test(passwords.newPassword),
    },
  ];
  const metCriteriaCount = nextPasswordCriteria.filter((c) => c.met).length;
  const isNewPasswordStrong =
    passwords.newPassword.length > 0 &&
    isStrongPassword(passwords.newPassword) === "Password is Strong";
  const isConfirmPasswordMatched =
    Boolean(passwords.confirmPassword) &&
    Boolean(passwords.newPassword) &&
    isPasswordMatched(passwords.newPassword, passwords.confirmPassword);

  return (
    <main className="min-h-[calc(100vh-72px)] bg-night-sky-100/10 px-5 py-8 text-night-sky-500 md:px-8">
      <title>Profile | Kannangara Hardwares</title>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-night-sky-500">
            My profile
          </h1>
          <p className="mt-2 max-w-xl text-sm text-night-sky-200"></p>
        </header>

        {(error || notice) && (
          <div
            className="rounded-xl border border-night-sky-200/30 bg-night-sky-100/10 px-4 py-3 text-sm text-night-sky-400"
            role="status"
          >
            {error || notice}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProfileCard
            title="Account details"
            description="Keep your contact information up to date."
          >
            {isLoading ? (
              <p className="py-8 text-sm text-night-sky-200">
                Loading profile...
              </p>
            ) : (
              <form className="space-y-4" onSubmit={handleProfileSubmit}>
                <InputField
                  label="Full name"
                  value={draft.name}
                  disabled={!isEditing}
                  variant="admin"
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                />
                <InputField
                  label="Email address"
                  type="email"
                  value={draft.email}
                  disabled={!isEditing}
                  variant="admin"
                  onChange={(event) =>
                    setDraft({ ...draft, email: event.target.value })
                  }
                />
                {isEditing ? (
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={busy === "profile"}
                      className="rounded-xl bg-night-sky-500 px-5 py-3 text-sm font-bold text-white hover:bg-night-sky-400"
                    >
                      {busy === "profile" ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(profile);
                        setIsEditing(false);
                      }}
                      className="rounded-xl border border-night-sky-100/30 px-5 py-3 text-sm font-bold text-night-sky-400 hover:bg-night-sky-100/10"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      clearFeedback();
                      setIsEditing(true);
                    }}
                    className="rounded-xl bg-night-sky-500 px-5 py-3 text-sm font-bold text-white hover:bg-night-sky-400"
                  >
                    Edit details
                  </button>
                )}
              </form>
            )}
          </ProfileCard>

          <ProfileCard
            title="Change password"
            description="Confirm your current password before choosing a new one."
          >
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <PasswordField
                label="Current password"
                type="password"
                value={passwords.currentPassword}
                error={passwordErrors.currentPassword}
                onChange={handleCurrentPasswordChange}
                variant="admin"
              />
              <PasswordField
                label="New password"
                type="password"
                value={passwords.newPassword}
                error={passwordErrors.newPassword}
                onChange={handleNewPasswordChange}
                variant="admin"
              >
                {passwords.newPassword.length > 0 && (
                  <div className="mt-1 rounded-xl border border-night-sky-100/15 bg-white/70 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-night-sky-300">
                        Password Strength:
                      </span>
                      <span
                        className={`flex items-center gap-1 font-bold ${
                          isNewPasswordStrong
                            ? "text-emerald-600"
                            : metCriteriaCount >= 3
                              ? "text-amber-600"
                              : "text-rose-600"
                        }`}
                      >
                        {isNewPasswordStrong ? (
                          <>
                            <svg
                              className="size-3.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Password is Strong
                          </>
                        ) : (
                          <>
                            <svg
                              className="size-3.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Password is Weak
                          </>
                        )}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-5 gap-1.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            level <= metCriteriaCount
                              ? isNewPasswordStrong
                                ? "bg-emerald-500"
                                : metCriteriaCount >= 3
                                  ? "bg-amber-400"
                                  : "bg-rose-500"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="mt-2.5 grid grid-cols-1 gap-1 text-[11px] sm:grid-cols-2">
                      {nextPasswordCriteria.map((c, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-1.5 transition-colors ${
                            c.met
                              ? "font-medium text-emerald-700"
                              : "text-night-sky-100"
                          }`}
                        >
                          {c.met ? (
                            <svg
                              className="size-3 shrink-0 text-emerald-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <span className="mx-0.5 size-1.5 shrink-0 rounded-full bg-slate-300" />
                          )}
                          <span>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </PasswordField>
              <PasswordField
                label="Confirm new password"
                type="password"
                value={passwords.confirmPassword}
                error={passwordErrors.confirmPassword}
                success={isConfirmPasswordMatched ? "Passwords match" : ""}
                onChange={handleConfirmPasswordChange}
                variant="admin"
              />
              <button
                type="submit"
                disabled={busy === "password"}
                className="rounded-xl bg-night-sky-500 px-5 py-3 text-sm font-bold text-white hover:bg-night-sky-400"
              >
                {busy === "password" ? "Updating..." : "Update password"}
              </button>
            </form>
          </ProfileCard>
        </div>
      </div>
    </main>
  );
}

function ProfileCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 p-5 md:p-6">
      <h2 className="text-base font-bold text-night-sky-500">{title}</h2>
      <p className="mt-1 text-xs text-night-sky-200">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}



export default Profile;
