import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ulid } from "ulid";

const { TABLE_NAME } = process.env;

const client = new DynamoDB({});

const handler: APIGatewayProxyHandlerV2 = async () => {
  const payload = marshall({
    pk: "EVENT",
    sk: `EVENT#${ulid()}`
  });

  await client.putItem({ TableName: TABLE_NAME as string, Item: payload });

  return "it works";
};

export { handler };
