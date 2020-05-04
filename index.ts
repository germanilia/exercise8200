import * as vpc8200 from "./components/vpc8200";
import * as eks8200 from "./components/eks8200";
import * as acm8200 from "./components/acm8200";
import * as vpn8200 from "./components/vpn8200";
import * as dns8200 from "./components/dns8200";
import * as dockerRegistry8200 from "./components/dockerRegistry8200";
import * as nginx8200 from "./components/nginx8200";

const vpc = vpc8200.createVPC();
const authenticationCertificate = acm8200.importClientCertificates(
  "pAuthenticationCertificate"
);
const serverCertificate = acm8200.importServerCertificates(
  "pServerCertificate"
);

const dns = dns8200.DNS(vpc.vpnVPC[0]);
const dockerRegistry = dockerRegistry8200.DockerRegistry(vpc.vpnVPC[0]);
const vpn = vpn8200.VPN8200(
  authenticationCertificate,
  serverCertificate,
  vpc.vpnVPC[0].id,
  dns
);

const cluster8200 = eks8200.createEKS(vpc.eksVPC, "8200-cluster", vpc.vpcId);
const nginxService = nginx8200.createNginx(cluster8200);

export const vpcId = vpc.vpcId;
export const vpnEndpoint = vpn.dnsName;
export const dockerRegistryIP = dockerRegistry.privateIp;
export const dnsIP = dns.privateIp;
export const privateElb = nginxService;
export const kubeconfig = cluster8200.kubeconfig;
