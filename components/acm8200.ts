import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as tls from "@pulumi/tls";
import * as fs from "fs";

export function importClientCertificates(name:string){
  return importCertificates(name, "client");
}

export function importServerCertificates(name:string){
  return importCertificates(name, "server");
}

function importCertificates(
  certName: string,
  target: string,
): aws.acm.Certificate {
  const cert = new aws.acm.Certificate(`${certName}`, {
    certificateBody: fs.readFileSync(
      `./resources/certificates/server.crt`,
      "utf-8"
    ),
    privateKey: fs.readFileSync(
      `./resources/certificates/server.key`,
      "utf-8"
    ),
    certificateChain: fs.readFileSync(
      `./resources/certificates/ca.crt`,
      "utf-8"
    ),
  });

  return cert;
}




