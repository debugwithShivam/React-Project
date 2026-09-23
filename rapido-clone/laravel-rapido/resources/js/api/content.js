// Laravel serves the SPA and API from the same origin in local/production
// installs.  An explicit VITE_API_URL can still be used for a separate API.
const API_URL = import.meta.env.VITE_API_URL || '/api';

export default API_URL;
