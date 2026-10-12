// Build-time configuration. The deploy workflow (.github/workflows/pages.yml)
// fills googleKey from the GOOGLE_PLACES_KEY repository secret, so the real
// key never lives in git. Leave it empty here.
window.ITACARE_CONFIG = {
  googleKey: '',
};
