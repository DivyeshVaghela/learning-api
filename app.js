const restify = require('restify');
const config = require('./config/config');
const os = require('os');

const restifyJWT = require('restify-jwt-community');

const server = restify.createServer();

//Middleware
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

//configure cors
const corsMiddleware = require('restify-cors-middleware');
const cors = corsMiddleware({
    origins: ['*'],
    allowHeaders: ['Authorization']
});
server.pre(cors.preflight);
server.use(cors.actual);

//Protect Routes
server.use(
    restifyJWT({ secret: config.JWT_SECRET })
        .unless({
            path: [
                '/admin/auth',

                '/user/register',
                '/user/verify-email',
                '/user/forgot-password',
                '/user/reset-password',
                '/user/login',
                '/user/auth',

                '/user/package-purchase/success',
                '/user/package-purchase/failure',

                /\/assets\/public\/?.*/
            ]
        })
);

server.get('/assets/public/*', restify.plugins.serveStatic({
    directory: __dirname
}));
server.get('/assets/material/*', restify.plugins.serveStatic({
    directory: __dirname
}));

server.listen(config.PORT, () => {

    //user module
    require('./routes/users')(server);
    require('./routes/admin')(server);

    //notice module (notification)
    require('./routes/notice')(server);

    //types
    require('./routes/types')(server);
    //material module
    require('./routes/subject')(server);
    require('./routes/material')(server);

    //package
    require('./routes/package')(server);

    console.log(`Server listening on ${config.PORT}`);
});