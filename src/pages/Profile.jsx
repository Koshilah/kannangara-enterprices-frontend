import { useState } from "react";
import Navbar from "../components/Navbar";

const defaultProfile = {
  fullName: "Saman Kannangara",
  email: "kamal@gmail.com",
  phone: "077 123 4567",
};

function Profile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [draft, setDraft] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const updateDraft = (event) => {
    setDraft({ ...draft, [event.target.name]: event.target.value });
  };

  const saveProfile = (event) => {
    event.preventDefault();
    setProfile(draft);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const togglePasswordReset = () => {
    setShowPasswordReset(!showPasswordReset);
    setPasswords({ current: "", next: "" });
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <main className="mx-auto min-h-[calc(100vh-72px)] w-full max-w-6xl px-6 py-8 sm:px-10 lg:px-20 xl:px-24">
        <h1 className="mb-12 text-center text-2xl font-bold lg:text-3xl">
          My Profile
        </h1>

        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[300px_1fr] md:gap-24 lg:grid-cols-[340px_1fr] lg:gap-28">
          <section aria-label="Profile details">
            <form onSubmit={saveProfile}>
              <ProfileField
                label="Full Name"
                name="fullName"
                value={profile.fullName}
                draftValue={draft.fullName}
                isEditing={isEditing}
                onChange={updateDraft}
              />
              <ProfileField
                label="Email"
                name="email"
                type="email"
                value={profile.email}
                draftValue={draft.email}
                isEditing={isEditing}
                onChange={updateDraft}
              />
              <ProfileField
                label="Phone"
                name="phone"
                type="tel"
                value={profile.phone}
                draftValue={draft.phone}
                isEditing={isEditing}
                onChange={updateDraft}
              />

              {isEditing ? (
                <div className="mt-5 flex gap-3">
                  <button
                    type="submit"
                    className="min-h-11 flex-1 rounded-md bg-[#6da875] px-4 text-base font-bold text-white hover:bg-[#5d9867]"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="min-h-11 rounded-md border border-[#282c4d] px-4 text-base font-bold text-[#282c4d]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="mt-5 min-h-11 w-full rounded-md bg-[#6da875] text-base font-bold text-white hover:bg-[#5d9867]"
                >
                  Edit
                </button>
              )}
            </form>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={togglePasswordReset}
                className="min-h-11 w-full rounded-md bg-[#282c4d] px-3 text-base font-bold text-white hover:bg-[#1c1f3b]"
              >
                {showPasswordReset ? "Cancel Reset Password" : "Reset Password"}
              </button>

              {showPasswordReset && (
                <form
                  className="space-y-3 rounded border border-neutral-300 p-4"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <label className="block text-sm" htmlFor="current-password">
                    Current Password
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    required
                    value={passwords.current}
                    onChange={(event) =>
                      setPasswords({
                        ...passwords,
                        current: event.target.value,
                      })
                    }
                    className="h-10 w-full rounded border border-neutral-400 px-3 text-sm outline-none focus:border-[#282c4d]"
                  />
                  <label className="block text-sm" htmlFor="new-password">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={passwords.next}
                    onChange={(event) =>
                      setPasswords({ ...passwords, next: event.target.value })
                    }
                    className="h-10 w-full rounded border border-neutral-400 px-3 text-sm outline-none focus:border-[#282c4d]"
                  />
                  <button
                    type="submit"
                    className="min-h-10 w-full rounded-md bg-[#6da875] text-sm font-bold text-white"
                  >
                    Update Password
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => setShowDeletePopup(true)}
                className="min-h-11 w-full rounded-md border border-red-700 bg-white text-sm font-bold text-red-700 hover:bg-red-50"
              >
                Delete My Account
              </button>
            </div>
          </section>

          <section
            aria-label="Account shortcuts"
            className="grid max-w-[420px] grid-cols-2 gap-8"
          >
            <ProfileShortcut icon="bag" label="Your Orders" />
            <ProfileShortcut icon="dollar" label="Recent Transactions" />
            <ProfileShortcut icon="send" label="Your Deliveries" />
          </section>
        </div>
      </main>

      {showDeletePopup && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-5"
          onClick={() => setShowDeletePopup(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-md bg-white p-6 shadow-xl"
          >
            <h2 id="delete-title" className="text-xl font-bold">
              Delete account?
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Are you sure you want to delete this account? This action cannot
              be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeletePopup(false)}
                className="rounded-md border border-[#282c4d] px-4 py-2 text-sm font-bold text-[#282c4d]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowDeletePopup(false)}
                className="rounded-md bg-red-700 px-4 py-2 text-sm font-bold text-white"
              >
                Delete Account
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function ProfileField({
  label,
  name,
  type = "text",
  value,
  draftValue,
  isEditing,
  onChange,
}) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="mb-1 block text-xs lg:text-sm">
        {label}
      </label>
      {isEditing ? (
        <input
          id={name}
          name={name}
          type={type}
          value={draftValue}
          onChange={onChange}
          required
          className="h-10 w-full rounded border border-neutral-400 px-3 text-sm outline-none focus:border-[#282c4d]"
        />
      ) : (
        <p className="h-10 rounded border border-neutral-300 px-3 py-2.5 text-sm text-neutral-600">
          {value}
        </p>
      )}
    </div>
  );
}

function ProfileShortcut({ icon, label }) {
  return (
    <button
      type="button"
      className="flex min-h-[120px] flex-col items-start justify-between rounded border border-neutral-400 bg-white p-5 text-left text-base hover:border-[#282c4d] lg:text-lg"
    >
      <span className="text-4xl leading-7" aria-hidden="true">
        {icon === "dollar" ? "$" : icon === "bag" ? "▢" : "◁"}
      </span>
      <span>{label} &gt;</span>
    </button>
  );
}

export default Profile;
