import React, { useState } from "react";

export default function Password() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    console.log("PASSWORD DATA:", formData);
  };

  return (
    <div className="p-6">
      <div className="max-w-xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-black text-brand-dark">
          Change Password
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update your admin account password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          <div>
            <label className="mb-1 block text-sm font-bold">
              Current Password
            </label>

            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-yellow"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">
              New Password
            </label>

            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-yellow"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">
              Confirm New Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-yellow"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-brand-yellow py-3 font-black text-brand-dark hover:bg-brand-yellow-hover"
          >
            Change Password
          </button>

        </form>
      </div>
    </div>
  );
}