export const MAX_PDF_FILE_SIZE = 10 * 1024 * 1024

export const CACHE_KEY = {
  THEME: 'THEME',
  THEME_PRESET_CSS: 'THEME_PRESET_CSS',
  CLEAR_HISTORY_CONFIRM: 'confirm-clear-history',
  CHAT_LIST: 'chatList',
  CHAT_CURRENT_ID: 'chatCurrentID',
  chatMessages: (id: string) => `ms_${id}`
}
