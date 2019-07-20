import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import 'source-map-support/register'

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const connectionsTable = process.env.CONNECTIONS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);
  // Get the id
  const connectionId = event.requestContext.connectionId;
  const timestamp = new Date().toISOString();
  // Create a new item
  const item = {
      id: connectionId,
      timestamp
  };
  // Store the item in the Connections Table
  await docClient.put({
      TableName: connectionsTable,
      Item: item
  }).promise();
  // Return success
  return {
    statusCode: 200,

    body: ''
  }
};
