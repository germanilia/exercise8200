Components:

VPC :
  2az

Subnets:
  webapp
  build-agents
  nginx
  vpn
  public

NAT:
  x2

EKS:
  private api server

VPN:
  openvpn endpoint

Container Registry:
  IP: 10.0.71.83


Design (diagram can be found in the repo root):

2az vpc (minium required for eks), private DNS server to be able to access AWS private DNS (this is a workaround since the access to the DNS is blocked by AWS)
Client VPN endpoint is the only component accessible from the "out-side" world.

EKS: 3 node groups, one for future build-agents (azure devops), each has taints so deployment must have tolrances.
NGINX is installed via replica set and has only private ip address (screen shot is in the repo root)

The repo contains secrets, certificate and keys exposed, it shouldn't be implemented this way in production environments vault should be used instead.

The container registry is for demonstration purposes only, in production environments I would use JFROG or ECR with limited access.

Manual Steps Required:

During the initial deployment EKS creation will fail, due to lake of access, need to connect to the VPN and execute again.
This can be solved by executing the code from AWS peered VPC.

VPN connection requires manual steps: need to add route (0.0.0.0/0) and ingress authorization (0.0.0.0/0) (due to lack of support from pulumi / TF)

After the execution is completed the vpn endpoint will be exported, please replace it in the vpn file under resources folder.
openvpn client or Tunnelblick can be used to connect.

Before running the solution please change the arn user in index.ts line 9.
