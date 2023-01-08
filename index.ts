import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { createLambdaRoute } from "./lambdaRoute";
import { Runtime } from "@pulumi/aws/lambda";
import { APIGatewayEvent, APIGatewayProxyResult, APIGatewayProxyResultV2, Context } from "aws-lambda";

interface HelloResult {
    message: string,
    req: APIGatewayEvent,
    ctx: Context
}

const apigw = new aws.apigatewayv2.Api("httpApiGateway", {
    protocolType: "HTTP",
});

const route = createLambdaRoute(apigw, new aws.lambda.CallbackFunction<APIGatewayEvent, HelloResult>("helloWorld", {
    runtime: Runtime.NodeJS18dX,
    callback: async (req, ctx) => ({
        message: "Hello JavaLand!",
        req,
        ctx
    }),
}));

const stage = new aws.apigatewayv2.Stage("apiStage", {
    apiId: apigw.id,
    name: pulumi.getStack(),
    autoDeploy: true,
});

export const endpoint = pulumi.interpolate`${apigw.apiEndpoint}/${stage.name}`;