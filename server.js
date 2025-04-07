const http = require('http');
const ytdl = require('@distube/ytdl-core');

console.log(`[${new Date().toISOString()}] Server process starting...`);

const requestHandler = (req, res) => {
    console.log(`[${new Date().toISOString()}] Request received: ${req.method} ${req.url}`);
    if (req.url.startsWith('/stream?url=')) {
        const youtubeUrl = decodeURIComponent(req.url.split('/stream?url=')[1]);
        console.log(`[${new Date().toISOString()}] Streaming: ${youtubeUrl}`);

        if (!ytdl.validateURL(youtubeUrl)) {
            console.error(`[${new Date().toISOString()}] Invalid URL: ${youtubeUrl}`);
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid YouTube URL');
            return;
        }

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
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Stream error: ' + err.message);
            }
        });
    } else {
        console.log(`[${new Date().toISOString()}] 404: ${req.url}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
    }
};

const port = process.env.PORT || 10000;
console.log(`[${new Date().toISOString()}] Binding to port ${port}...`);

const server = http.createServer(requestHandler);
server.listen(port, '0.0.0.0', () => {
    console.log(`[${new Date().toISOString()}] Server bound to port ${port}`);
});

server.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Server error: ${err.message}`);
});