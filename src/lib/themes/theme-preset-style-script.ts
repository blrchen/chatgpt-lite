import { THEME_STYLE_ELEMENT_ID } from '@/lib/themes/constants'
import { CACHE_KEY } from '@/services/constant'

export const THEME_PRESET_STYLE_SCRIPT = `(function() {
  try {
    document.documentElement.classList.add('theme-loading');
    var css = localStorage.getItem('${CACHE_KEY.THEME_PRESET_CSS}');
    if (!css) return;
    var styleEl = document.getElementById('${THEME_STYLE_ELEMENT_ID}');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = '${THEME_STYLE_ELEMENT_ID}';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  } catch (error) {
    // Ignore errors (e.g., storage disabled)
  }
})();`
