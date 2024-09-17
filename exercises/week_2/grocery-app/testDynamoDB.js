const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
require('dotenv').config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const TableName = "GroceryList";

async function testDynamoDB() {
    try {
        console.log('Attempting to retrieve data from DynamoDB...');
        const command = new ScanCommand({ TableName });
        const data = await client.send(command);
        console.log("Data retrieved:", data.Items);
    } catch (error) {
        console.error("Error occurred:", error);
    }
}

testDynamoDB();
