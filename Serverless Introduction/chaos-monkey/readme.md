# Chaos Monkey

This Lambda function will react to events from AWS platform
 with the use of ChaosMonkey

This function will test the robustness of our distributed system
and ensures stability. It will terminate a random host.

We will use CloudWatch to send an event every 5 minutes to the
Lambda function as input. 

On each event, the Lambda function will get a list of instances
from the placements and randomly terminate one of the instances.

## Package Files
![](./images/1.png)

Install the dependencies and zip the contents.

## Create Function
![](./images/2.png)

Give it a name and runtime. Click "Create Function".

## Change Entry Type
![](./images/3.png)

Change the code entry type to "Upload a .zip file".

## Upload Zip
![](./images/4.png)

Choose the .zip file that was just created using npm run packages
and save the function.

## Create EC2 Instances
![](./images/5.png)

We can create two EC2 instances for chaos monkey to operate on.

## Create New CloudWatch Schedule Event
![](./images/6.png)

Head to CloudWatch and click "Events".

![](./images/7.png)

Click "Get Started".

![](./images/8.png)

Click "schedule", change the number to what ever interval you would like. I chose 1 for
immediate results. Popint it to the Lambda function that was just created. and click
"Configure details".

![](./images/9.png)

Give the rule a name and click "Create rule".

![](./images/10.png)

Switch to Monitoring mode to see that there was an error. Click "View logs..."

![](./images/11.png)

If you click on the message that contains errorMesage, you can view what the problem is.
Th Lambda function is not allowed to access the EC2 instances. Time to change that.

![](./images/12.png)

Go back to Lambda and switch back from Monitoring to Configuration. Scroll down to 
Execution Roll. Click the link.

![](./images/13.png)

Click the link again.

![](./images/14.png)

Edit the policy

![](./images/15.png)

Copy the IAM policy from this folder and paste into the code window. Click "Review Policy".

![](./images/16.png)

Now the Lambda function should shut down random EC2 servers!

