import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Save, Plus, Trash2, Eye } from 'lucide-react';
import { Screen, Tone } from '../adminUi';
import api from '../../../api/axios';

const empty = { slug: '', title: '', content_html: '', meta_title: '', meta_description: '', is_published: true };

export default function DynamicPages() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: async () => (await api.get('/admin/pages')).data.pages,
  });

  const save = useMutation({
    mutationFn: async (payload) => (await api.put('/admin/pages', payload)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-pages'] }); setEditing(null); },
  });

  const remove = useMutation({
    mutationFn: async (id) => (await api.delete(`/admin/pages/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-pages'] }),
  });

  return (
    <Screen className="bg-purple-50/60">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-700">CMS</p>
          <h1 className="flex items-center gap-2 text-3xl font-black text-zinc-900"><FileText className="h-7 w-7 text-purple-600" />Dynamic pages</h1>
          <p className="mt-1 text-sm text-zinc-500">Edit Privacy Policy, Terms, About, Contact, Safety, FAQ — these power the public website.</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-purple-700">
          <Plus className="h-4 w-4" /> New page
        </button>
      </div>

      {editing ? (
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }} className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-black">{editing.id ? `Edit ${editing.slug}` : 'New page'}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase text-zinc-500">Slug (URL)</span>
              <input required value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                     disabled={!!editing.id} placeholder="privacy-policy"
                     className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none disabled:bg-zinc-100" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase text-zinc-500">Title</span>
              <input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                     className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none" />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-bold uppercase text-zinc-500">Content (HTML)</span>
            <textarea required rows={14} value={editing.content_html} onChange={(e) => setEditing({ ...editing, content_html: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 font-mono text-xs outline-none" />
          </label>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase text-zinc-500">Meta title</span>
              <input value={editing.meta_title || ''} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })}
                     className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase text-zinc-500">Meta description</span>
              <input value={editing.meta_description || ''} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })}
                     className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none" />
            </label>
          </div>
          <label className="mt-4 flex items-center gap-2">
            <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <span className="text-sm font-bold">Published</span>
          </label>
          <div className="mt-6 flex gap-2">
            <button type="submit" disabled={save.isPending} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50">
              <Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : 'Save page'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-purple-50 text-xs font-black uppercase text-purple-900">
              <tr>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-400">Loading…</td></tr>}
              {!isLoading && pages.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-400">No pages yet.</td></tr>}
              {pages.map((p) => (
                <tr key={p.id} className="border-t border-purple-50 hover:bg-purple-50/40">
                  <td className="px-4 py-3 font-mono text-xs font-bold">/{p.slug}</td>
                  <td className="px-4 py-3 font-bold">{p.title}</td>
                  <td className="px-4 py-3"><Tone value={p.is_published ? 'Active' : 'Draft'} /></td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={async () => { const full = (await api.get(`/admin/pages/${p.slug}`)).data.page; setEditing({ ...full, valid_from: undefined, valid_until: undefined }); }}
                            className="mr-2 inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-bold hover:bg-zinc-200">
                      <Eye className="h-3 w-3" /> Edit
                    </button>
                    <button onClick={() => { if (confirm(`Delete ${p.slug}?`)) remove.mutate(p.id); }}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-200">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Screen>
  );
}
