import { Subnet } from "@pulumi/awsx/ec2/subnet";
import { EC28200 } from "./ec28200";
import * as fs from "fs";
export function DNS(subnet: Subnet) {
  const userData = `
#!/bin/bash
sudo apt-get update -y
sudo apt-get install bind9 bind9utils bind9-doc -y
sudo sh -c 'cat > /etc/bind/named.conf.options  <<EOL
options {
  directory "/var/cache/bind";
  recursion yes;
  allow-query { any; };
  dnssec-enable yes;
  dnssec-validation yes;
  auth-nxdomain no;
  listen-on-v6 { any; };
  forwarders {
    10.0.0.2;
  };
  forward only;
};
'
sudo service bind9 restart
  `;
  const dns = EC28200(subnet, userData, "dns");
  return dns;
}
