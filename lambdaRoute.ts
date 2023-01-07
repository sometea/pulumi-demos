
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Api } from "@pulumi/aws/apigatewayv2";
import { CallbackFunction } from "@pulumi/aws/lambda";

// const lambdaRole = new aws.iam.Role("lambdaRole", {
//   assumeRolePolicy: {
//     Version: "2012-10-17",
//     Statement: [
//       {
//         Action: "sts:AssumeRole",
//         Principal: {
//           Service: "lambda.amazonaws.com",
//         },
//         Effect: "Allow",
//         Sid: "",
//       },
//     ],
//   },
// });

// const lambdaRoleAttachment = new aws.iam.RolePolicyAttachment("lambdaRoleAttachment", {
//   role: lambdaRole,
//   policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
// });

export function createLambdaRoute(apiGateway: Api, lambda: CallbackFunction<unknown, unknown>) {
  const lambdaPermission = new aws.lambda.Permission("lambdaPermission", {
    action: "lambda:InvokeFunction",
    principal: "apigateway.amazonaws.com",
    function: lambda,
    sourceArn: pulumi.interpolate`${apiGateway.executionArn}/*/*`,
  }, { dependsOn: [apiGateway, lambda] });

  const integration = new aws.apigatewayv2.Integration("lambdaIntegration", {
    apiId: apiGateway.id,
    integrationType: "AWS_PROXY",
    integrationUri: lambda.arn,
    integrationMethod: "POST",
    payloadFormatVersion: "2.0",
    passthroughBehavior: "WHEN_NO_MATCH",
  });

  const route = new aws.apigatewayv2.Route("apiRoute", {
    apiId: apiGateway.id,
    routeKey: "$default",
    target: pulumi.interpolate`integrations/${integration.id}`,
  });

  return route;
}