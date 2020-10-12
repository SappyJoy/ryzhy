const fs = require('fs');
const http = require('http');
const url = require('url');

const tempIndex = fs.readFileSync(`${__dirname}/templates/template-index.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempPoem = fs.readFileSync(`${__dirname}/templates/template-poem.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data)

const server = http.createServer((req, res) => {
    // console.log(req.url);
    const { query, pathname } = url.parse(req.url, true);
    switch (pathname) {
        case '/':
            res.writeHead(200, {
                'Content-type': 'text/html'
            });

            const poemsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
            // console.log(poemsHtml);
            const index = tempIndex.replace(/{%CARDS%}/g, poemsHtml);
            res.end(index);
            break;
        case '/poem':
            res.writeHead(200, {
                'Content-type': 'text/html'
            });
            const poem = dataObj[query.id];
            const poemPage = replaceTemplate(tempPoem, poem);
            res.end(poemPage);
            break;
        default:
            res.writeHead(404, {
                'Content-type': 'text/html'
            });
            res.end('Error 404');
    }
});

server.listen(8000, '127.0.0.1', () => {
    console.log("Listening on the port 8000...");
});

function replaceTemplate(temp, poem) {
    preview = getPreview(poem.text);
    let output = temp.replace(/{%TITLE%}/g, poem.title)
        .replace(/{%TEXT%}/g, poem.text)
        .replace(/{%TIME%}/g, poem.time)
        .replace(/{%ID%}/g, poem.id)
        .replace(/{%PREVIEW%}/g, preview);
    return output;
}

function getPreview(text) {
    let preview = "";
    let pos = -1;
    let count = 0;
    while ((pos = text.indexOf('\n', pos + 1)) != -1 && count < 3) {
        count++;
    }
    if (pos === -1) {
        preview = text;
    } else {
        preview = text.slice(0, pos);
    }
    return preview;
}