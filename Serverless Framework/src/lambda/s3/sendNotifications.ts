import {SNSHandler, SNSEvent, S3Event} from "aws-lambda";
import 'source-map-support/register'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient();
const connectionsTable = process.env.CONNECTIONS_TABLE;
const stage = process.env.STAGE;
const apiId = process.env.API_ID;

const connectionParams = {
    apiVersion: "2018-11-29",
    endpoint: `${apiId}.execute-api.us-east-2.amazonaws.com/${stage}`
};

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams);

export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event');
    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message;
        console.log('Processing S3 Event ', s3EventStr);
        const s3Event = JSON.parse(s3EventStr);

        await processS3Event(s3Event);
    }
};

async function processS3Event(s3Event: S3Event) {
    // Get the key of every record
    for (const record of s3Event.Records) {
        const key = record.s3.object.key;
        console.log('Processing S3 item with key ', key);

        // Get a list of connections
        const connections = await docClient.scan({
            TableName: connectionsTable
        }).promise();
        // Add info to payload
        const payload = {
            imageId: key
        };
        // Send the payload to all the connections open
        for (const connection of connections.Items) {
            const connectionId = connection.Id;
            await sendMessageToClient(connectionId, payload);
        }
    }
}

async function sendMessageToClient(connectionId, payload) {
    try {
        console.log("Sending message to a connection ", connectionId);
        // Send the message to the connection
        await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data:JSON.stringify(payload)
        }).promise();

    } catch (e) {
        console.log("Failed to send message ", JSON.stringify(e));
        // Delete the closed connection from table
        if (e.statusCode === 410) {
            console.log('Stale connection');
            await docClient.delete({
                TableName: connectionsTable,
                Key: {
                    id: connectionId
                }
            }).promise();
        }
    }
}
