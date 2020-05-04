import { Subnet } from "@pulumi/awsx/ec2/subnet";
import { EC28200 } from "./ec28200";
export function DockerRegistry(subnet: Subnet) {
  const userData = `
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce
docker run -d -p 5000:5000 --restart=always -n registrydev registry:2
`;

  const dockerRegistry = EC28200(subnet, userData, "registry");
  return dockerRegistry;
}
