const redis = require('redis');
const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    }
});

redisClient.on('connect', () => {
    console.log('Redis connected to ' + process.env.REDIS_HOST + ':' + process.env.REDIS_PORT);
});

redisClient.on('error', (err) => {
    console.error('Redis connection error: ' + err);
});

redisClient.connect().catch(console.error); // Ensure Redis client connects properly

module.exports = redisClient;
