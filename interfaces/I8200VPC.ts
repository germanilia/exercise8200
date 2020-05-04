import { Subnet, } from "@pulumi/awsx/ec2/subnet";
import { Output } from "@pulumi/pulumi/output";
export interface I8200VPC {
  eksVPC: Subnet[];
  vpnVPC: Subnet[];
  generalVPC: Subnet[];
  publicVPC: Subnet[];
  vpcId: Output<string>;
}
