import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bike, Shield, Phone, ArrowRight, Lock, CheckCircle2, User, KeyRound } from 'lucide-react';
import logo from '../image/titlelogo.jpeg'
export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // 'user' | 'captain'
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'email'

  const [phone, setPhone] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['1', '2', '3', '4']);
  
  const [email, setEmail] = useState('commuter@example.com');
  const [password, setPassword] = useState('password123');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
    }, 600);
  };

  const handleVerifyLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(`Welcome back! Successfully logged in as ${role === 'captain' ? 'Captain' : 'Rider'}.`);
      setTimeout(() => {
        navigate('/book');
      }, 1000);
    }, 800);
  };

  const handleDemoLogin = (targetRole) => {
    setRole(targetRole);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(`Demo Login Success: Logged in as ${targetRole === 'captain' ? 'Captain' : 'Commuter Rider'}!`);
      setTimeout(() => {
        navigate('/book');
      }, 800);
    }, 500);
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-yellow-50/40 via-white to-gray-50 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12 w-full">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-brand-dark p-5 sm:p-6 text-white text-center relative">
          <div className="w-11 h-11 sm:w-12 sm:h-12  rounded-2xl flex items-center justify-center text-brand-dark mx-auto mb-2.5 sm:mb-3 shadow-md">
            <img src={logo} className='rounded-full' alt="" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Log in to Sawaari</h2>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
            Access fast rides, exclusive cashback & saved destinations
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="p-4 sm:p-6 pb-0">
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => { setRole('user'); setOtpSent(false); }}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
                role === 'user'
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Rider / Commuter
            </button>
            <button
              type="button"
              onClick={() => { setRole('captain'); setOtpSent(false); }}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
                role === 'captain'
                  ? 'bg-brand-yellow text-brand-dark shadow-sm'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Captain (Driver)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Toggle between Phone OTP and Email */}
          <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-2">
            <span className="font-semibold text-[11px] sm:text-xs">Method:</span>
            <div className="space-x-2.5 sm:space-x-3 text-[11px] sm:text-xs">
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`font-bold transition-colors ${loginMethod === 'phone' ? 'text-brand-dark underline' : 'hover:text-black'}`}
              >
                Phone OTP
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`font-bold transition-colors ${loginMethod === 'email' ? 'text-brand-dark underline' : 'hover:text-black'}`}
              >
                Email / Password
              </button>
            </div>
          </div>

          {loginMethod === 'phone' ? (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5 sm:space-y-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 sm:py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs font-bold text-gray-700">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-r-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 sm:py-3.5 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {isLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyLogin} className="space-y-3.5 sm:space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      Enter OTP sent to +91 {phone}
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex gap-2 sm:gap-3 justify-center py-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const newOtp = [...otp];
                          newOtp[i] = e.target.value;
                          setOtp(newOtp);
                        }}
                        className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow outline-none"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-gray-400 text-center block">
                    (Demo Default Code: 1234)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 sm:py-3.5 bg-brand-dark hover:bg-black text-brand-yellow font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP & Continue'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleVerifyLogin} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-3.5 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark font-black rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {isLoading ? 'Signing In...' : 'Sign In with Email'}
              </button>
            </form>
          )}

          {/* Quick Demo Login Shortcut */}
          <div className="pt-2 border-t border-gray-100 text-center">
            <span className="text-[10px] sm:text-[11px] text-gray-400 block mb-2">⚡ Quick 1-Click Evaluation:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('user')}
                className="w-1/2 py-2 bg-yellow-50 hover:bg-yellow-100 text-brand-dark font-bold text-[10px] sm:text-[11px] rounded-lg border border-yellow-200 transition-colors active:scale-95 truncate px-1"
              >
                Login as Rider
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('captain')}
                className="w-1/2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[10px] sm:text-[11px] rounded-lg border border-gray-200 transition-colors active:scale-95 truncate px-1"
              >
                Login as Captain
              </button>
            </div>
          </div>

          {/* Signup Link */}
          <div className="text-center pt-2 text-[11px] sm:text-xs text-gray-500">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-brand-dark font-bold hover:underline">
              Create New Account →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
