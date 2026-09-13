import { useState, useEffect } from "react";
import { getProfile, updateProfile, updatePassword } from "../api/user";
import { deleteAccount } from "../api/auth";
import ProfileInputField from "../components/ProfileInputField";
import ProfileShortcut from "../components/ProfileShortcut";

function getStoredUser() {
  try {
    return JSON.parse(window.localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function getInitials(name) {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Profile() {
  const initialUser = getStoredUser();
  const initialProfile = {
    fullName: initialUser.fullName || initialUser.name || "",
    email: initialUser.email || "",
    phone: initialUser.phone || "",
  };

  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Notifications
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Account deletion state
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showDeletePasswordPopup, setShowDeletePasswordPopup] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    setIsLoadingProfile(true);

    getProfile()
      .then((data) => {
        if (!isMounted || !data) return;
        const loaded = {
          fullName: data.name || data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
        };
        setProfile(loaded);
        setDraft(loaded);

        // Synchronize updated profile to localStorage
        const stored = getStoredUser();
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            ...stored,
            name: loaded.fullName,
            email: loaded.email,
            phone: loaded.phone,
          }),
        );
      })
      .catch((err) => {
        console.error("Failed to fetch profile on mount:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingProfile(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const clearAlerts = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  const updateDraft = (event) => {
    setDraft({ ...draft, [event.target.name]: event.target.value });
    clearAlerts();
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    clearAlerts();

    if (!draft.fullName.trim()) {
      setErrorMessage("Full Name is required.");
      return;
    }
    if (!draft.email.trim()) {
      setErrorMessage("Email address is required.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedData = await updateProfile({
        name: draft.fullName.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
      });

      const updatedProfile = {
        fullName: updatedData.name || draft.fullName.trim(),
        email: updatedData.email || draft.email.trim(),
        phone: updatedData.phone || draft.phone.trim(),
      };

      setProfile(updatedProfile);
      setDraft(updatedProfile);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");

      // Update localStorage so Navbar and other components reflect the new name/email
      const currentStored = getStoredUser();
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          ...currentStored,
          name: updatedProfile.fullName,
          email: updatedProfile.email,
          phone: updatedProfile.phone,
        }),
      );

      // Trigger custom/storage event for any active listeners
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to update profile. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
    clearAlerts();
  };

  const togglePasswordReset = () => {
    setShowPasswordReset(!showPasswordReset);
    setPasswords({ current: "", next: "", confirm: "" });
    setPasswordSuccess("");
    setPasswordError("");
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwords.current) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (passwords.next.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword({
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });

      setPasswordSuccess("Password updated successfully!");
      setPasswords({ current: "", next: "", confirm: "" });
      setTimeout(() => {
        setShowPasswordReset(false);
        setPasswordSuccess("");
      }, 2500);
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          "Failed to update password. Please check your current password.",
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setDeleteError("");
    setIsDeleting(true);

    try {
      await deleteAccount({ password: deletePassword });
      window.localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      if (!err.response) {
        setDeleteError("Something went wrong. Please try again.");
        return;
      }
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 400 || status === 401) {
        setDeleteError(message || "Incorrect password.");
      } else if (status >= 500) {
        setDeleteError("The server is unavailable. Please try again later.");
      } else {
        setDeleteError("Unable to delete account. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-slate-50 text-night-sky-500 antialiased">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-12">
        {/* Profile Header Card */}
        <header className="mb-8 rounded-2xl border border-night-sky-100/20 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="flex size-18 items-center justify-center rounded-2xl bg-gradient-to-tr from-night-sky-500 via-night-sky-400 to-night-sky-300 text-2xl font-bold text-white shadow-md ring-4 ring-night-sky-100/10">
                  {getInitials(profile.fullName)}
                </div>
                {isLoadingProfile && (
                  <span
                    className="absolute -right-1 -top-1 size-4 animate-spin rounded-full border-2 border-night-sky-400 border-t-transparent bg-white"
                    title="Refreshing profile..."
                  />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-night-sky-500 sm:text-3xl">
                    {profile.fullName ||
                      (isLoadingProfile ? "Loading..." : "User Profile")}
                  </h1>
                  <span className="rounded-full bg-night-sky-100/15 px-2.5 py-0.5 text-xs font-semibold text-night-sky-400">
                    Customer Account
                  </span>
                </div>
                <p className="mt-1 text-sm text-night-sky-100">
                  {profile.email ||
                    "Manage your account details and security preferences"}
                </p>
              </div>
            </div>

            {/* Quick Status / Refresh indicator */}
            <div className="flex items-center gap-3">
              {isLoadingProfile ? (
                <div className="flex items-center gap-2 text-xs font-medium text-night-sky-200">
                  <span className="size-2 animate-pulse rounded-full bg-night-sky-300" />
                  Synchronizing...
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <svg
                    className="size-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Profile Connected
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Global Feedback Banner */}
        {successMessage && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-medium text-emerald-800 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <svg
                className="size-5 shrink-0 text-emerald-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="text-emerald-600 hover:text-emerald-800"
              aria-label="Dismiss alert"
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-medium text-red-800 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <svg
                className="size-5 shrink-0 text-red-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="text-red-600 hover:text-red-800"
              aria-label="Dismiss alert"
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Main Profile Info Section (7 Cols) */}
          <section className="rounded-2xl border border-night-sky-100/20 bg-white p-6 shadow-sm lg:col-span-7 sm:p-7">
            <div className="mb-6 flex items-center justify-between border-b border-night-sky-100/15 pb-4">
              <div>
                <h2 className="text-lg font-bold text-night-sky-500">
                  Personal Information
                </h2>
                <p className="text-xs text-night-sky-100">
                  Update your contact details and basic information
                </p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    clearAlerts();
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-night-sky-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-night-sky-400 active:scale-98"
                >
                  <svg
                    className="size-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              <ProfileInputField
                id="fullName"
                name="fullName"
                label="Full Name"
                value={profile.fullName}
                draftValue={draft.fullName}
                isEditing={isEditing}
                onChange={updateDraft}
                placeholder="e.g. John Doe"
                icon={
                  <svg
                    className="size-5 text-night-sky-200"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                  </svg>
                }
              />

              <ProfileInputField
                id="email"
                name="email"
                type="email"
                label="Email Address"
                value={profile.email}
                draftValue={draft.email}
                isEditing={isEditing}
                onChange={updateDraft}
                placeholder="john@example.com"
                icon={
                  <svg
                    className="size-5 text-night-sky-200"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                    <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                  </svg>
                }
              />

              <ProfileInputField
                id="phone"
                name="phone"
                type="tel"
                label="Phone Number"
                value={profile.phone}
                draftValue={draft.phone}
                isEditing={isEditing}
                onChange={updateDraft}
                placeholder="+94 7X XXX XXXX"
                icon={
                  <svg
                    className="size-5 text-night-sky-200"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              />

              {isEditing && (
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-night-sky-500 px-6 text-sm font-bold text-white shadow-xs transition hover:bg-night-sky-400 disabled:cursor-not-allowed disabled:opacity-70 active:scale-98"
                  >
                    {isSaving ? (
                      <>
                        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          className="size-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={cancelEdit}
                    className="min-h-10 rounded-xl border border-night-sky-100/30 px-5 text-sm font-bold text-night-sky-400 transition hover:bg-night-sky-100/10 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </section>

          {/* Side Column: Security & Shortcuts (5 Cols) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Password Management Card */}
            <section className="rounded-2xl border border-night-sky-100/20 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-night-sky-500">
                    Security & Password
                  </h2>
                  <p className="text-xs text-night-sky-100">
                    Keep your account secure with a strong password
                  </p>
                </div>
                <button
                  type="button"
                  onClick={togglePasswordReset}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    showPasswordReset
                      ? "border border-night-sky-100/30 bg-slate-100 text-night-sky-400 hover:bg-slate-200"
                      : "bg-night-sky-500 text-white hover:bg-night-sky-400"
                  }`}
                >
                  {showPasswordReset ? "Close" : "Change Password"}
                </button>
              </div>

              {showPasswordReset && (
                <form
                  onSubmit={handlePasswordSubmit}
                  className="mt-5 space-y-3.5 border-t border-night-sky-100/15 pt-4"
                >
                  {passwordSuccess && (
                    <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                      {passwordSuccess}
                    </p>
                  )}
                  {passwordError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
                      {passwordError}
                    </p>
                  )}

                  <PasswordInputField
                    id="current-password"
                    label="Current Password"
                    value={passwords.current}
                    show={showPasswords.current}
                    onToggle={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                    onChange={(val) =>
                      setPasswords({ ...passwords, current: val })
                    }
                  />

                  <PasswordInputField
                    id="new-password"
                    label="New Password"
                    value={passwords.next}
                    show={showPasswords.next}
                    onToggle={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        next: !prev.next,
                      }))
                    }
                    onChange={(val) =>
                      setPasswords({ ...passwords, next: val })
                    }
                    helperText="At least 8 characters with upper, lower, number & symbol"
                  />

                  <PasswordInputField
                    id="confirm-password"
                    label="Confirm New Password"
                    value={passwords.confirm}
                    show={showPasswords.confirm}
                    onToggle={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    onChange={(val) =>
                      setPasswords({ ...passwords, confirm: val })
                    }
                  />

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-night-sky-500 text-sm font-bold text-white shadow-xs transition hover:bg-night-sky-400 disabled:opacity-60"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Updating Password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </form>
              )}
            </section>

            {/* Quick Activity Shortcuts */}
            <section className="rounded-2xl border border-night-sky-100/20 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-night-sky-500">
                Quick Shortcuts
              </h2>
              <p className="mb-4 text-xs text-night-sky-100">
                Direct access to your orders and shopping activity
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ProfileShortcut
                  to="/cart"
                  icon={
                    <svg
                      className="size-5 text-night-sky-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  }
                  title="My Cart & Checkout"
                  subtitle="View items ready to buy"
                />

                <ProfileShortcut
                  to="/"
                  icon={
                    <svg
                      className="size-5 text-night-sky-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  }
                  title="Browse Catalog"
                  subtitle="Explore latest products"
                />
              </div>
            </section>

            {/* Danger Zone */}
            <section className="rounded-2xl border border-red-200/60 bg-red-50/40 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-800">
                Danger Zone
              </h3>
              <p className="mt-1 text-xs text-red-600/90">
                Permanently remove your account and all associated data.
              </p>
              <button
                type="button"
                onClick={() => {
                  setDeletePassword("");
                  setDeleteError("");
                  setShowDeletePopup(true);
                }}
                className="mt-3 flex items-center gap-1.5 rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-700 shadow-2xs transition hover:bg-red-50 hover:border-red-400"
              >
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete My Account
              </button>
            </section>
          </div>
        </div>
      </main>

      {/* Delete Account Step 1: Warning Dialog */}
      {showDeletePopup && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setShowDeletePopup(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2
              id="delete-title"
              className="mt-4 text-lg font-bold text-night-sky-500"
            >
              Delete account permanently?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-night-sky-100">
              Are you sure you want to delete this account? All your personal
              preferences and cart data will be permanently wiped out. This
              action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeletePopup(false)}
                className="rounded-xl border border-night-sky-100/30 px-4 py-2 text-sm font-bold text-night-sky-400 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeletePopup(false);
                  setDeletePassword("");
                  setShowDeletePasswordPopup(true);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Continue to Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Step 2: Confirm Password Dialog */}
      {showDeletePasswordPopup && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setShowDeletePasswordPopup(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition"
          >
            <h2
              id="confirm-delete-title"
              className="text-lg font-bold text-night-sky-500"
            >
              Confirm your password
            </h2>
            <p className="mt-1 text-sm text-night-sky-100">
              Please enter your password to confirm and authorize permanent
              deletion.
            </p>

            <form onSubmit={handleDelete} className="mt-5 space-y-4">
              <div>
                <label
                  className="block text-xs font-bold text-night-sky-300"
                  htmlFor="delete-password-input"
                >
                  Your Password
                </label>
                <input
                  id="delete-password-input"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  autoFocus
                  placeholder="Enter current password"
                  className="mt-1.5 h-10 w-full rounded-xl border border-night-sky-100/30 bg-slate-50 px-3 text-sm text-night-sky-500 outline-none focus:border-night-sky-400 focus:bg-white focus:ring-2 focus:ring-night-sky-200/20"
                />
              </div>

              {deleteError && (
                <p className="text-xs font-medium text-red-600">
                  {deleteError}
                </p>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeletePasswordPopup(false);
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  disabled={isDeleting}
                  className="rounded-xl border border-night-sky-100/30 px-4 py-2 text-sm font-bold text-night-sky-400 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || !deletePassword}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Deleting Account...
                    </>
                  ) : (
                    "Confirm Deletion"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordInputField({
  id,
  label,
  value,
  show,
  onToggle,
  onChange,
  helperText,
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-bold text-night-sky-300">
          {label}
        </label>
        {helperText && (
          <span className="text-[10px] text-night-sky-100">{helperText}</span>
        )}
      </div>

      <div className="relative mt-1">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          required
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-xl border border-night-sky-100/30 bg-slate-50 px-3 pr-10 text-sm text-night-sky-500 outline-none transition focus:border-night-sky-400 focus:bg-white focus:ring-2 focus:ring-night-sky-200/20"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-night-sky-200 hover:text-night-sky-400"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
              />
            </svg>
          ) : (
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default Profile;
