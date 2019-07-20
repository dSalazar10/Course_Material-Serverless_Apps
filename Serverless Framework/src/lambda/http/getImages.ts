import {APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient();
const groupsTable = process.env.GROUPS_TABLE;
const imagesTable = process.env.IMAGES_TABLE;

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

async function getImagesPerGroup(groupId: string) {
    // Query the Table
    const result = await docClient.query({
        TableName: imagesTable,
        // Get all images containing the groupId
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues: {
            ':groupId': groupId
        },
        // returns the latest images first
        ScanIndexForward: false
    }).promise();
    return result.Items;
}

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Caller event: ', event);
    // Use the path parameter to get the groupId field
    const groupId = event.pathParameters.groupId;

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

    const images = await getImagesPerGroup(groupId);

    // Return all the images with matching groupId
    return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          items: images
        })
    };
};


