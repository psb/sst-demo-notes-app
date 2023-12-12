import { ApiStack } from "./ApiStack";
import * as iam from "aws-cdk-lib/aws-iam";
import { StorageStack } from "./StorageStack";
import { Cognito, StackContext, use } from "sst/constructs";

export function AuthStack({ stack, app }: StackContext) {
  const { api } = use(ApiStack);
  const { bucket } = use(StorageStack);

  const auth = new Cognito(stack, "Auth", {
    login: ["email"],
  });

  auth.attachPermissionsForAuthUsers(stack, [
    api,
    new iam.PolicyStatement({
      actions: ["s3:*"],
      effect: iam.Effect.ALLOW,
      resources: [
        bucket.bucketArn + "/private/${cognito-identity.amazonaws.com:sub}/*",
      ],
    }),
  ]);

  stack.addOutputs({
    Region: app.region,
    UserPoolId: auth.userPoolId,
    UserPoolClientId: auth.userPoolClientId,
    IdentityPoolId: auth.cognitoIdentityPoolId,
  });

  return { auth };
}

// pnpm dlx aws-api-gateway-cli-test \
// --user-pool-id='us-east-1_Bs2q5s6w1' \
// --app-client-id='2njvgineb81tq19ur374cgiifv' \
// --cognito-region='us-east-1' \
// --identity-pool-id='us-east-1:de2ef346-7912-4c31-86e8-ea76a3b43c9f' \
// --invoke-url='https://bsj6r8q746.execute-api.us-east-1.amazonaws.com' \
// --api-gateway-region='us-east-1' \
// --username='admin@example.com' \
// --password='Passw0rd!' \
// --path-template='/notes' \
// --method='POST' \
// --body='{"content":"hello world","attachment":"hello.jpg"}'
