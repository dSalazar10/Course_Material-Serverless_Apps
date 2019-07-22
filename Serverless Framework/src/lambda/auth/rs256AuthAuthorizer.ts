
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJRgwGIXFUJVuaMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1lbTB1aHpqdy5hdXRoMC5jb20wHhcNMTkwNzIxMjIzNjEyWhcNMzMw
MzI5MjIzNjEyWjAhMR8wHQYDVQQDExZkZXYtZW0wdWh6ancuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA01WtKwdcV5JvxtOK4UdY0Al/
BF35VI2cAATMTvGatKDc7O0sqbrLE2LABTdcxrF8QA5vf5RDhM6ui753lclBcKVJ
XYpyame26jSstyRHsSW2mVhGrPB3mCkj5N0GZNgymdFk2ET0qxZuYdPfKdBMSsdj
Y5MYi8K9DHhM29y7gqovbPzmvr10HP2ikG2JB8d6wAXjRr962mu0LU59wPP84M5v
OWpKJbqfUyynA6FwGC4E68EWO/uvL8Plg/29+8Z2LMMqRJt/BFNkd3qlozSx68Tf
3/OY4tiqt8g8yRlBrs4PEetQ6hJhK5xQ5BF0BzyxNpecY2NI6XJCq6incnbiVwID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRdIquICZyZ5XPG1mJJ
wiVbZ0wG/jAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAMg2qFft
keXBHPKzB1gAxqsl6OWP77F2KyoaVFxaEQh4wCgBnnZoUpHOqARhGP+reftLBCJy
9QwgxmqHlEw5lM97tdfi46aNcRy1iMfEG4DWMHq3e9MnrqMBHCNfy2IcEXq1IjXF
NtRjs6u2iuEpek0YMTBgPRRXkXnXT4RvnrnLotzzFebF29WbNXtl6vF09QtyrV08
jbAIcCpJgmVhbqewqgBaQ7/q2708Zp6mjryaF95dVBHvFNndAgj9Hj2ifFoZpdvQ
mydG1n0RlysmIQmWI7PecSbhGgcw4OHVhpMnORTX4qTkznNxou4VZexGYZPJboIQ
RvV5oyFoWqTrAlY=
-----END CERTIFICATE-----`;

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken);
    console.log('User was authorized', jwtToken);

    return {
      principalId: jwtToken.sub,
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
    }
  } catch (e) {
    console.log('User authorized', e.message);

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
    }
  }
};

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
