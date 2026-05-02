import { MaskMap } from "../types/types";

export function createStreamUnmasker(map: MaskMap) {
  let buffer = "";

  return function processChunk(chunk: string) {
    buffer += chunk;

    let output = buffer;

    // try replacing tokens
    for (const token in map) {
      output = output.split(token).join(map[token]);
    }

    // keep last part in buffer (in case token is incomplete)
    buffer = output.slice(-50); // keep tail safe

    return output.slice(0, -50); // emit safe part
  };
}