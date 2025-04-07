const http = require('http');
const ytdl = require('@distube/ytdl-core');

console.log(`[${new Date().toISOString()}] Starting server initialization...`);

const requestHandler = async (req, res) => {
    console.log(`[${new Date().toISOString()}] Received request: ${req.method} ${req.url}`);
    if (req.url.startsWith('/stream?url=')) {
        const youtubeUrl = decodeURIComponent(req.url.split('/stream?url=')[1]);
        console.log(`[${new Date().toISOString()}] Processing stream request for: ${youtubeUrl}`);

        try {
            if (!ytdl.validateURL(youtubeUrl)) {
                throw new Error('Invalid YouTube URL.');
            }

            console.log(`[${new Date().toISOString()}] Starting ytdl stream...`);
            const stream = ytdl(youtubeUrl, {
                filter: 'videoonly',
                quality: 'highestvideo',
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.0.0 Safari/537.36',
                        'Accept': '*/*',
                        'Referer': 'https://www.youtube.com/'
                    }
                }
            });

            res.writeHead(200, {
                'Content-Type': 'video/mp4',
                'Access-Control-Allow-Origin': '*'
            });
            stream.pipe(res);

            stream.on('error', (err) => {
                console.error(`[${new Date().toISOString()}] Stream error: ${err.message}`);
                if (!res.headersSent) {
                    res.writeHead(500, { 