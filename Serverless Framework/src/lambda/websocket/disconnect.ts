import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import 'source-map-support/register'

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const connectionsTable = process.env.CONNECTIONS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);

  // Get the id
  const connectionId = event.requestContext.connectionId;

  const key = {
      id: connectionId
  };

  // Delete the key in the Connections Table
  await docClient.delete({
      TableName: connectionsTable,
      Key: key
  }).promise();

  // Return results
  return {
    statusCode: 200,

    body: ''
  }
};
