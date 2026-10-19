import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/treinos" });
  },
  head: () => ({
    meta: [
      { title: "Coach Osmar — Treinos e evolução" },
      { name: "description", content: "Acompanhe treinos, evolução física e finanças com o Coach Osmar." },
      { property: "og:title", content: "Coach Osmar — Treinos e evolução" },
      { property: "og:description", content: "Acompanhe treinos, evolução física e finanças com o Coach Osmar." },
    ],
  }),
});
