const routes = {
  'auth-config': require('../lib/account/auth-config.js'),
  'auth-register': require('../lib/account/auth-register.js'),
  'auth-login': require('../lib/account/auth-login.js'),
  'auth-google': require('../lib/account/auth-google.js'),
  'auth-code': require('../lib/account/auth-code.js'),
  'auth-reset': require('../lib/account/auth-reset.js'),
  'auth-logout': require('../lib/account/auth-logout.js'),
  'user-me': require('../lib/account/user-me.js'),
  'user-redeem': require('../lib/account/user-redeem.js'),
  'redeem-preview': require('../lib/account/redeem-preview.js'),
  'user-withdraw': require('../lib/account/user-withdraw.js'),
  'admin-users': require('../lib/account/admin-users.js'),
  'admin-user-update': require('../lib/account/admin-user-update.js')
};

function routeName(req) {
  const queryRoute = req.query && req.query.route;
  const route = Array.isArray(queryRoute) ? queryRoute[0] : queryRoute;
  if (route) return String(route).replace(/[^a-z0-9-]/gi, '');
  try {
    const url = new URL(req.url || '', 'https://joinvip.vip');
    return String(url.searchParams.get('route') || '').replace(/[^a-z0-9-]/gi, '');
  } catch (error) {
    return '';
  }
}

module.exports = async function handler(req, res) {
  const name = routeName(req);
  const route = routes[name];
  if (!route) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(404).json({ ok: false, error: 'account_route_not_found' });
  }
  return route(req, res);
};
