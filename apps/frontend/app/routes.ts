import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("home", "routes/home.tsx"),
  route("backlog", "routes/backlog.tsx"),
  route("games", "routes/games.tsx"),
] satisfies RouteConfig;
