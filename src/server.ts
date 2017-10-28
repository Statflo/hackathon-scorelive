import * as express    from 'express';
import * as http       from 'http';
import * as Handlebars from 'express-handlebars';

import Websocket from './app/Websocket';

const app    = express(),
      server = http.createServer(app),
      wss    = new Websocket.Server({ server, path: "/websocket" });


var home     = 0,
    visitors = 0;

app.engine('handlebars', Handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use('/assets', express.static('assets'));


app.get('/visitor', (req, res) => {
    res.render('home', {type: "visitor"});
});

app.get('/home', (req, res) => {
    res.render('home', {type: "home"});
});

app.get('/reset', (req, res) => {
    res.render('home', {type: "reset"});
});

app.get('/', (req, res) => {
    res.render('index', {home: home, visitors: visitors});
});

wss.on('connection', (ws: Websocket) => {

    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (message: string) => {

        console.log('received: %s', message);

        const homeRegex    = /^home\:/;
        const visitorRegex = /^visitor\:/;
        const resetRegex   = /^reset\:/;

        var reply: any = {visitor: null, home: null, reset: false};

        if (homeRegex.test(message)) {
            reply.home = message.replace(homeRegex, '');
        } else if (homeRegex.test(message)) {
            reply.visitor = message.replace(visitorRegex, '');
        } else if (resetRegex.test(message)) {
            reply.reset = true;
        }

        wss.clients.forEach(client => {
            client.send(JSON.stringify(reply));
        });
    });
});

setInterval(() => {
    wss.clients.forEach((ws: Websocket) => {

        if (!ws.isAlive) return ws.terminate();

        ws.isAlive = false;
        ws.ping(null, false, true);
    });
}, 10000);

//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});