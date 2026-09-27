import { useEffect, useState } from "react";
import { getProfile, updatePassword, updateProfile } from "../../api/user";

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

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    clearFeedback();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setBusy("password");
    try {
      await updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords(emptyPassword);
      setNotice("Password updated successfully.");
    } catch (passwordError) {
      setError(
        passwordError.response?.data?.message || "Unable to update password.",
      );
    } finally {
      setBusy("");
    }
  }

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
          <p className="mt-2 max-w-xl text-sm text-night-sky-200">
          </p>
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
                <ProfileInput
                  label="Full name"
                  value={draft.name}
                  disabled={!isEditing}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                />
                <ProfileInput
                  label="Email address"
                  type="email"
                  value={draft.email}
                  disabled={!isEditing}
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
              <ProfileInput
                label="Current password"
                type="password"
                value={passwords.currentPassword}
                onChange={(event) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: event.target.value,
                  })
                }
              />
              <ProfileInput
                label="New password"
                type="password"
                value={passwords.newPassword}
                minLength="8"
                onChange={(event) =>
                  setPasswords({
                    ...passwords,
                    newPassword: event.target.value,
                  })
                }
              />
              <ProfileInput
                label="Confirm new password"
                type="password"
                value={passwords.confirmPassword}
                minLength="8"
                onChange={(event) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: event.target.value,
                  })
                }
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

function ProfileInput({
  label,
  type = "text",
  value,
  disabled = false,
  onChange,
  minLength,
}) {
  return (
    <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
      {label}
      <input
        type={type}
        value={value}
        disabled={disabled}
        required
        onChange={onChange}
        minLength={minLength}
        className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </label>
  );
}

export default Profile;
