import { defineBackend } from '@aws-amplify/backend';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as iam from 'aws-cdk-lib/aws-iam';
import { data } from './data/resource.js';
import { message } from './functions/message/resource';

const backend = defineBackend({
  data,
  message, // 関数のリソース設定をするために追加しておく
});

const redisStack = backend.createStack('RedisStack');

// VPCの作成
const vpc = new ec2.Vpc(redisStack, 'Vpc', {
  maxAzs: 2, // 2つのアベイラビリティゾーンを使用
  ipAddresses: ec2.IpAddresses.cidr('10.1.0.0/16'), // CIDRブロックを指定
  subnetConfiguration: [
    {
      subnetType: ec2.SubnetType.PRIVATE_ISOLATED, // NATゲートウェイなしのプライベートサブネット
      name: 'Private',
      cidrMask: 24,
    },
    // public と private のサブネットを追加する場合は以下のように追加する
    // {
    //   subnetType: ec2.SubnetType.PUBLIC,
    //   name: 'Public',
    //   cidrMask: 24,
    // },
    // {
    //   subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    //   name: 'Private',
    //   cidrMask: 24,
    // },
  ],
});

// Redis セキュリティグループの作成
const redisSecurityGroup = new ec2.SecurityGroup(
  redisStack,
  'RedisSecurityGroup',
  {
    vpc,
    description: 'Security group for Redis',
  },
);

// Lambda セキュリティグループの作成
const lambdaSecurityGroup = new ec2.SecurityGroup(
  redisStack,
  'LambdaSecurityGroup',
  {
    vpc,
    description: 'Security group for Lambda',
  },
);

// LambdaセキュリティグループからRedisセキュリティグループへのインバウンドルールを許可
redisSecurityGroup.addIngressRule(
  lambdaSecurityGroup,
  ec2.Port.tcp(6379),
  'Allow traffic from Lambda',
);

// NATゲートウェイなしのprivateサブネットを取得
const privateSubnetIds = vpc.isolatedSubnets.map((subnet) => subnet.subnetId);
// NATゲートウェイありのprivate のサブネットを追加する場合は以下のように追加する
// const privateSubnetIds = vpc.privateSubnets.map((subnet) => subnet.subnetId);

const redisSubnetGroup = new elasticache.CfnSubnetGroup(
  redisStack,
  'RedisSubnetGroup',
  {
    description: 'Subnet group for Redis',
    subnetIds: privateSubnetIds,
  },
);

// Redisクラスターの作成
const redisCluster = new elasticache.CfnCacheCluster(
  redisStack,
  'RedisCluster',
  {
    cacheNodeType: 'cache.t4g.micro',
    engine: 'redis',
    engineVersion: '6.2',
    numCacheNodes: 1,
    cacheSubnetGroupName: redisSubnetGroup.ref,
    vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
  },
);

// Redisクラスターがサブネットグループとセキュリティグループに依存するように設定
redisCluster.node.addDependency(redisSubnetGroup);
redisCluster.node.addDependency(redisSecurityGroup);

// backend から Lambda のリソースを取得
const messageLambda = backend.message;

// Lambdaの環境変数にRedisのエンドポイント情報を追加
messageLambda.addEnvironment(
  'REDIS_HOST',
  redisCluster.attrRedisEndpointAddress,
);
messageLambda.addEnvironment('REDIS_PORT', redisCluster.attrRedisEndpointPort);

// LambdaにEC2の操作権限を追加
messageLambda.resources.lambda.addToRolePolicy(
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: [
      'ec2:CreateNetworkInterface',
      // 必要に応じて他の操作も追加するが、以下は多分必要ない（念のために追加）
      'ec2:DescribeNetworkInterfaces',
      'ec2:DeleteNetworkInterface',
      'ec2:AssignPrivateIpAddresses',
      'ec2:UnassignPrivateIpAddresses',
    ],
    resources: ['*'], // 必要に応じてリソースを限定する
  }),
);

// LambdaにVPC設定を追加
// addPropertyOverride で VpcConfig を上書きする
messageLambda.resources.cfnResources.cfnFunction.addPropertyOverride(
  'VpcConfig',
  {
    SubnetIds: privateSubnetIds,
    SecurityGroupIds: [lambdaSecurityGroup.securityGroupId],
  },
);
