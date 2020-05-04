import * as k8s from "@pulumi/kubernetes";
import * as input from "@pulumi/kubernetes/types/input";
import * as eks from "@pulumi/eks";

export function createNginx(cluster: eks.Cluster): any {
  const name = "nginx";

  const ns = new k8s.core.v1.Namespace(
    name,
    {},
    { provider: cluster.provider }
  );

  //  the Namespace name
  const namespaceName = ns.metadata.apply((m) => m.name);

  // Create a NGINX Deployment
  const appLabels = { appClass: name };
  const tolerations: input.core.v1.Toleration[] = [
    {
      key: "kind",
      value: "nginx",
      effect: "NoSchedule",
    },
  ];
  const deployment = new k8s.apps.v1.Deployment(
    name,
    {
      metadata: {
        namespace: namespaceName,
        labels: appLabels,
      },
      spec: {
        replicas: 1,
        selector: { matchLabels: appLabels },
        template: {
          metadata: {
            labels: appLabels,
          },
          spec: {
            tolerations: tolerations,
            containers: [
              {
                name: name,
                image: "nginx:latest",
                ports: [{ name: "http", containerPort: 80 }],
              },
            ],
          },
        },
      },
    },
    {
      provider: cluster.provider,
    }
  );

  //  the Deployment name
  const deploymentName = deployment.metadata.apply((m) => m.name);

  // Create a LoadBalancer Service for the NGINX Deployment
  const service = new k8s.core.v1.Service(
    name,
    {
      metadata: {
        labels: appLabels,
        namespace: namespaceName,
      },
      spec: {
        type: "LoadBalancer",
        ports: [{ port: 80, targetPort: "http" }],
        selector: appLabels,
      },
    },
    {
      provider: cluster.provider,
    }
  );

  //  the Service name and public LoadBalancer Endpoint
  const serviceName = service.metadata.apply((m) => m.name);
  const serviceHostname = service.status.apply(
    (s) => s.loadBalancer.ingress[0].hostname
  );
}
