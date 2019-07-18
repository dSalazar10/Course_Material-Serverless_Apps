const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const groupsTable = process.env.GROUPS_TABLE;

exports.handler = async (event) => {
  console.log('Processing event: ', event);
  // Collect database from DynamoDB
  const result = await docClient.scan({
    TableName: groupsTable
  }).promise();
  // Store items in variablee
  const items = result.Items;
  // Return all the data
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
};
