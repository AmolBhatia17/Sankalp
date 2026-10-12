export const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const initialsOf = (nameOrEmail = '') => {
  const s = String(nameOrEmail).trim();
  if (!s) return 'U';
  const parts = s.split(/\s+/);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return s[0].toUpperCase();
};
