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
  route("users/:id", "routes/user.$id.tsx"),
  route("lists", "routes/lists.tsx"),
  route("lists/:id", "routes/list.$id.tsx"),
  route("articles", "routes/articles.tsx"),
  route("articles/write", "routes/articles.write.tsx"),
  route("articles/:id", "routes/articles.$id.tsx"),
  route("articles/:id/edit", "routes/articles.edit.$id.tsx"),
] satisfies RouteConfig;
