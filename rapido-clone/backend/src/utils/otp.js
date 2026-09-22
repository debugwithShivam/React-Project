export const generateRideOtp = () => String(Math.floor(1000 + Math.random() * 9000));

export const generateReferralCode = (name = '') => {
    const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'SAW';
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `${prefix}${suffix}`;
};

export const generateReferenceNumber = (prefix = 'TXN') =>
    `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
