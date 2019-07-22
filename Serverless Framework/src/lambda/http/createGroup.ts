import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import 'source-map-support/register'
import * as uuid from 'uuid';
import * as AWS from 'aws-sdk';
import {getUserId} from "../../auth/utils";

const docClient = new AWS.DynamoDB.DocumentClient();
const groupsTable = process.env.GROUPS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);
  // Generate a random id
  const itemId = uuid.v4();
  // Body of request will contain the elements to be added
  const parsedBody = JSON.parse(event.body);

  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  const newItem = {
    id: itemId,
    userId: getUserId(jwtToken),
    ...parsedBody
  };
  // Create a new item in DynamoDB
  await docClient.put({
    TableName: groupsTable,
    Item: newItem
  }).promise();
  // Return results
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem
    })
  }
};
