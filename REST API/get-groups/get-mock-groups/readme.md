# Lambda Function get-groups

This sets up a base Lambda function and provides test data.

## Create Function
![](./images/1.png)

Create a new function, give it a name, and configure the runtime.

## Add Code
![](./images/2.png)

Copy and paste the source code into the Lambda function code window.

## Create APIGateway Source
![](./images/3.png)

Go to AWS APIGateway and create a new API.

## Configure API
![](./images/4.png)

Choose REST, choose New API, give it a name, and click Create API.

## Create Resource
![](./images/5.png)

In order to access the API, you need to configure endpoints. To do
this, click Actions, then click Create Resource. Give it a name and
create it.

## Create Method
![](./images/6.png)

Now that we have an endpoint set up, we need to create access points.
To do this click Actions, then click Create Method.

## Configure Access Point Type
![](./images/7.png)

In the drop down menu select GET. Click the check mark button.

## Setup Access Point
![](./images/8.png)

In order to add functionality, we need to connect it to a Lambda
function. To do this, select Lambda Function, check the box for
Proxy Integration, select the region that your Lambda Function
is in, enter the name of your Lambda function, and click save.

## Deploy API
![](./images/9.png)

We need to deploy the API to save the changes. To do this, click
Action, then click Deploy API.

## Setup API Deployment
![](./images/10.png)

Select New Stage, give it a name, and optionally give it a description.
Clicking deploy will save your API.

That's it! Now your API GET request can be accessed using either
Postman or the React client.

