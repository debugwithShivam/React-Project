import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const allowedTags = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'STRONG', 'B', 'EM', 'I', 'U', 'A', 'BR', 'BLOCKQUOTE', 'HR', 'SPAN', 'DIV']);

function sanitizeCmsHtml(html) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  const clean = (root) => {
    [...root.children].forEach((node) => {
      if (!allowedTags.has(node.tagName)) {
        clean(node);
        node.replaceWith(...node.childNodes);
        return;
      }
      [...node.attributes].forEach((attr) => {
        if (node.tagName !== 'A' || !['href', 'target', 'rel'].includes(attr.name.toLowerCase())) node.removeAttribute(attr.name);
      });
      if (node.tagName === 'A') {
        const href = node.getAttribute('href') || '';
        if (!/^(https?:|mailto:)/i.test(href)) node.removeAttribute('href');
        node.setAttribute('rel', 'noopener noreferrer');
      }
      clean(node);
    });
  };
  clean(doc.body);
  return doc.body.innerHTML;
}

export default function CmsLegalPage({ slug, fallbackTitle, eyebrow }) {
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api.get(`/pages/${slug}`).then(({ data }) => { if (active) setPage(data.page); })
      .catch(() => { if (active) setError('This page is not published yet. Please check back later.'); });
    return () => { active = false; };
  }, [slug]);
  return <div className="bg-gray-50 min-h-screen py-10 sm:py-16">
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm mb-8">
        <p className="text-xs font-black uppercase tracking-wider text-amber-700">{eyebrow}</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black text-gray-900">{page?.title || fallbackTitle}</h1>
        {page?.updated_at && <p className="mt-3 text-xs text-gray-500">Last updated {new Date(page.updated_at).toLocaleDateString()}</p>}
      </header>
      <article className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm text-sm text-gray-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-7 [&_h2]:mb-3 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-amber-700 [&_a]:underline">
        {error ? <p className="text-gray-500">{error}</p> : page ? <div dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(page.content_html) }} /> : <p className="text-gray-400">Loading…</p>}
      </article>
    </main>
  </div>;
}
