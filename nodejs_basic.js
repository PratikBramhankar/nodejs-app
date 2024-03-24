import http from 'http';
import * as obj from './features.js';
import fs from 'fs';
import path from 'path';


console.log(path.dirname('./home/new/noname/index.ne'));

const home = fs.readFileSync('./index.htm');
// console.log(home);

const server = http.createServer((req, res) => {
    if(req.url === '/about') {
        res.end(`Love is just ${obj.generateRandomPercent()}`); 
    }
    else if(req.url === '/contact') {
        res.end('Contact Page');
    }
    else if(req.url === '/'){
        // res.end(home);
        res.end("home");

    }else {
        res.end('Page Not Found');
    }
});

server.listen(3000, () => {
    console.log("Listening on port 3000");
})