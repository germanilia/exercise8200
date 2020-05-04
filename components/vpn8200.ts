import * as aws from "@pulumi/aws";
import { Output } from "@pulumi/pulumi/output";

export function VPN8200(
  authCertificate: aws.acm.Certificate,
  serverCertificate: aws.acm.Certificate,
  vpnSubnetId: Output<string>,
  dns:aws.ec2.Instance
): aws.ec2clientvpn.Endpoint {
  const vpn = new aws.ec2clientvpn.Endpoint("8200vpn", {
    authenticationOptions: [
      {
        rootCertificateChainArn: authCertificate.arn,
        type: "certificate-authentication",
      },
    ],
    clientCidrBlock: "10.1.0.0/16",
    connectionLogOptions: {
      enabled: false,
    },
    description: "clientvpn-8200",
    serverCertificateArn: serverCertificate.arn,
    dnsServers: [dns.privateIp]
  });

  const networkAssociation = new aws.ec2clientvpn.NetworkAssociation("8200na", {
    clientVpnEndpointId: vpn.id,
    subnetId: vpnSubnetId,
  });

  const fs = require("fs");

  return vpn;
}
