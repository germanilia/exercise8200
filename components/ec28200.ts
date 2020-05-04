import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Subnet } from "@pulumi/awsx/ec2/subnet";
export function EC28200(subnet: Subnet, userData: string, name: string) {
  const ubuntu = pulumi.output(
    aws.getAmi({
      filters: [
        {
          name: "name",
          values: ["ubuntu/images/hvm-ssd/ubuntu-xenial-16.04-amd64-server-*"],
        },
        {
          name: "virtualization-type",
          values: ["hvm"],
        },
      ],
      mostRecent: true,
      owners: ["099720109477"], // Canonical
    })
  );

  const sshKey = new aws.ec2.KeyPair(`${name}-key`, {
    publicKey: `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDeCIYL2TQaQjGi8yQXIgKDBlM8J9dGPNv3wvPAImDLaFWG7rSus1ul0pW0qnoN81OCaccP8su/eBp3XG0W95LaMv2XoBKdW4AOh0bry1C1Dx+qbWV38eSGTz3+Kr32DTVgkd2AfaiWulKdUzOrIiHe0552YCXS/6qQO8diUb3Q6+6DGGAwviLH1kw1GugRnEqowsw8gd2ZZLH7SXZOK9WeAwF9jmTLZkZXpY9SpDQA6tIkLwq9xcTO2g77UqoV6szboNHmY57c/pXt6A5OMklOn+Q5q6EkxK/zB+RjioqaA+21FIXoUR9S6i8L/HaeP1dRsHW5Ykhgzds/Ysi0yqtD iliagerman@Ilias-MacBook-Pro.local
    `,
  });
  return new aws.ec2.Instance(name, {
    instanceType: aws.ec2.InstanceTypes.T3_Micro,
    subnetId: subnet.id,
    associatePublicIpAddress: false,
    ami: ubuntu.id,
    keyName: sshKey.keyName,
    userData: userData,
  });
}
