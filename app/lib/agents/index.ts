import { Pipeline } from "./agents/Pipeline";
import { research } from "./agents/researcher";
import { edit } from "./agents/editor";
import { write } from "./agents/writer";

async function main() {
  const userQuery = "Ethereum shared sequencing";
  const pipeline = new Pipeline();
  const result = await pipeline
    .push(research)
    .push(write)
    .push(edit)
    .run(userQuery);

  console.log(result);
}
