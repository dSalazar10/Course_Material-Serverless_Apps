'use strict';
const AWS = require('aws-sdk');
const uuid = require("uuid");
const docClient = new AWS.DynamoDB.DocumentClient();
const groupsTable = process.env.GROUPS_TABLE;

// Get all the groups in a table
async function getGroups() {
  // Collect all the items in the table
    const result = await docClient.scan({
        TableName: groupsTable
    }).promise();
    // Put results in a variable
    const items = result.Items;
    // Return the results
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            items
        })
    }
}

// async function postGroup(parsedBody: any) {
//     const itemId = uuid.v4;
//     const parsedBody = JSON.parse(event.body)
//     const newItem = {
//         id: itemId,
//         ...parsedBody
//     };
//     await docClient.put({
//         TableName: groupsTable,
//         item: newItem
//     });
//     return {
//         statusCode: 201,
//         headers: {
//             "Access-Control-Allow-Origin": "*"
//         },
//         body: JSON.stringify({
//             newItem
//         })
//     }
// }

exports.handler = async (event: any) => {
    // Change the function according to what
    // Lambda function you are modifying

    const itemId = uuid.v4();
    const parsedBody = JSON.parse(event.body)
    const newItem = {
        id: itemId,
        ...parsedBody
    };
    await docClient.put({
        TableName: groupsTable,
        item: newItem
    });
    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            newItem
        })
    }

};

//
// // TODO: Add this into the handler for exercise
// async function toDo() {
//     console.log('Processing event: ', event);
//
//   // TODO: Read and parse "limit" and "nextKey" parameters from query parameters
//   // let nextKey // Next key to continue scan operation if necessary
//   // let limit // Maximum number of elements to return
//
//   // HINT: You might find the following method useful to get an incoming parameter value
//   // getQueryParameter(event, 'param')
//
//   // TODO: Return 400 error if parameters are invalid
//
//   // Scan operation parameters
//   const scanParams = {
//     TableName: groupsTable,
//     // TODO: Set correct pagination parameters
//     // Limit: ???,
//     // ExclusiveStartKey: ???
//   };
//   console.log('Scan params: ', scanParams);
//
//   const result = await docClient.scan(scanParams).promise();
//
//   const items = result.Items;
//
//   console.log('Result: ', result);
//
//   // Return result
//   return {
//     statusCode: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*'
//     },
//     body: JSON.stringify({
//       items,
//       // Encode the JSON object so a client can return it in a URL as is
//       nextKey: encodeNextKey(result.LastEvaluatedKey)
//     })
//   }
// }
//
// /**
//  * Get a query parameter or return "undefined"
//  *
//  * @param {Object} event HTTP event passed to a Lambda function
//  * @param {string} name a name of a query parameter to return
//  *
//  * @returns {string} a value of a query parameter value or "undefined" if a parameter is not defined
//  */
// function getQueryParameter(event: any, name: any) {
//   const queryParams = event.queryStringParameters;
//   if (!queryParams) {
//     return undefined
//   }
//
//   return queryParams[name]
// }
//
// /**
//  * Encode last evaluated key using
//  *
//  * @param {Object} lastEvaluatedKey a JS object that represents last evaluated key
//  *
//  * @return {string} URI encoded last evaluated key
//  */
// function encodeNextKey(lastEvaluatedKey: any) {
//   if (!lastEvaluatedKey) {
//     return null
//   }
//
//   return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
// }
