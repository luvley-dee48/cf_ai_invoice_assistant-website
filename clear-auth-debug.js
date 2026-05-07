// Debug script to clear corrupted authentication data
// Copy and paste this into your browser console when on the website

console.log('Starting auth cleanup...');

// Clear all possible auth-related localStorage items
const authKeys = [
  'auth_token',
  'auth_user', 
  'token',
  'user',
  'TOKEN_KEY',
  'USER_KEY'
];

authKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log(`Removing ${key}`);
    localStorage.removeItem(key);
  }
});

// Clear sessionStorage as well
sessionStorage.clear();

console.log('Auth cleanup completed. Please refresh the page and try logging in again.');
