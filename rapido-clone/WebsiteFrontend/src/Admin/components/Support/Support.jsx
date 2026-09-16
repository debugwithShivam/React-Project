import React, { useState } from 'react';
import { Initials, Screen, Tone } from '../adminUi';

const tickets = [
  { id: '#SUP-9281', who: 'Aarav Mehta', role: 'Rider', subject: 'Lost item after ride', priority: 'Urgent', status: 'Pending', messages: [{ from: 'Aarav', text: 'I left a black backpack in the bike boot.' }, { from: 'Neha', text: 'Checking with Captain Ramesh now.' }] },
  { id: '#SUP-9280', who: 'Captain Ramesh', role: 'Captain', subject: 'Payout clarification', priority: 'Normal', status: 'Ongoing', messages: [{ from: 'Ramesh', text: 'Yesterday’s night bonus is missing.' }] },
  { id: '#SUP-9279', who: 'Pooja Verma', role: 'Rider', subject: 'Promo code issue', priority: 'Low', status: 'Resolved', messages: [{ from: 'Pooja', text: 'WELCOME did not apply.' }, { from: 'Neha', text: 'Refunded ₹25 to wallet.' }] }
];

export default function Support() {
  const [active, setActive] = useState(tickets[0]);

  return (
    <Screen className="bg-stone-100">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Care desk</p>
        <h1 className="text-3xl font-black">Support inbox</h1>
      </div>

      <div className="grid min-h-[620px] overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-card lg:grid-cols-[320px_1fr]">
        <aside className="border-r border-stone-100">
          {tickets.map((ticket) => (
            <button key={ticket.id} type="button" onClick={() => setActive(ticket)} className={`block w-full border-b border-stone-100 p-4 text-left ${active.id === ticket.id ? 'bg-stone-50' : ''}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-stone-400">{ticket.id}</p>
                <Tone value={ticket.status === 'Pending' && ticket.priority === 'Urgent' ? 'Urgent' : ticket.status} />
              </div>
              <p className="mt-1 font-black">{ticket.subject}</p>
              <p className="text-xs font-semibold text-stone-500">{ticket.who} · {ticket.role}</p>
            </button>
          ))}
        </aside>
        <section className="flex flex-col">
          <div className="flex items-center gap-3 border-b border-stone-100 p-4">
            <Initials name={active.who} className="bg-stone-800 text-white" />
            <div>
              <p className="font-black">{active.subject}</p>
              <p className="text-xs text-stone-500">{active.who} · {active.priority} priority</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 bg-stone-50 p-4">
            {active.messages.map((message, index) => (
              <div key={index} className={`max-w-md rounded-2xl px-4 py-3 text-sm ${message.from === 'Neha' ? 'ml-auto bg-zinc-900 text-white' : 'bg-white shadow-sm'}`}>
                <p className="text-[10px] font-black uppercase opacity-60">{message.from}</p>
                <p className="mt-1">{message.text}</p>
              </div>
            ))}
          </div>
          <form className="flex gap-2 border-t border-stone-100 p-4" onSubmit={(event) => event.preventDefault()}>
            <input className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none" placeholder="Reply to ticket..." />
            <button type="submit" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white">Send</button>
          </form>
        </section>
      </div>
    </Screen>
  );
}
