import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import * as middy from 'middy'
import {cors} from 'middy/middlewares'

const docClient = new AWS.DynamoDB.DocumentClient();
const imagesTable = process.env.IMAGES_TABLE;
const groupsTable = process.env.GROUPS_TABLE;
const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration: number = parseInt(process.env.SIGNED_URL_EXPIRATION, 10);
const uuid = require('uuid');

const s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: 'us-east-2'
});

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
        ...newImage,
        imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
    };
    console.log('Storing new item: ', newItem);
    await docClient.put({
        TableName: imagesTable,
        Item: newItem
    }).promise();
    return newItem;
}

function getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: urlExpiration
    });
}

export const handler = middy(async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log('Caller event: ', event);
    const groupId = event.pathParameters.groupId;
    const imageId = uuid.v4();
    const validGroupId = await groupExists(groupId);
    // If groupId is invalid, return error
    if (!validGroupId) {
        return {
            statusCode: 404,
            body: JSON.stringify({
              error: 'Group doesn\'t exist'
            })
        };
    }

    // Create an image
    const newItem = await createImage(groupId, imageId, event);

    const url = getUploadUrl(imageId);

    // Return results
    return {
        statusCode: 201,
        body: JSON.stringify({
            newItem: newItem,
            uploadUrl: url
        })
    };
});

handler.use(
    cors({
        credentials: true
    })
);
