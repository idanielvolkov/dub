// Middleware runs on the Node.js runtime in this self-hosted deployment, so it
// can use Prisma's native MySQL connection instead of PlanetScale's HTTP adapter.
export { prisma as prismaEdge } from "./index";
