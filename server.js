const http = require('http');
const ytdl = require('@distube/ytdl-core');

const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/stream?url=')) {
        const youtubeUrl = decodeURIComponent(req.url.split('/stream?url=')[1]);
        console.log('Streaming video from:', youtubeUrl);

        try {
            if (!ytdl.validateURL(youtubeUrl)) {
                throw new Error('Invalid YouTube URL.');
            }

            console.log('Starting ytdl stream...');
            const stream = ytdl(youtubeUrl, {
                filter: 'videoonly',
                quality: 'highestvideo',
                requestOptions: {
                    headers: {
                        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.0.0 Safari/537.36`,
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
                console.error('Stream error:', err.message);
                if (!res.headersSent) {
                    res.writeHead(500);
                    res.end('Stream error: ' + err.message);
                }
            });
        } catch (err) {
            console.error('Stream setup error:', err.message);
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Error streaming video: ' + err.message);
        }
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});