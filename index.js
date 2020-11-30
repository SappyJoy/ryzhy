const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');


const tempIndex = fs.readFileSync(`${__dirname}/templates/template-index.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempPoem = fs.readFileSync(`${__dirname}/templates/template-poem.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data)
const port = 80;

const server = http.createServer((req, res) => {
    // console.log(req.url);
    const urlName = url.parse(req.url, true);
    const pathname = urlName.pathname;
    let page = pathname.substr(
        0,
        pathname.indexOf('/', 1) === -1 ? pathname.length : pathname.indexOf('/', 1)
    );
    switch (page) {
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
            page = pathname.substr(pathname.indexOf('/', 1)).substr(1);

            const poem = dataObj.filter(
                (poem) =>
                    slugify(slugify(poem.title, {
                        lower:true,
                    }), {
                        remove: /[*+~.()'"!:@]/g
                    }) === page
            );
            if (poem[0] == null) {
                error404(res);
                break;
            }
            const poemPage = replaceTemplate(tempPoem, poem[0]);
            res.end(poemPage);
            break;
        default:
            error404(res);
    }
});

server.listen(port, () => {
    console.log("Listening on the port 8000...");
});

function error404(res) {
    res.writeHead(404, {
        'Content-type': 'text/html'
    });
    res.end('Error 404');
}

function replaceTemplate(temp, poem) {
    preview = getPreview(poem.text);
    let output = temp.replace(/{%TITLE%}/g, poem.title)
        .replace(/{%TEXT%}/g, poem.text)
        .replace(/{%TIME%}/g, poem.time)
        .replace(/{%ID%}/g, slugify(slugify(poem.title, {
            lower:true,
        }), {
            remove: /[*+~.()'"!:@]/g
        }))
        .replace(/{%PREVIEW%}/g, preview);
    return output;
}

function getPreview(text) {
    let preview = "";
    let pos = -1;
    let count = 0;
    while ((pos = text.indexOf('\n', pos + 1)) !== -1 && count < 3) {
        count++;
    }
    if (pos === -1) {
        preview = text;
    } else {
        preview = text.slice(0, pos);
    }
    return preview;
}