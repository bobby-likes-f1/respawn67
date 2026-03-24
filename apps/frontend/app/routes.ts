import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),

  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("backlog", "routes/backlog.tsx"),
  route("games", "routes/games.tsx"),
] satisfies RouteConfig;
