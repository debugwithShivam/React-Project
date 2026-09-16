import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSiteContent } from '../api/content';
import { VEHICLES } from '../data/mockData';

const defaultContent = {
  brand: { name: 'Sawaari', tagline: "Bharat's Smart Commute" },
  navigation: [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Safety', path: '/safety' },
    { name: 'Book a Ride', path: '/book' },
    { name: 'My Rides', path: '/my-rides' },
    { name: 'Contact Us', path: '/contact' }
  ],
  home: {
    heroTitle: 'Beat the traffic. Save time & money.',
    heroDescription: 'Zip through rush-hour traffic on a bike taxi or book guaranteed zero-haggling autos and comfortable cabs across India.',
    supportPhone: '1800-123-4567',
    supportEmail: 'support@rapidoride.com'
  },
  vehicles: VEHICLES
};

const SiteContentContext = createContext({ content: defaultContent, refreshContent: () => {} });

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(defaultContent);

  useEffect(() => {
    fetchSiteContent().then(setContent).catch(() => {});
  }, []);

  const refreshContent = (nextContent) => setContent(nextContent);

  return (
    <SiteContentContext.Provider value={{ content, refreshContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
