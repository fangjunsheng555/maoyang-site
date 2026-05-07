const ORDERS_KEY = 'maoyang:orders';
const USERS_KEY = 'maoyang:users';
const CODES_KEY = 'maoyang:redeem-codes';
const WITHDRAWALS_KEY = 'maoyang:withdrawals';

function envFirst(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return '';
}

function redisConfig() {
  const url = envFirst('KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL');
  const token = envFirst('KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

function redisUrl(redis, parts) {
  return redis.url + '/' + parts.map((part) => encodeURIComponent(String(part))).join('/');
}

async function redisPipeline(redis, commands) {
  const response = await fetch(redis.url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + redis.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  let data = null;
  try { data = await response.json(); } catch (error) {}
  if (!response.ok || !Array.isArray(data) || data.some((item) => item && item.error)) {
    const err = new Error('storage_write_failed');
    err.detail = data;
    throw err;
  }
  return data;
}

async function readList(redis, key, limit = 500) {
  const response = await fetch(redisUrl(redis, ['lrange', key, '0', String(Math.max(0, limit - 1))]), {
    headers: { Authorization: 'Bearer ' + redis.token }
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error('storage_read_failed');
  return Array.isArray(data.result)
    ? data.result.map((item) => { try { return JSON.parse(item); } catch (error) { return null; } }).filter(Boolean)
    : [];
}

async function writeList(redis, key, list) {
  const commands = [['DEL', key]];
  if (Array.isArray(list) && list.length > 0) commands.push(['RPUSH', key, ...list.map((item) => JSON.stringify(item))]);
  await redisPipeline(redis, commands);
  return true;
}

async function pushOrder(redis, order, limit = 199) {
  await redisPipeline(redis, [['LPUSH', ORDERS_KEY, JSON.stringify(order)], ['LTRIM', ORDERS_KEY, '0', String(limit)]]);
  return true;
}

async function pushOrderAndWriteUsers(redis, order, users, limit = 199) {
  const commands = [['LPUSH', ORDERS_KEY, JSON.stringify(order)], ['LTRIM', ORDERS_KEY, '0', String(limit)], ['DEL', USERS_KEY]];
  if (Array.isArray(users) && users.length > 0) commands.push(['RPUSH', USERS_KEY, ...users.map((user) => JSON.stringify(user))]);
  await redisPipeline(redis, commands);
  return true;
}

async function readOrders(redis, limit = 500) { return readList(redis, ORDERS_KEY, limit); }
async function writeOrders(redis, orders) { return writeList(redis, ORDERS_KEY, orders); }
async function readUsers(redis, limit = 1000) { return readList(redis, USERS_KEY, limit); }
async function writeUsers(redis, users) { return writeList(redis, USERS_KEY, users); }
async function readCodes(redis, limit = 1000) { return readList(redis, CODES_KEY, limit); }
async function writeCodes(redis, codes) { return writeList(redis, CODES_KEY, codes); }
async function readWithdrawals(redis, limit = 1000) { return readList(redis, WITHDRAWALS_KEY, limit); }
async function writeWithdrawals(redis, withdrawals) { return writeList(redis, WITHDRAWALS_KEY, withdrawals); }

async function writeUsersCodesOrders(redis, users, codes, orders) {
  const commands = [['DEL', USERS_KEY], ['DEL', CODES_KEY], ['DEL', ORDERS_KEY]];
  if (users.length > 0) commands.push(['RPUSH', USERS_KEY, ...users.map((item) => JSON.stringify(item))]);
  if (codes.length > 0) commands.push(['RPUSH', CODES_KEY, ...codes.map((item) => JSON.stringify(item))]);
  if (orders.length > 0) commands.push(['RPUSH', ORDERS_KEY, ...orders.map((item) => JSON.stringify(item))]);
  await redisPipeline(redis, commands);
  return true;
}

async function writeUsersWithdrawals(redis, users, withdrawals) {
  const commands = [['DEL', USERS_KEY], ['DEL', WITHDRAWALS_KEY]];
  if (users.length > 0) commands.push(['RPUSH', USERS_KEY, ...users.map((item) => JSON.stringify(item))]);
  if (withdrawals.length > 0) commands.push(['RPUSH', WITHDRAWALS_KEY, ...withdrawals.map((item) => JSON.stringify(item))]);
  await redisPipeline(redis, commands);
  return true;
}

module.exports = {
  ORDERS_KEY, USERS_KEY, CODES_KEY, WITHDRAWALS_KEY,
  envFirst, redisConfig, redisPipeline, readList, writeList,
  readOrders, writeOrders, readUsers, writeUsers, readCodes, writeCodes, readWithdrawals, writeWithdrawals,
  pushOrder, pushOrderAndWriteUsers, writeUsersCodesOrders, writeUsersWithdrawals
};
