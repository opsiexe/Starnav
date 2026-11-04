import { readFileSync } from "node:fs";
import { normalizeShip } from "../packages/shared/src/wiki"

let shipList = readFileSync("/Users/math/Desktop/response.json", "utf-8")
let shipJson = JSON.parse(shipList)

let resultat = normalizeShip(shipJson.data)

console.dir(resultat, { depth: null })