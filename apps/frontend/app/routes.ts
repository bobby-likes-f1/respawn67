import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),

  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("backlog", "routes/backlog.tsx"),
  route("catalogue", "routes/catalogue.tsx"),
  route("community", "routes/community.tsx"),
  route("articles", "routes/articles.tsx"),
  route("articles/write", "routes/articles.write.tsx"),
  route("articles/:id", "routes/articles.$id.tsx"),
  route("articles/:id/edit", "routes/articles.edit.$id.tsx"),
  route("games", "routes/games.tsx"),
  route("games/:id", "routes/game.$id.tsx"),
  route("games/:id/community", "routes/game.$id.community.tsx"),
  route("games/:gameId/reviews/:userId", "routes/game.$gameId.reviews.$userId.tsx"),
  route("games/:id/community/guides/new", "routes/game.$id.community.guides.new.tsx"),
  route("games/:id/community/guides/:guideId", "routes/game.$id.community.guides.$guideId.tsx"),
  route(
    "games/:id/community/guides/:guideId/edit",
    "routes/game.$id.community.guides.$guideId.edit.tsx",
  ),
  route("account", "routes/account.tsx"),
  route("users/:id", "routes/user.$id.tsx"),
  route("lists", "routes/lists.tsx"),
  route("lists/:id", "routes/list.$id.tsx"),
  route("articles", "routes/articles.tsx"),
  route("articles/write", "routes/articles.write.tsx"),
  route("articles/:id", "routes/articles.$id.tsx"),
  route("articles/:id/edit", "routes/articles.edit.$id.tsx"),
] satisfies RouteConfig;
