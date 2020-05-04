import * as awsx from "@pulumi/awsx";
import { I8200VPC } from "../interfaces/I8200VPC";
export function createVPC(): I8200VPC {
  const vpc = new awsx.ec2.Vpc("8200-vpc", {
    numberOfAvailabilityZones: 2,
    subnets: [
      { type: "private", name: "eks-subnet" },
      { type: "private", name: "vpn-subnet" },
      { type: "private", name: "general-subnet" },
      { type: "public", name: "nat-subnet" },
    ],
  });
  const sg = new awsx.ec2.SecurityGroup("securityGroup", { vpc });

  sg.createIngressRule("inbound-access", {
    location: new awsx.ec2.AnyIPv4Location(),
    ports: new awsx.ec2.AllTcpPorts(),
    description:
      "allow all traffic inbound (private network so no restrictions)",
  });

  sg.createEgressRule("outbound-access", {
    location: new awsx.ec2.AnyIPv4Location(),
    ports: new awsx.ec2.AllTcpPorts(),
    description: "allow outbound access to anywhere",
  });

  return {
    eksVPC: [vpc.privateSubnets[0], vpc.privateSubnets[1]],
    vpnVPC: [vpc.privateSubnets[2], vpc.privateSubnets[3]],
    generalVPC: [vpc.privateSubnets[4], vpc.privateSubnets[5]],
    publicVPC: [vpc.privateSubnets[6], vpc.privateSubnets[7]],
    vpcId: vpc.id,
  };
}
