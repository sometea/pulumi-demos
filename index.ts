import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import *  as awsx from "@pulumi/awsx";


const cluster = new aws.ecs.Cluster("cluster", {});

const repository = new awsx.ecr.Repository("repository", {});

const image = new awsx.ecr.Image("image", {
    repositoryUrl: repository.url,
    path: "./app",
});

const alb = new awsx.lb.ApplicationLoadBalancer("loadbalancer");

const service = new awsx.ecs.FargateService("service", {
    cluster: cluster.arn,
    desiredCount: 1,
    assignPublicIp: true,
    taskDefinitionArgs: {
        container: {
            image: image.imageUri,
            essential: true,
            memory: 128,
            portMappings: [{
              containerPort: 80,
              hostPort: 80,
              targetGroup: alb.defaultTargetGroup
            }],
        },
    },
});

export const url = alb.loadBalancer.dnsName;