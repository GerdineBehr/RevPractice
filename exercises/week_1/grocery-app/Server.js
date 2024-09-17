// Server.js
const http = require('http');
const { createLogger, transports, format } = require('winston');
const fs = require('fs');
const path = require('path');

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

// File path for JSON data
const dataFilePath = path.join(__dirname, 'data.json');
let groceryList = [];
let amounts = {};
let prices = {};
let purchased = {};

// Load existing data from the JSON file
fs.readFile(dataFilePath, (err, data) => {
    if (err) {
        if (err.code === 'ENOENT') {
            logger.info('No existing data file found, starting with empty data.');
        } else {
            logger.error(`Error reading data file: ${err.message}`);
            throw err;
        }
    } else {
        try {
            const parsedData = JSON.parse(data);
            groceryList = parsedData.groceryList || [];
            amounts = parsedData.amounts || {};
            prices = parsedData.prices || {};
            purchased = parsedData.purchased || {};
            logger.info('Data successfully loaded from file.');
        } catch (parseError) {
            logger.error(`Error parsing data file: ${parseError.message}`);
        }
    }
});

// Helper function to send a JSON response
const sendJSONResponse = (res, statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
};

const PORT = 3000;

const server = http.createServer((req, res) => {
    logger.info(`[${req.method} ${req.url}]`);

    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {
        const url = req.url;

        switch (req.method) {
            case 'GET':
                if (url === '/items') {
                    const itemList = groceryList.map(item => ({
                        item,
                        quantity: amounts[item],
                        price: prices[item],
                        purchased: purchased[item] ? 'Yes' : 'No'
                    }));
                    sendJSONResponse(res, 200, { message: "Grocery list", items: itemList });
                } else {
                    sendJSONResponse(res, 404, { message: 'Not found' });
                }
                break;

            case 'POST':
                if (url === '/items') {
                    const newItem = JSON.parse(body);
                    const { item, quantity, price } = newItem;

                    if (!item || isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
                        sendJSONResponse(res, 400, { message: 'Invalid input' });
                        return;
                    }

                    groceryList.push(item);
                    amounts[item] = (amounts[item] || 0) + quantity;
                    prices[item] = price;
                    purchased[item] = false;

                    logger.info(`Added ${item}: Quantity: ${quantity}, Price: ${price}`);
                    sendJSONResponse(res, 201, { message: `${item} added` });
                    saveData();
                }
                break;

            case 'PUT':
                if (url === '/items') {
                    const updateItem = JSON.parse(body);
                    const { item } = updateItem;

                    if (!groceryList.includes(item)) {
                        sendJSONResponse(res, 404, { message: 'Item not found' });
                        return;
                    }

                    purchased[item] = true;
                    logger.info(`Marked ${item} as purchased`);
                    sendJSONResponse(res, 200, { message: `${item} marked as purchased` });
                    saveData();
                }
                break;

            case 'DELETE':
                if (url === '/items') {
                    const deleteItem = JSON.parse(body);
                    const { item } = deleteItem;

                    const index = groceryList.indexOf(item);
                    if (index === -1) {
                        sendJSONResponse(res, 404, { message: 'Item not found' });
                        return;
                    }

                    groceryList.splice(index, 1);
                    delete amounts[item];
                    delete prices[item];
                    delete purchased[item];

                    logger.info(`Deleted ${item}`);
                    sendJSONResponse(res, 200, { message: `${item} deleted` });
                    saveData();
                }
                break;

            default:
                sendJSONResponse(res, 405, { message: 'Method not allowed' });
        }
    });
});

server.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
});

const saveData = () => {
    const data = {
        groceryList,
        amounts,
        prices,
        purchased
    };

    fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            logger.error(`Error saving data file: ${err.message}`);
        } else {
            logger.info('Data successfully saved to file.');
        }
    });
};

const resetState = () => {
    groceryList = [];
    amounts = {};
    prices = {};
    purchased = {};
};

module.exports = {server, resetState};
