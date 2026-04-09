const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

export const escapeHtml = (str: string): string => {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] || char);
};
