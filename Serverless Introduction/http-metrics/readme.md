# Lambda Function: http-metrics

## Create Fucntion
![](./images/1.png)

Create a new function, give it a name, and configure the runtime.
Click "Create Function"

## Upload Zip
![](./images/2.png)

Upload the zip file and save the function.

## Add Environment Variables
![](./images/3.png)

The function requires both SERVICE_NAME and URL

## Add CloudWatch Event Input
![](./images/4.png)

Create a new event and associate it to the http-metrics Lambda function

## Name New Rule
![](./images/5.png)

Give it a name and save it

## Connect Function to CloudWatch
![](./images/6.png)

We need to be able to put data into CloudWatch, so lets configure the access

## Edit Role
![](./images/7.png)

Copy and paste the IAM policy and save.

