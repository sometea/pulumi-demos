import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { createLambdaRoute } from "./lambdaRoute";
import { Runtime } from "@pulumi/aws/lambda";

const apigw = new aws.apigatewayv2.Api("httpApiGateway", {
    protocolType: "HTTP",
});

const f = new aws.lambda.CallbackFunction<any, any>("helloWorld", {
    runtime: Runtime.NodeJS18dX,
    callback: (req, ctx) => Promise.resolve({
        message: "Hello JavaLand!",
        req,
        ctx
    }),
});

const route = createLambdaRoute(apigw, f);

const stage = new aws.apigatewayv2.Stage("apiStage", {
    apiId: apigw.id,
    name: pulumi.getStack(),
    routeSettings: [
        {
            routeKey: route.routeKey,
            throttlingBurstLimit: 5000,
            throttlingRateLimit: 10000,
        },
    ],
    autoDeploy: true,
}, { dependsOn: [route] });

export const endpoint = pulumi.interpolate`${apigw.apiEndpoint}/${stage.name}`;