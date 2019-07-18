const config = require('./config.json');
const AWS = require('aws-sdk');
const lodash = require('lodash');
const ec2 = new AWS.EC2({region: config.dev.aws_region});

// get a list of all running instances
async function getReservations() {
  const result = await ec2.describeInstances({
    Filters: [
      {
        Name: 'instance-state-name',
        Values: ['running']
      }
    ]
  }).promise();

  console.log('Reservations: ', JSON.stringify(result));

  return result.Reservations
}

// Returns the ID of a random EC2 instance in a reservation
function selectInstanceIdToTerminate(instances) {
  console.log('Selecting random instance from: ', instances);

  const instanceToTerminate = lodash.sample(instances);
  return instanceToTerminate.InstanceId
}

//Terminate an EC2 instance
async function terminateInstance(instanceId) {
  console.log('Terminating instance', instanceId);

  await ec2.terminateInstances({
    InstanceIds: [
      instanceId
    ]
  }).promise();

  console.log('Instance was terminated')
}

// chaos-monkey Lambda function
// Terminates a random running EC2 instance
exports.handler = async (event) => {
  console.log('Processing event: ', event);

  const reservations = await getReservations();
  const allInstances = lodash.flatMap(reservations, (reservation) => reservation.Instances);

  console.log('Current instances running: ', allInstances);

  if (allInstances.length === 0) {
    console.log('No instances to terminate', allInstances);
    return
  }
  // get an ID of an instance
  const instanceId = selectInstanceIdToTerminate(allInstances);
  // Terminate the instance
  await terminateInstance(instanceId)
};






