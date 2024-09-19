const http = require('http');
const { createLogger, transports, format } = require('winston');
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
const { DynamoDBClient, QueryCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

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

        switch (req.method) {
            case 'GET':
                if (url === '/items') {
                    try {
                        logger.info('Attempting to retrieve items from DynamoDB');
                        // Use ScanCommand to get all items
                        const command = new ScanCommand({ TableName });
                        const data = await documentClient.send(command);

                        logger.info(`Data retrieved: ${JSON.stringify(data.Items)}`);
                        sendJSONResponse(res, 200, data.Items);
                    } catch (err) {
                        console.error(err);
                        logger.error(`Error occurred: ${err.message}\n${err.stack}`);
                        sendJSONResponse(res, 500, { error: 'Internal Server Error' });
                    }
                } else { // If the URL is not matched
                    sendJSONResponse(res, 404, { error: 'Not Found' });
                }
                break;

            case 'POST':
                if (url === '/items') {
                    try {
                        const newItem = JSON.parse(body);
                        const { itemID, name, quantity, price, purchased } = newItem;

                        // Validate input
                        if (!itemID || typeof itemID !== 'number' || !name || typeof name !== 'string' || isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
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
                break;

                case 'PUT':
                    if (url === '/items') {
                        try {
                            // Parse the incoming request body
                            const updateItem = JSON.parse(body);
                            const { itemname } = updateItem;
                            console.log(`Received item: ${itemname}`);

                            // Validate input
                            if (!itemname || typeof itemname !== 'string') {
                                sendJSONResponse(res, 400, { message: 'Invalid input' });
                                return;
                            }

                            // Function to scan items by name
                            async function scanItemsByName(Name) {
                                const getCommand = new ScanCommand({
                                    TableName,
                                    FilterExpression: "#name = :name",
                                    ExpressionAttributeNames: {
                                        '#name': 'Name'
                                    },
                                    ExpressionAttributeValues: {
                                        ":name": { S: Name }
                                    },
                                });

                                console.log("ScanCommand being sent:", JSON.stringify(getCommand));

                                try {
                                    const data = await documentClient.send(getCommand);
                                    console.log("Scan result:", data);

                                    if (!data.Items || data.Items.length === 0) {
                                        console.log("No items found");
                                        return null; // No item found with the provided name
                                    }

                                    const item = data.Items[0]; // Assuming name is unique
                                    console.log("Found item:", item);
                                    return item;
                                } catch (scanError) {
                                    console.error("Error during scan:", scanError);
                                    throw scanError; // Re-throw the error to be handled by the calling function
                                }
                            }

                            // Scan for item
                            const item = await scanItemsByName(itemname);
                            if (!item) {
                                sendJSONResponse(res, 404, { message: 'Item not found' });
                                return; // Stop if no item found
                            }

                            // Update the item, setting purchased to false by default
                            const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");

                            const updateCommand = new UpdateCommand({
                                TableName,
                                Key: { ItemID: Number(item.ItemID.N) }, // Directly use the number
                                UpdateExpression: 'SET Purchased = :purchased',
                                ExpressionAttributeValues: {
                                    ':purchased': true // Default value
                                }
                            });

                            console.log("Attempting to update item with key:", { ItemID: Number(item.ItemID.N) });

                            // Execute the command 
                            await documentClient.send(updateCommand);
                            console.log("Update successful");
                            sendJSONResponse(res, 200, { message: 'Item updated successfully' });

                        } catch (error) {
                            console.error("Error updating item:", error);
                            sendJSONResponse(res, 500, { message: 'Internal Server Error', error: error.message });
                        }
                    }
                    break;

                    case 'DELETE': 
                    if (url === '/items') {
                        try {
                            // Parse the incoming request body
                            const deleteItem = JSON.parse(body);
                            const { itemname } = deleteItem;
                            console.log(`Received item: ${itemname}`);

                            // Validate input
                            if (!itemname || typeof itemname !== 'string') {
                                sendJSONResponse(res, 400, { message: 'Invalid input' });
                                return;
                            }

                            // Function to scan items by name
                            async function scanItemsByName(Name) {
                                const getCommand = new ScanCommand({
                                    TableName,
                                    FilterExpression: "#name = :name",
                                    ExpressionAttributeNames: {
                                        '#name': 'Name'
                                    },
                                    ExpressionAttributeValues: {
                                        ":name": { S: Name }
                                    },
                                });

                                console.log("ScanCommand being sent:", JSON.stringify(getCommand));

                                try {
                                    const data = await documentClient.send(getCommand);
                                    console.log("Scan result:", data);

                                    if (!data.Items || data.Items.length === 0) {
                                        console.log("No items found");
                                        return null; // No item found with the provided name
                                    }

                                    const item = data.Items[0]; // Assuming name is unique
                                    console.log("Found item:", item);
                                    return item;
                                } catch (scanError) {
                                    console.error("Error during scan:", scanError);
                                    throw scanError; // Re-throw the error to be handled by the calling function
                                }
                            }

                            // Scan for item
                            const item = await scanItemsByName(itemname);
                            if (!item) {
                                sendJSONResponse(res, 404, { message: 'Item not found' });
                                return; // Stop if no item found
                            }

                            // DELETE the item
                            const { DeleteCommand } = require("@aws-sdk/lib-dynamodb");

                            const deleteCommand = new DeleteCommand({
                                TableName,
                                Key: { ItemID: Number(item.ItemID.N) }, // Directly use the number
                            });

                            console.log("Attempting to delete item with key:", { ItemID: Number(item.ItemID.N) });

                            // Execute the command 
                            await documentClient.send(deleteCommand);
                            console.log("Delete successful");
                            sendJSONResponse(res, 200, { message: 'Item deleted successfully' });

                        } catch (error) {
                            console.error("Error deleting item:", error);
                            sendJSONResponse(res, 500, { message: 'Internal Server Error', error: error.message });
                        }
                    }
                    break;

            default:
                console.log("The default was used");
                sendJSONResponse(res, 404, { error: 'Not Found' });
                break;
            }}) //ends switch
            });


server.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
});

logger.info(`AWS_REGION: ${process.env.AWS_REGION}`);
logger.info(`AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID}`);
logger.info(`AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY}`);


