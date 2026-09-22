import React, { useState } from 'react';
import { CheckCircle2, LockKeyhole, Save } from 'lucide-react';
import { Screen } from '../adminUi';
import api from '../../../api/client';
import { useMutation } from '@tanstack/react-query';

export default function AdminPassword() {
  const [form, setForm] = useState({
    current: '',
    next: '',
    confirm: '',
  });

  const passwordMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/changeAdminPassword', {
        currentPassword: form.current,
        newPassword: form.next,
      });

      return response.data;
    },

    onSuccess: () => {
      setSaved(true);

      setForm({
        current: '',
        next: '',
        confirm: '',
      });
    },

    onError: (error) => {
      console.error(
        'CHANGE PASSWORD ERROR:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        'Failed to change password'
      );
    },
  });

  const [saved, setSaved] = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
  };

  const submit = (event) => {
    event.preventDefault();

    if (form.next !== form.confirm) {
      alert('New password and confirm password do not match');
      return;
    }

    passwordMutation.mutate();
  };

  return (
    <Screen className="bg-zinc-50">
      <form
        onSubmit={submit}
        className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-xl bg-brand-yellow p-3 text-brand-dark">
            <LockKeyhole className="h-5 w-5" />
          </span>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              Admin access
            </p>

            <h1 className="text-2xl font-black">
              Change password
            </h1>
          </div>
        </div>

        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Password updated.
          </div>
        )}

        <div className="space-y-4">

          <label className="block text-sm font-bold">
            Current password

            <input
              required
              type="password"
              value={form.current}
              onChange={(event) =>
                update('current', event.target.value)
              }
              className="mt-1 w-full rounded-xl border p-3 font-normal"
            />
          </label>

          <label className="block text-sm font-bold">
            New password

            <input
              required
              minLength={8}
              type="password"
              value={form.next}
              onChange={(event) =>
                update('next', event.target.value)
              }
              className="mt-1 w-full rounded-xl border p-3 font-normal"
            />
          </label>

          <label className="block text-sm font-bold">
            Confirm new password

            <input
              required
              minLength={8}
              type="password"
              value={form.confirm}
              onChange={(event) =>
                update('confirm', event.target.value)
              }
              className="mt-1 w-full rounded-xl border p-3 font-normal"
            />
          </label>

        </div>

        <button
          type="submit"
          disabled={passwordMutation.isPending}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-dark px-4 py-2.5 text-sm font-bold text-brand-yellow disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />

          {passwordMutation.isPending
            ? 'Updating...'
            : 'Update password'}
        </button>
      </form>
    </Screen>
  );
}