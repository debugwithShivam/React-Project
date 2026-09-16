import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const translations = {
  en: {
    translation: {
      adminWorkspace: 'Admin workspace',
      export: 'Export',
      addRecord: 'Add Record',
      searchRecords: 'Search records...',
      all: 'All',
      records: 'records',
      noRecords: 'No records found.',
      saveChanges: 'Save Changes',
      language: 'Language',
      nav: { Dashboard: 'Dashboard', AllBookRide: 'All Booked Rides', Captains: 'Captains', CitiesZones: 'Cities & Zones', CouponsOffers: 'Coupons & Offers', Customers: 'Customers', DriverDocuments: 'Driver Documents', Drivers: 'Drivers', DriverRideHistory: 'Driver Ride History', Notifications: 'Notifications', Payments: 'Payments', Pricing: 'Pricing', Reports: 'Reports', Revenue: 'Revenue', Refunds: 'Refunds', Reviews: 'Reviews', Rides: 'Rides', RiderHistory: 'Rider History', ScheduledCabs: 'Scheduled Cabs', CustomCabs: 'Custom Cab', Settings: 'Settings', StaffRoles: 'Staff & Roles', Support: 'Support', Wallet: 'Wallet', Password: 'Password' },
      status: { Active: 'Active', Completed: 'Completed', Approved: 'Approved', Paid: 'Paid', Resolved: 'Resolved', Pending: 'Pending', Scheduled: 'Scheduled', Ongoing: 'Ongoing', Rejected: 'Rejected', Inactive: 'Inactive' }
    }
  },
  hi: {
    translation: {
      adminWorkspace: 'एडमिन कार्यक्षेत्र',
      export: 'एक्सपोर्ट',
      addRecord: 'रिकॉर्ड जोड़ें',
      searchRecords: 'रिकॉर्ड खोजें...',
      all: 'सभी',
      records: 'रिकॉर्ड',
      noRecords: 'कोई रिकॉर्ड नहीं मिला।',
      saveChanges: 'परिवर्तन सेव करें',
      language: 'भाषा',
      nav: { Dashboard: 'डैशबोर्ड', AllBookRide: 'सभी बुक की गई राइड', Captains: 'कैप्टन', CitiesZones: 'शहर और ज़ोन', CouponsOffers: 'कूपन और ऑफर', Customers: 'ग्राहक', DriverDocuments: 'ड्राइवर दस्तावेज़', Drivers: 'ड्राइवर', Notifications: 'नोटिफिकेशन', Payments: 'पेमेंट', Pricing: 'किराया और नियम', Reports: 'रिपोर्ट', Revenue: 'कमाई', Reviews: 'रिव्यू', Rides: 'राइड ऑपरेशन', Settings: 'सेटिंग्स', StaffRoles: 'स्टाफ और भूमिकाएं', Support: 'सपोर्ट' },
      status: { Active: 'सक्रिय', Completed: 'पूरा हुआ', Approved: 'स्वीकृत', Paid: 'भुगतान हुआ', Resolved: 'हल किया गया', Pending: 'लंबित', Scheduled: 'शेड्यूल्ड', Ongoing: 'जारी', Rejected: 'अस्वीकृत', Inactive: 'निष्क्रिय' }
      , 'Operations Dashboard': 'ऑपरेशन डैशबोर्ड', 'All Booked Rides': 'सभी बुक की गई राइड', 'Captain Partners': 'कैप्टन पार्टनर', 'Cities & Zones': 'शहर और ज़ोन', 'Coupons & Offers': 'कूपन और ऑफर', Customers: 'ग्राहक', 'Driver Documents': 'ड्राइवर दस्तावेज़', Notifications: 'नोटिफिकेशन', Payments: 'पेमेंट', 'Pricing & Fare Rules': 'किराया और नियम', Reports: 'रिपोर्ट', Revenue: 'कमाई', Reviews: 'रिव्यू', 'Ride Operations': 'राइड ऑपरेशन', 'Staff & Roles': 'स्टाफ और भूमिकाएं', 'Support Desk': 'सपोर्ट डेस्क', 'Website Content': 'वेबसाइट कंटेंट',
      'A live overview of rides, customers, captains and platform health.': 'राइड, ग्राहक, कैप्टन और प्लेटफॉर्म की स्थिति का लाइव सारांश।', 'Monitor every ride request, assignment and current trip status.': 'हर राइड रिक्वेस्ट, असाइनमेंट और वर्तमान ट्रिप की स्थिति देखें।', 'Review captain activity, availability, ratings and onboarding status.': 'कैप्टन की गतिविधि, उपलब्धता, रेटिंग और ऑनबोर्डिंग स्थिति देखें।', 'Control operating cities, service coverage and zone availability.': 'ऑपरेटिंग शहर, सर्विस कवरेज और ज़ोन उपलब्धता नियंत्रित करें।', 'Create and monitor discounts, campaign limits and redemption activity.': 'डिस्काउंट, कैंपेन लिमिट और रिडेम्पशन गतिविधि प्रबंधित करें।', 'Manage rider profiles, ride activity and account status.': 'राइडर प्रोफाइल, राइड गतिविधि और अकाउंट स्थिति प्रबंधित करें।', 'Verify KYC documents before captains can accept rides.': 'कैप्टन के राइड लेने से पहले KYC दस्तावेज़ सत्यापित करें।', 'Send rider, captain and operational announcements from one place.': 'राइडर, कैप्टन और ऑपरेशन नोटिफिकेशन एक जगह से भेजें।', 'Track collections, refunds, settlements and payment failures.': 'कलेक्शन, रिफंड, सेटलमेंट और असफल पेमेंट देखें।', 'Review operational performance and download business reports.': 'ऑपरेशनल प्रदर्शन देखें और बिजनेस रिपोर्ट डाउनलोड करें।', 'Track platform earnings, captain payouts and financial trends.': 'प्लेटफॉर्म कमाई, कैप्टन पेआउट और वित्तीय ट्रेंड देखें।', 'Monitor rider feedback and resolve low-rated ride experiences.': 'राइडर फीडबैक देखें और कम रेटिंग वाली समस्याएं हल करें।', 'Manage active rides and review the complete trip lifecycle.': 'चल रही राइड प्रबंधित करें और पूरी ट्रिप प्रक्रिया देखें।', 'Review vehicle base fares, per-kilometre rates and active pricing rules.': 'वाहन बेस किराया, प्रति किलोमीटर दर और सक्रिय नियम देखें।', 'Control internal admin access and permissions.': 'आंतरिक एडमिन एक्सेस और अनुमतियां नियंत्रित करें।', 'Resolve customer and captain support tickets with clear ownership.': 'ग्राहक और कैप्टन सपोर्ट टिकट स्पष्ट जिम्मेदारी के साथ हल करें।'
    }
  }
};

const savedLanguage = localStorage.getItem('admin-language') || 'en';

i18n.use(initReactI18next).init({
  resources: translations,
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
