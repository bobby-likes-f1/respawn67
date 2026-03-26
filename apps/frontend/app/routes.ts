import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),

  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("backlog", "routes/backlog.tsx"),
  route("catalogue", "routes/catalogue.tsx"),
  route("games", "routes/games.tsx"),
  route("games/:id", "routes/game.$id.tsx"),
  route("account", "routes/account.tsx"),
] satisfies RouteConfig;
