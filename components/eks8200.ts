import * as eks from "@pulumi/eks";
import * as aws from "@pulumi/aws";
import { Output } from "@pulumi/pulumi/output";
import { Subnet } from "@pulumi/awsx/ec2/subnet";

export function createEKS(
  eksSubnets: Subnet[],
  projectName: string,
  vpcId: Output<string>,
  user: string
): eks.Cluster {
  const webappRole = createRole("webapp-role", [
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
  ]);

  const buildAgentsRole = createRole("build-agents-role", [
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess",
  ]);

  const buildAgentsProfile = new aws.iam.InstanceProfile(
    "build-agents-profile",
    { role: buildAgentsRole }
  );

  const webAppProfile = new aws.iam.InstanceProfile("webapp-profile", {
    role: webappRole,
  });

  // -1 actually means all
  const securityGroup = new aws.ec2.SecurityGroup("clustersg", {
    ingress: [
      { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
    vpcId: vpcId,
  });

  const subnetIds: Output<string>[] = [];
  eksSubnets.forEach((subnet) => {
    subnetIds.push(subnet.id);
  });

  const cluster8200 = new eks.Cluster(
    `${projectName}`,
    {
      vpcId: vpcId,
      skipDefaultNodeGroup: true,
      privateSubnetIds: subnetIds,
      endpointPublicAccess: false,
      endpointPrivateAccess: true,
      enabledClusterLogTypes: ["api", "audit", "authenticator"],
      instanceRoles: [webappRole, buildAgentsRole],
      clusterSecurityGroup: securityGroup,
      roleMappings: [
        {
          username: "Ilia.German",
          roleArn: user,
          groups: ["system:masters"],
        },
      ],
    },
    {
      dependsOn: [webappRole, buildAgentsRole],
    }
  );

  const buildAgentsNodeGroup = cluster8200.createNodeGroup("buildAgentsGroup", {
    instanceType: "t3.small",
    nodeRootVolumeSize: 100,
    nodeAssociatePublicIpAddress: false,
    desiredCapacity: 1,
    minSize: 1,
    maxSize: 5,
    taints: {
      kind: { value: "build-agents", effect: "NoSchedule" },
    },
    labels: { kind: "build_agents" },
    nodeSubnetIds: subnetIds,
    instanceProfile: buildAgentsProfile,
  });

  const webappNodeGroup = cluster8200.createNodeGroup("webappGroup", {
    instanceType: "t3.small",
    nodeRootVolumeSize: 100,
    nodeAssociatePublicIpAddress: false,
    desiredCapacity: 1,
    minSize: 1,
    maxSize: 5,
    taints: {
      kind: { value: "webapp", effect: "NoSchedule" },
    },
    labels: { kind: "webapp" },
    nodeSubnetIds: subnetIds,
    instanceProfile: webAppProfile,
  });

  const nginxNodGroup = cluster8200.createNodeGroup("nginxGroup", {
    instanceType: "t3.large",
    nodeRootVolumeSize: 20,
    nodeAssociatePublicIpAddress: false,
    desiredCapacity: 1,
    minSize: 1,
    maxSize: 5,
    taints: {
      kind: { value: "nginx", effect: "NoSchedule" },
    },
    labels: { kind: "webapp" },
    nodeSubnetIds: subnetIds,
    instanceProfile: webAppProfile,
  });

  return cluster8200;
}

function createRole(name: string, policies: string[]): aws.iam.Role {
  const role = new aws.iam.Role(name, {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: ["ec2.amazonaws.com", "spotfleet.amazonaws.com"],
    }),
  });

  let counter = 0;
  for (const policy of policies) {
    // Create RolePolicyAttachment without returning it.
    const rpa = new aws.iam.RolePolicyAttachment(
      `${name}-policy-${counter++}`,
      { policyArn: policy, role: role }
    );
  }

  return role;
}
