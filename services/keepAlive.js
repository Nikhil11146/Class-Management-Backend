import https from 'https';
import { RENDER_URL } from '../config/env.js';

export const startKeepAlive = () => {
    const url = RENDER_URL || '';

    if (!url) {
        console.log(`[Keep-Alive] RENDER_URL is not defined. Skipping keep-alive.`);
        return;
    }
    
    // Ping every 14 minutes to keep render alive
    const interval = 14 * 60 * 1000;
    
    console.log(`[Keep-Alive] Initializing keep-alive cron job.`);
    console.log(`[Keep-Alive] Target URL: ${url}`);
    console.log(`[Keep-Alive] Interval: 14 minutes`);
    
    // Initial ping on start to ensure it is working
    sendPing(url);
    
    setInterval(() => {
        sendPing(url);
    }, interval);
};

function sendPing(url) {
    console.log(`[Keep-Alive] Sending ping to ${url}...`);
    https.get(url, (res) => {
        console.log(`[Keep-Alive] Ping successful. Status Code: ${res.statusCode}`);
    }).on('error', (err) => {
        console.error(`[Keep-Alive] Ping failed: ${err.message}`);
    });
}
