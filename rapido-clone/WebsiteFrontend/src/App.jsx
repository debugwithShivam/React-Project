import React, { useEffect } from 'react';
import {
  createHashRouter,
  Link,
  Outlet,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import AboutPage from './pages/AboutPage';
import SafetyPage from './pages/SafetyPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RidesHistoryPage from './pages/RidesHistoryPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import Admin from './Admin/Admin';
import AllBookRide from './Admin/pages/AllBookRide';
import Captains from './Admin/pages/Captains';
import CitiesZones from './Admin/pages/CitiesZones';
import CouponsOffers from './Admin/pages/CouponsOffers';
import Dashboard from './Admin/pages/Dashboard';
import DriverDocuments from './Admin/pages/DriverDocuments';
import Drivers from './Admin/pages/Drivers';
import Notifications from './Admin/pages/Notifications';
import Payments from './Admin/pages/Payments';
import Pricing from './Admin/pages/Pricing';
import Reports from './Admin/pages/Reports';
import Revenue from './Admin/pages/Revenue';
import Rides from './Admin/pages/Rides';
import Settings from './Admin/pages/Settings';
import StaffRoles from './Admin/pages/StaffRoles';
import Support from './Admin/pages/Support';
import Customers from './Admin/pages/Customers';
import Reviews from './Admin/pages/Reviews';
import Wallet from './Admin/pages/Wallet';
import ScheduledCabs from './Admin/pages/ScheduledCabs';
import CustomCabs from './Admin/pages/CustomCabs';
import RiderHistory from './Admin/pages/RiderHistory';
import DriverRideHistory from './Admin/pages/DriverRideHistory';
import Refunds from './Admin/pages/Refunds';
import Password from './Admin/pages/Password';
import { SiteContentProvider } from './context/SiteContentContext';
// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// 404 Fallback
function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="text-6xl font-black text-brand-dark mb-4">404</div>
      <h2 className="text-2xl font-bold text-gray-800">Page Not Found</h2>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        The destination you are looking for does not exist or may have been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-brand-yellow text-brand-dark font-black rounded-xl text-xs shadow-md hover:bg-brand-yellow-hover"
      >
        Return to Home
      </Link>
    </div>
  );
}

function AppLayout() {
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-white text-gray-900 w-full overflow-x-hidden">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'book', element: <BookingPage /> },
      { path: 'my-rides', element: <RidesHistoryPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'safety', element: <SafetyPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'privacy', element: <PrivacyPolicyPage /> },
      { path: 'terms', element: <TermsConditionsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
        path: 'Admin',
        element: <Admin />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'Dashboard', element: <Dashboard /> },
          { path: 'AllBookRide', element: <AllBookRide /> },
          { path: 'Captains', element: <Captains /> },
          { path: 'CitiesZones', element: <CitiesZones /> },
          { path: 'CouponsOffers', element: <CouponsOffers /> },
          { path: 'Customers', element: <Customers /> },
          { path: 'DriverDocuments', element: <DriverDocuments /> },
          { path: 'Drivers', element: <Drivers /> },
          { path: 'Notifications', element: <Notifications /> },
          { path: 'Payments', element: <Payments /> },
          { path: 'Pricing', element: <Pricing /> },
          { path: 'Reports', element: <Reports /> },
          { path: 'Revenue', element: <Revenue /> },
          { path: 'Reviews', element: <Reviews /> },
          { path: 'Rides', element: <Rides /> },
          { path: 'ScheduledCabs', element: <ScheduledCabs /> },
          { path: 'CustomCabs', element: <CustomCabs /> },
          { path: 'RiderHistory', element: <RiderHistory /> },
          { path: 'DriverRideHistory', element: <DriverRideHistory /> },
          { path: 'Wallet', element: <Wallet /> },
          { path: 'Refunds', element: <Refunds /> },
          { path: 'Settings', element: <Settings /> },
          { path: 'Password', element: <Password /> },
          { path: 'StaffRoles', element: <StaffRoles /> },
          { path: 'Support', element: <Support /> },
        ],
      },
]);

export default function App() {
  return (
    <SiteContentProvider>
      <RouterProvider router={router} />
    </SiteContentProvider>
  );
}
