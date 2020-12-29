import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ulid } from "ulid";

const client = new DynamoDB({});

const TableName = "tumbling-windows-table";
const ITERATIONS = 100;
const SLEEP_MS = 100;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const createSales = async () => {
  for (let i = 0; i < ITERATIONS; i++) {
    const item = marshall({
      pk: "EVENT",
      sk: `EVENT#${ulid()}`
    });

    await client.putItem({
      TableName,
      Item: item
    });
    console.log("item generated");

    await sleep(SLEEP_MS);
  }
};

const main = async () => {
  await createSales();
};

main();
