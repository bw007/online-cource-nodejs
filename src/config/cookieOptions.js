/**
 * Returns cookie settings.
 * If rememberMe is true, cookie lasts 30 days. Otherwise, 7 days.
 *
 * @param {boolean} [rememberMe=false] - If the user wants to stay logged in
 * @returns {Object} - Cookie options (httpOnly, secure, sameSite, path, maxAge)
 */
const getCookieOptions = (rememberMe = false) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000
});

/**
 * Returns cookie settings without maxAge.
 * Used to clear the cookie.
 *
 * @returns {Object} - Cookie options without maxAge
 */
const getClearCookieOptions = () => {
  const options = getCookieOptions();
  delete options.maxAge;
  return options;
}

module.exports = {
  getCookieOptions,
  getClearCookieOptions
};