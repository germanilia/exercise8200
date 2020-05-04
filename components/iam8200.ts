import * as aws from "@pulumi/aws";

// Creates a role and attches the EKS worker node IAM managed policies
export function createRole(
  name: string,
  assumePolicyDocument: any,
  extraPolicies: string[] = []
): aws.iam.Role {
  const role = new aws.iam.Role(name, {
    assumeRolePolicy: assumePolicyDocument,
  });

  let counter = 0;
  for (const policy of extraPolicies) {
    // Create RolePolicyAttachment without returning it.
    const rpa = new aws.iam.RolePolicyAttachment(
      `${name}policy${counter++}`,
      { policyArn: policy, role: role }
    );
  }

  return role;
}
