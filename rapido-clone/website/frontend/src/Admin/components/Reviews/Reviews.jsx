import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Initials, Screen, Tone } from '../adminUi';

const reviews = [
  { customer: 'Aarav Mehta', ride: 'SW-10428', rating: 5, comment: 'Clean bike and polite captain. Reached before ETA.', status: 'Resolved' },
  { customer: 'Meera Shah', ride: 'SW-10420', rating: 2, comment: 'Pickup was delayed by 12 minutes in rain.', status: 'Pending' },
  { customer: 'Pooja Verma', ride: 'SW-10417', rating: 5, comment: 'Smooth auto ride, transparent fare.', status: 'Resolved' },
  { customer: 'Rahul Sharma', ride: 'SW-10411', rating: 3, comment: 'Captain took a longer route to airport.', status: 'Pending' },
  { customer: 'Nikhil Jain', ride: 'SW-10405', rating: 1, comment: 'Captain cancelled after arriving.', status: 'Urgent' }
];

export default function Reviews() {
  const [min, setMin] = useState(0);
  const visible = min === 3 ? reviews.filter((item) => item.rating <= 3) : min === 0 ? reviews : reviews.filter((item) => item.rating >= min);

  return (
    <Screen className="bg-yellow-50">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Quality</p>
          <h1 className="text-3xl font-black">Ride reviews</h1>
        </div>
        <div className="flex gap-2">
          {[
            [0, 'All'],
            [5, '5 star'],
            [3, 'Low ratings']
          ].map(([value, label]) => (
            <button key={label} type="button" onClick={() => setMin(value)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${min === value ? 'bg-zinc-900 text-white' : 'bg-white'}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((review) => (
          <article key={review.ride} className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Initials name={review.customer} className="bg-amber-200 text-amber-900" />
                <div>
                  <p className="font-black">{review.customer}</p>
                  <p className="text-xs font-semibold text-zinc-500">{review.ride}</p>
                </div>
              </div>
              <Tone value={review.status} />
            </div>
            <div className="mt-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={`h-4 w-4 ${index < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-700">{review.comment}</p>
          </article>
        ))}
      </div>
    </Screen>
  );
}
