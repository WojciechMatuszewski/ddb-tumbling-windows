import {
  APIGatewayProxyHandlerV2,
  DynamoDBRecord,
  DynamoDBStreamEvent,
  DynamoDBStreamHandler
} from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ulid } from "ulid";

const { TABLE_NAME } = process.env;

const client = new DynamoDB({});

type TumblingWindowsConfig = {
  state: Record<string, string>;
  isFinalInvokeForWindow: boolean;
  isWindowTerminatedEarly: boolean;
  shardId: string;
};

const handler = async (event: DynamoDBStreamEvent & TumblingWindowsConfig) => {
  const records = event.Records;
  console.log({
    isFinalInvokeForWindow: event.isFinalInvokeForWindow,
    isWindowTerminatedEarly: event.isWindowTerminatedEarly
  });

  const filteredRecords = records.filter(isEventRecord);

  console.log("Previous state", { state: event.state });
  console.log(`Found ${filteredRecords.length} events`);

  const newCount = getPreviousCount(event.state) + filteredRecords.length;
  console.log("Next state", { state: { events: newCount } });

  if (event.isFinalInvokeForWindow || event.isWindowTerminatedEarly) {
    const countID = ulid();
    console.log(`WRITING COUNT: ${countID}`);

    const item = marshall({
      pk: "COUNT",
      sk: `COUNT#${ulid()}`,
      count: newCount,
      shard: event.shardId,
      hasEvents: filteredRecords.length !== 0
    });

    return await client.putItem({
      TableName: TABLE_NAME as string,
      Item: item
    });
  }

  if (filteredRecords.length == 0) return { state: { events: 0 } };

  return {
    state: {
      events: newCount
    }
  };
};

function isEventRecord(record: DynamoDBRecord) {
  if (!record.dynamodb?.NewImage) return false;
  const {
    dynamodb: { NewImage }
  } = record;

  const data = unmarshall(NewImage as any);
  console.log({ data });
  return data.pk === "EVENT";
}

function getPreviousCount(state: any) {
  if (!state.events) return 0;

  if (typeof state.events === "string") return parseInt(state.events, 10);

  return state.events;
}

export { handler };
