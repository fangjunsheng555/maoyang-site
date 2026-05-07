module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  return res.status(200).json({
    ok: true,
    googleClientId: process.env.GOOGLE_CLIENT_ID || process.env.MAOYANG_GOOGLE_CLIENT_ID || '',
    newUserBonus: Number(process.env.NEW_USER_BONUS || process.env.MAOYANG_NEW_USER_BONUS || 8.88)
  });
};
