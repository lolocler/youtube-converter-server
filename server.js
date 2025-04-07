const http = require('http');
const ytdl = require('@distube/ytdl-core');

const requestHandler = async (req, res) => {
    console.log(`[${new Date().toISOString()}] Received request: ${req.url}`);
    if (req.url.startsWith('/stream?url=')) {
        const youtubeUrl = decodeURIComponent(req.url.split('/stream?url=')[1]);
        console.log(`[${new Date().toISOString()}] Streaming video from: ${youtubeUrl}`);

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
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Stream error: ' + err.message);
                }
            });
        } catch (err) {
            console.error(`[${new Date().toISOString()}] Stream setup error: ${err.message}`);
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Error streaming video: ' + err.message);
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
    }
};

const server = http.createServer(requestHandler);
const port = process.env.PORT || 10000; // Render default is 10000

server.listen(port, '0.0.0.0', () => {
    console.log(`[${new Date().toISOString()}] Server is listening on port ${port}`);
});

server.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Server error: ${err.message}`);
});