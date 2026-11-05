import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/hoje" });
  },
  head: () => ({
    meta: [
      { title: "Coach Osmar — Treinos e evolução" },
      { name: "description", content: "Acompanhe treinos, rotinas e evolução com o Coach Osmar." },
      { property: "og:title", content: "Coach Osmar — Treinos e evolução" },
      { property: "og:description", content: "Acompanhe treinos, rotinas e evolução com o Coach Osmar." },
    ],
  }),
});
