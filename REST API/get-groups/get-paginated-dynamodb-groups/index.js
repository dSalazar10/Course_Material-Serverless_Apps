const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const groupsTable = process.env.GROUPS_TABLE;

exports.handler = async (event) => {
  console.log('Processing event: ', event);
  // Maximum number of elements to return
  let limit;
  // Next key to continue scan operation if necessary
  let nextKey;

  // Get parameters from event
  try {
    // Maximum number of items to return. Default is 20.
    limit = parseLimitParameter(event) || 20;
    // Information to return more data on the next request
    nextKey = parseNextKeyParameter(event);

  } catch (e) {
    console.log('Failed to parse query parameters: ', e.message);
    // Values are incorrect
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Invalid parameters'
      })
    }
  }

  // Pass event parameters to scan parameters
  const scanParams = {
    TableName: groupsTable,
    Limit: limit,
    ExclusiveStartKey: nextKey
  };
  console.log('Scan params: ', scanParams);
  // Scan the DynamoDB Table
  const result = await docClient.scan(scanParams).promise();
  // Store the items in a variable
  const items = result.Items;
  console.log('Result: ', result);
  // Return resulting items requested
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items,
      // Encode the JSON object so a client can return it in a URL as is
      nextKey: encodeNextKey(result.LastEvaluatedKey)
    })
  }
};

/**
 * Get value of the limit parameter.
 *
 * @param {Object} HTTP event passed to a Lambda function
 *
 * @returns {number} parsed "limit" parameter
 */
function parseLimitParameter(event) {
  const limitStr = getQueryParameter(event, 'limit');
  // Check if parameter is undefined
  if (!limitStr) {
    return undefined;
  }

  const limit = parseInt(limitStr, 10);
  if (limit <= 0) {
    throw new Error('Limit should be positive');
  }

  return limit;
}

/**
 * Get value of the limit parameter.
 *
 * @param {Object} HTTP event passed to a Lambda function
 *
 * @returns {Object} parsed "nextKey" parameter
 */
function parseNextKeyParameter(event) {
  const nextKeyStr = getQueryParameter(event, 'nextKey');
  // Check if parameter is undefined
  if (!nextKeyStr) {
    return undefined;
  }

  const uriDecoded = decodeURIComponent(nextKeyStr);
  return JSON.parse(uriDecoded);
}

/**
 * Get a query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 * @param {string} name a name of a query parameter to return
 *
 * @returns {string} a value of a query parameter value or "undefined" if a parameter is not defined
 */
function getQueryParameter(event, name) {
  const queryParams = event.queryStringParameters;
  // Check if parameter is undefined
  if (!queryParams) {
    return undefined
  }
  return queryParams[name]
}

/**
 * Encode last evaluated key using
 *
 * @param {Object} lastEvaluatedKey a JS object that represents last evaluated key
 *
 * @return {string} URI encoded last evaluated key
 */
function encodeNextKey(lastEvaluatedKey) {
  if (!lastEvaluatedKey) {
    return null
  }

  return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}
