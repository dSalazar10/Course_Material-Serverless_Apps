import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";

const docClient = new AWS.DynamoDB.DocumentClient();
const imagesTable = process.env.IMAGES_TABLE;
const groupsTable = process.env.GROUPS_TABLE;
const uuid = require('uuid');

async function groupExists(groupId: string) {
    const result = await docClient.get({
        TableName: groupsTable,
        Key: {
            id: groupId
        }
    }).promise();
    console.log('Get group: ', result);
    return !!result.Item;
}

async function createImage(groupId: string, imageId: any, event: APIGatewayProxyEvent) {
    const timestamp = new Date().toISOString();
    const newImage = JSON.parse(event.body);

    const newItem = {
        groupId,
        timestamp,
        imageId,
        ...newImage
    };
    console.log('Storing new item: ', newItem);
    await docClient.put({
        TableName: imagesTable,
        Item: newItem
    }).promise();
    return newItem;
}

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Caller event: ', event);
    const groupId = event.pathParameters.groupId;
    const imageId = uuid.v4();
    const validGroupId = await groupExists(groupId);
    // If groupId is invalid, return error
    if (!validGroupId) {
        return {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
              error: 'Group doesn\'t exist'
            })
        };
    }

    // Create an image
    const newItem = await createImage(groupId, imageId, event);

    // Return results
    return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            newItem: newItem
        })
    };
};
