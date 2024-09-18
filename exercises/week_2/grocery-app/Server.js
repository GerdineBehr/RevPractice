// Server.js
const http = require('http');
const { createLogger, transports, format } = require('winston');
const fs = require('fs');
require('dotenv').config();

const PORT = 3000;

// Logger setup
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app.log' })
    ]
});

// Setup Database 

const { DynamoDBClient, QueryCommand, ScanCommand} = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand
} = require("@aws-sdk/lib-dynamodb")

// Create a DynamoDB client
const dynamoDbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

const TableName = "GroceryList";


// Helper function to send a JSON response
const sendJSONResponse = (res, statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
};
 // Handle HTTP requests 
const server = http.createServer((req, res) => {
    logger.info(`[${req.method} ${req.url}]`);

    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', async () => {
        const url = req.url;
    
        switch(req.method){
            case 'GET':
                if( url ==='/items'){
                    try{
                        logger.info('Attempting to retrieve items from DynamoDB');
                        // Use ScanCommand to get all items
                        const command = new ScanCommand({ TableName });
                        const data = await documentClient.send(command);
    
                        logger.info(`Data retrieved: ${JSON.stringify(data.Items)}`);
                        sendJSONResponse(res, 200, data.Items);
                    } catch(err){
                        console.error(err);
                        logger.error(`Error occurred: ${err.message}\n${err.stack}`);
                        sendJSONResponse(res, 500, { error: 'Internal Server Error' });
                    }
                } else { //a bunch of error messaging because I CANNOT figure out why its brokkkkeee
                    sendJSONResponse(res, 404, { error: 'Not Found' });
                }
                break;
                
            default:
                sendJSONResponse(res, 404, { error: 'Not Found' });
                break;
        
        
                case 'POST':
    if (url === '/items') {
        try {
            const newItem = JSON.parse(body);
            const { itemID, name, quantity, price, purchased } = newItem;

            // Validate input
            if (!itemID || typeof itemID !== 'string' || !name || typeof name !== 'string' || isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
                sendJSONResponse(res, 400, { message: 'Invalid input' });
                return;
            }

            // Create the item object as per DynamoDB schema
            const item = {
                ItemID: itemID, 
                Name: name,
                Price: price.toString(), // Convert number to string
                Quantity: quantity.toString(), // Convert number to string
                Purchased: !!purchased // Ensure it's a boolean
            };

            // Create the item in DynamoDB
            const command = new PutCommand({
                TableName,
                Item: item
            });

            await documentClient.send(command);
            sendJSONResponse(res, 201, { message: 'Item added successfully' });

        } catch (err) {
            console.error(err);
            sendJSONResponse(res, 500, { message: 'Failed to add item', error: err.message });
        }
    }

                
        
                
                }
        })});
    
        
        server.listen(PORT, () => {
            logger.info(`Server listening on port ${PORT}`);
        });

        logger.info(`AWS_REGION: ${process.env.AWS_REGION}`);
        logger.info(`AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID}`);
        logger.info(`AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY}`);
            

    