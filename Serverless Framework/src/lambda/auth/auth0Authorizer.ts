import {CustomAuthorizerEvent, CustomAuthorizerResult, CustomAuthorizerHandler} from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import {verify} from 'jsonwebtoken';
import {JwtToken} from "../../auth/JwtToken";

const secretId = process.env.AUTH_0_SECRET_ID;
const secretField = process.env.AUTH_0_SECRET_FIELD;

const client = new AWS.SecretsManager();

let cachedSecret: string;

async function getSecret() {
    // Check if a secret exists already
    if (cachedSecret)
        return cachedSecret;
    // Get Auth0 Secret
    const data = await client.getSecretValue({
        SecretId: secretId
    }).promise();
    // Cache result
    cachedSecret = data.SecretString;
    // return results
    return JSON.parse(cachedSecret);

}

async function verifyToken(authHeader: string): Promise<JwtToken> {
    if (!authHeader) {
        throw new Error('No authorization header');
    }

    if (!authHeader.toLocaleLowerCase().startsWith('bearer ')) {
        throw new Error('Invalid authorization header');
    }

    // Extract the token
    const split = authHeader.split(' ');
    const token = split[1];

    const secretObject = await getSecret();
    const secret = secretObject[secretField];

    return verify(token, secret) as JwtToken;
}

export const handler: CustomAuthorizerHandler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    try {
        const decodedtoken = await verifyToken(event.authorizationToken);
        console.log('User was authorized');

        return {
            principalId: decodedtoken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        };
    } catch (e) {
        console.log('User wasn\'t authorized', e.message);
        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        };
    }
};
