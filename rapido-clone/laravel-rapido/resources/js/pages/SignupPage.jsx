import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Bike,
  Shield,
  ArrowRight,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState(searchParams.get('role') === 'captain' ? 'captain' : 'user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    email: '',
    password: '',
    city: 'Bangalore',
    vehicleType: 'bike',
    vehicleModel: 'Hero Splendor Plus',
    vehiclePlate: '',
    drivingLicense: '',
    aadhaarNumber: '',
    payoutUpi: '',
    agreeTerms: true,
  });

  useEffect(() => {
    if (searchParams.get('role') === 'captain') {
      setRole('captain');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullname.trim() || !formData.phone.trim() || !formData.password.trim()) {
      setErrorMessage('Please fill in your name, mobile phone number, and password.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.fullname.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        password: formData.password,
        role: role === 'captain' ? 'DRIVER' : 'USER',
        city: formData.city,
        vehicleType: formData.vehicleType,
        vehicleModel: formData.vehicleModel,
        vehiclePlate: formData.vehiclePlate,
        drivingLicense: formData.drivingLicense,
        aadhaarNumber: formData.aadhaarNumber,
        payoutUpi: formData.payoutUpi,
      });

      setSubmitted(true);
      setTimeout(() => {
        if (role === 'captain') {
          navigate('/my-rides');
        } else {
          navigate('/book');
        }
      }, 2000);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-yellow-50/40 via-white to-gray-50 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12 w-full">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Top Banner */}
        <div className="bg-brand-dark p-5 sm:p-6 text-white text-center">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-brand-yellow rounded-2xl flex items-center justify-center text-brand-dark mx-auto mb-2.5 sm:mb-3 shadow-md">
            <Bike className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {role === 'captain' ? 'Register as Captain Partner' : 'Create Rider Account'}
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
            {role === 'captain'
              ? 'Complete KYC & start earning up to ₹35,000/month'
              : 'Get ₹50 flat discount on your very first ride!'}
          </p>
        </div>

        {/* Role Toggle Switcher */}
        <div className="p-4 sm:p-6 pb-0">
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
                role === 'user'
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              I want to Ride
            </button>
            <button
              type="button"
              onClick={() => setRole('captain')}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
                role === 'captain'
                  ? 'bg-brand-yellow text-brand-dark shadow-sm'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              I want to Drive / Earn
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 sm:p-8 rounded-2xl text-center space-y-3 animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 mx-auto" />
              <h4 className="text-lg sm:text-xl font-black text-gray-900">
                {role === 'captain' ? 'Captain Registered Successfully!' : 'Account Created Successfully!'}
              </h4>
              <p className="text-xs text-gray-600">
                {role === 'captain'
                  ? `Welcome Captain ${formData.fullname}! Your profile has been stored in MySQL and you are ready to accept rides.`
                  : `Welcome to Sawaari, ${formData.fullname}. Redirecting you to instant ride booking...`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="text"
                    required
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    placeholder="e.g. Vikramaditya Singh"
                    className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:bg-white"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">
                  10-Digit Mobile Phone *
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">
                  Create Password * (min 6 characters)
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter a secure password"
                    className="w-full pl-9 pr-10 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-700 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Email & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="vikram@mail.com"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">
                    Operating City
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  >
                    <option>Bangalore</option>
                    <option>Hyderabad</option>
                    <option>Delhi NCR</option>
                    <option>Mumbai</option>
                    <option>Pune</option>
                    <option>Chennai</option>
                    <option>Kolkata</option>
                  </select>
                </div>
              </div>

              {/* DRIVER KYC & VEHICLE DETAILS */}
              {role === 'captain' && (
                <div className="p-3.5 sm:p-4 bg-yellow-50/70 border border-yellow-200 rounded-2xl space-y-3 animate-in fade-in">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase text-brand-dark tracking-wider block">
                    Driver KYC & Vehicle Details
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                        Vehicle Category
                      </label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="bike">Two-Wheeler / Bike Taxi</option>
                        <option value="auto">Three-Wheeler / Auto</option>
                        <option value="cab_economy">Hatchback / Mini Cab</option>
                        <option value="cab_premium">Sedan / Prime Cab</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                        Vehicle Model
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleModel}
                        onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                        placeholder="e.g. Hero Splendor Plus"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                        Plate Number
                      </label>
                      <input
                        type="text"
                        value={formData.vehiclePlate}
                        onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                        placeholder="KA 03 EX 1234"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                        Driving License
                      </label>
                      <input
                        type="text"
                        value={formData.drivingLicense}
                        onChange={(e) => setFormData({ ...formData, drivingLicense: e.target.value })}
                        placeholder="DL-0420110012345"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                      Payout UPI ID (Instant daily payouts)
                    </label>
                    <div className="relative flex items-center">
                      <CreditCard className="w-3.5 h-3.5 text-gray-400 absolute left-2.5" />
                      <input
                        type="text"
                        value={formData.payoutUpi}
                        onChange={(e) => setFormData({ ...formData, payoutUpi: e.target.value })}
                        placeholder="e.g. 9876543210@paytm"
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="agree"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-0.5 accent-brand-dark"
                />
                <label htmlFor="agree" className="text-[10px] sm:text-[11px] text-gray-500 leading-snug">
                  I agree to Sawaari's{' '}
                  <Link to="/terms" className="underline font-semibold text-gray-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="underline font-semibold text-gray-700">
                    Privacy Policy
                  </Link>.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 bg-brand-yellow hover:bg-brand-yellow-hover disabled:opacity-60 text-brand-dark font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{role === 'captain' ? 'Submit Captain Partner Application' : 'Create Free Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Login Link */}
          <div className="text-center pt-3 text-[11px] sm:text-xs text-gray-500 border-t border-gray-100 mt-3">
            Already registered?{' '}
            <Link to="/login" className="text-brand-dark font-bold hover:underline">
              Log In directly →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
