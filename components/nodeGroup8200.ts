import * as aws from "@pulumi/aws";
import * as eks from "@pulumi/eks";

export function createNodeGroup(
  groupName: string,
  eksToUse: eks.Cluster,
  role: aws.iam.Role,
  subnets: any[],
  minSize = 1,
  maxSize = 2,
  desiredSize = 1
) {
  const groupProfile = new aws.iam.InstanceProfile(
    `${groupName}profile`,
    { role: role.arn }
  );

  const group = eksToUse.createNodeGroup(groupName, {
    instanceType: "t3.small",
    nodeRootVolumeSize: 100,
    nodeAssociatePublicIpAddress: false,
    desiredCapacity: desiredSize,
    minSize: minSize,
    maxSize: maxSize,
    taints: { kind: { value: groupName, effect: "NoSchedule" } },
    labels: { kind: groupName },
    nodeSubnetIds: subnets,
    instanceProfile: groupProfile,
  });
  return group;

  /*   const buildAgentsNodeGroup = eks.createManagedNodeGroup(
    groupName,
    {
      cluster: eksToUse,
      nodeGroupName: groupName,
      nodeRoleArn: role.arn,
      scalingConfig: {
        desiredSize: desiredSize,
        minSize: minSize,
        maxSize: maxSize,
      },
      diskSize: 20,
      instanceTypes: instanceTypes,
      labels: { ondemand: "true" },
      tags: { cient: "8200-buildAgents" },
    },
    eksToUse
  ); */
}
