import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, ChevronUp, CheckCircle, MessageSquare } from 'lucide-react';
import { FAQS } from '../data/mockData';
import { useSiteContent } from '../context/SiteContentContext';

export default function ContactPage() {
  const { content } = useSiteContent();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Ride Issue',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      alert('Please fill all mandatory fields!');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero */}
      <section className="bg-gradient-to-b from-yellow-50/70 via-white to-white py-14 sm:py-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <span className="px-3 py-1 bg-brand-yellow text-brand-dark text-xs font-black uppercase rounded-full">
            24x7 Commuter Support
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            How can we assist you today?
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Got a question regarding a ride, lost an item, or have feedback for our captains? Our support heroes are here for you 24 hours a day, 7 days a week.
          </p>
        </div>
      </section>

      {/* 2. Contact Information Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-brand-dark flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6 text-brand-dark" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">Helpline Support</h4>
              <p className="text-xs text-gray-500 mt-1">Direct rider & captain assistance toll-free.</p>
              <a href={`tel:${content.home.supportPhone.replace(/[^\d+]/g, '')}`} className="text-sm font-black text-brand-dark hover:underline block mt-2">
                {content.home.supportPhone}
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">Email Queries</h4>
              <p className="text-xs text-gray-500 mt-1">Expect a response within 4 working hours.</p>
              <a href={`mailto:${content.home.supportEmail}`} className="text-sm font-black text-brand-dark hover:underline block mt-2">
                {content.home.supportEmail}
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">Corporate HQ</h4>
              <p className="text-xs text-gray-500 mt-1">
                Sawaari Towers, Outer Ring Road, Bellandur, Bangalore 560103.
              </p>
              <span className="text-xs font-semibold text-gray-700 block mt-2">Open Mon-Fri: 9 AM - 6 PM</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Interactive Contact Form & Office Hubs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-md">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Send us a Message</h3>
            <p className="text-xs text-gray-500 mb-6">We'll review your ticket and get back to you promptly.</p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-xl font-bold text-gray-900">Message Received!</h4>
                <p className="text-xs text-gray-600 max-w-sm mx-auto">
                  Thank you, <span className="font-bold">{formData.name}</span>. Your ticket has been logged with ID <span className="font-mono font-bold">#RAP-9281</span>. Our support team will call or email you within 2 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', category: 'Ride Issue', message: '' });
                  }}
                  className="mt-4 px-5 py-2 bg-brand-dark text-brand-yellow font-bold text-xs rounded-xl"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ankit Sharma"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ankit@example.com"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Issue Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    >
                      <option>Ride Fare / Overcharge</option>
                      <option>Lost Item in Vehicle</option>
                      <option>Captain Behavior</option>
                      <option>Captain Registration Query</option>
                      <option>Corporate Partnership</option>
                      <option>General Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Describe Your Issue *</label>
                  <textarea
                    rows="4"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details such as ride date, pickup location, or vehicle plate..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Inquiry
                </button>
              </form>
            )}
          </div>

          {/* Right City Support Centers */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-brand-dark text-white p-6 rounded-3xl space-y-4">
              <h4 className="text-lg font-black text-brand-yellow">Key Regional Hubs</h4>
              <p className="text-xs text-gray-400">
                You can also visit our physical Captain Onboarding & Commuter facilitation hubs directly:
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="border-l-2 border-brand-yellow pl-3">
                  <span className="font-bold text-white block">Bengaluru Tech Park Hub</span>
                  <span className="text-gray-400">Marathahalli - Sarjapur Outer Ring Rd, Bellandur</span>
                </div>
                <div className="border-l-2 border-brand-yellow pl-3">
                  <span className="font-bold text-white block">Delhi NCR Regional Center</span>
                  <span className="text-gray-400">Sector 62, Noida & Cyber City Gurgaon</span>
                </div>
                <div className="border-l-2 border-brand-yellow pl-3">
                  <span className="font-bold text-white block">Mumbai & Pune Hub</span>
                  <span className="text-gray-400">Andheri East, Saki Naka & Viman Nagar Pune</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-200">
              <span className="text-xs font-extrabold text-amber-900 uppercase">Emergency Helpline</span>
              <p className="text-xs text-gray-700 mt-1">
                For immediate in-ride emergencies, police SOS, or medical requirements, dial our priority emergency dispatch desk:
              </p>
              <div className="text-xl font-black text-red-600 mt-2">
                📞 112 / +91-80-6921-9999
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Frequently Asked Questions Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-yellow bg-brand-dark px-3 py-1 rounded-full">
            Knowledge Base
          </span>
          <h2 className="text-3xl font-black text-gray-900 mt-3">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-900">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-brand-dark shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-yellow-50/20">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
