const http = require('http'); // require imports things, here the http module in Node.js

//use http.createServer() method to create http server 

const server = http.createServer((req, res) => { //req = two arguments , request object , res response object 
    //Handle incoming requests here 
    res.statusCode = 200; //HTTP status code 200 OK 
    res.setHeader(); //response content type 
    res.end(); //Response body 

});

const port = 3000; //tell the server to listen on port 3000 (commonly used port)

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
});

