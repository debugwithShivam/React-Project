import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { X, FileText, Code2 } from 'lucide-react';
import VITE_API_URL from '../../config/backend_API_URL';

const DEFAULTS = {
  content: "",
  html: "<!-- Write HTML -->",
  css: "/* Write CSS */",
  javascript: 'console.log("Hello")',
};

export default function ViewNotes() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(null);

  async function getNotesData(id) {
    try {
      const response = await axios.get(
        `${VITE_API_URL}/authRouter/noteDataGetById/${id}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      console.log(error);
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ['viewNotes', id],
    queryFn: () => getNotesData(id),
    enabled: !!id,
  });

  const contentVal = data?.content ?? '';
  const htmlVal = data?.html ?? '';
  const cssVal = data?.css ?? '';
  const jsVal = data?.javascript ?? '';

  const availableTabs = useMemo(() => {
    const tabs = [];
    if (contentVal.trim() !== DEFAULTS.content.trim())
      tabs.push({ key: 'content', label: 'Note', icon: <FileText size={13} /> });
    if (htmlVal.trim() !== DEFAULTS.html.trim())
      tabs.push({ key: 'html', label: 'HTML', icon: <Code2 size={13} /> });
    if (cssVal.trim() !== DEFAULTS.css.trim())
      tabs.push({ key: 'css', label: 'CSS', icon: <Code2 size={13} /> });
    if (jsVal.trim() !== DEFAULTS.javascript.trim())
      tabs.push({ key: 'javascript', label: 'JS', icon: <Code2 size={13} /> });
    return tabs;
  }, [contentVal, htmlVal, cssVal, jsVal]);

  useEffect(() => {
    if (availableTabs.length > 0) setActiveTab(availableTabs[0].key);
  }, [availableTabs]);

  const contentMap = { content: contentVal, html: htmlVal, css: cssVal, javascript: jsVal };

  const handleClose = () => {
    window.electron?.closeNoteWindow?.();
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-yellow-200">
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-b from-yellow-200 to-yellow-300 relative overflow-hidden rounded-xl shadow-2xl">

      <div className="absolute -top-2 left-6 w-4 h-4 bg-yellow-500 rounded-full shadow-md rotate-12 no-drag" />

      <div className="drag-region flex justify-end p-2">
        <button
          onClick={handleClose}
          className="no-drag p-1.5 rounded-full bg-yellow-100/70 hover:bg-yellow-100 transition"
          title="Close"
        >
          <X size={16} className="text-gray-700" />
        </button>
      </div>

      <div className="drag-region px-4 pb-1">
        <h1 className="font-bold text-gray-900 text-base truncate">
          {data?.title || "Untitled"}
        </h1>
      </div>

      {availableTabs.length > 1 && (
        <div className="no-drag flex gap-2 px-4 pt-1 pb-2 flex-wrap">
          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition ${
                activeTab === tab.key
                  ? 'bg-yellow-500 text-white font-semibold'
                  : 'bg-yellow-100/70 text-gray-700 hover:bg-yellow-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="no-drag flex-1 overflow-auto px-4 pb-4 hide-scrollbar">
        {activeTab === 'content' && (
          <p className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
            {contentVal}
          </p>
        )}

        {(activeTab === 'html' || activeTab === 'css' || activeTab === 'javascript') && (
          <pre className="whitespace-pre-wrap text-xs bg-white/50 rounded-lg p-3 font-mono text-gray-800">
            {contentMap[activeTab]}
          </pre>
        )}

        {availableTabs.length === 0 && (
          <p className="text-sm text-gray-500 italic">This note is empty.</p>
        )}
      </div>

      <div className="drag-region px-4 pb-3 text-right">
        <span className="text-[11px] text-gray-600">
          {data?.updatedAt
            ? new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''}
        </span>
      </div>
    </div>
  );
}