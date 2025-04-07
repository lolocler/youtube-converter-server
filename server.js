const http = require('http');
const fs = require('fs');
const path = require('path');
const ytdl = require('@distube/ytdl-core');

const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/stream?url=')) {
        const youtubeUrl = decodeURIComponent(req.url.split('/stream?url=')[1]);
        console.log('Streaming video from:', youtubeUrl);

        try {
            if (!ytdl.validateURL(youtubeUrl)) {
                throw new Error('Invalid YouTube URL.');
            }

            console.log('Starting ytdl stream with 4.16.8...');
            const stream = ytdl(youtubeUrl, {
                filter: 'videoonly',
                quality: 'highestvideo',
                requestOptions: {
                    headers: {
                        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 20) + 90}.0.0.0 Safari/537.36`,
                        'Accept': '*/*',
                        'Referer': 'https://www.youtube.com/'
                    }
                }
            });

            res.writeHead(200, {
                'Content-Type': 'video/mp4',
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp',
                'Access-Control-Allow-Origin': '*'
            });
            stream.pipe(res);

            stream.on('info', (info) => {
                console.log('Stream info:', info.videoDetails.title, info.formats.length, 'formats');
            });
            stream.on('error', (err) => {
                console.error('Stream error:', err.message);
                if (!res.headersSent) {
                    res.writeHead(500);
                    res.end('Stream error: ' + err.message);
                }
            });
        } catch (err) {
            console.error('Stream setup error:', err.message);
            res.writeHead(400, {
                'Content-Type': 'text/plain',
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp',
                'Access-Control-Allow-Origin': '*'
            });
            res.end('Error streaming video: ' + err.message);
        }
        return;
    }

    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    if (extname === '.js') contentType = 'text/javascript';

    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Server running at port ${port}`);
});