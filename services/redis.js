const redis = require('redis');
const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
});

redisClient.on('connect', () => {
    console.log('Redis connected to ' + process.env.REDIS_URL);
});

redisClient.on('error', (err) => {
    console.error('Redis connection error: ' + err);
});

redisClient.connect().catch(console.error); // Ensure Redis client connects properly

module.exports = redisClient;
