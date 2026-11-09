import { type Ship } from "@starnav/shared";

const modules = import.meta.glob<Ship>("../../../data/ships/*.json", { eager: true, import: "default" })
export const SHIPS: Ship[] = Object.values(modules).sort((a, b) => a.name.localeCompare(b.name))
