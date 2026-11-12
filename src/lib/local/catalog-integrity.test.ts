import { describe, expect, it } from "vitest";
import { buildCatalog, buildLibrary } from "./catalog";
import { resolveVisual, REVIEW_LOG } from "./exercise-media";
import { LIBRARY_MEDIA } from "./library-media";

const MISSING_BEFORE = ["ex-face-pull", "ex-rosca-elastico", "ex-agachamento-goblet", "ex-ponte-gluteo", "ex-kettlebell-swing", "ex-abducao-elastico", "ex-abdominal-polia", "ex-dead-bug"];

describe("integridade do catálogo de imagens", () => {
  const seeds = buildCatalog();
  const lib = buildLibrary();
  const all = [...seeds, ...lib];

  it("tem 1.145 registros com IDs únicos e preservados", () => {
    expect(seeds).toHaveLength(34);
    expect(lib).toHaveLength(1111);
    expect(new Set(all.map((e) => e.id)).size).toBe(1145);
    expect(lib[0]?.id).toBe("lib-0000");
    expect(lib[1110]?.id).toBe("lib-1110");
    expect(seeds.every((e) => e.id.startsWith("ex-"))).toBe(true);
  });

  it("todos os 1.111 lib-* resolvem para o GIF CDN do mesmo índice", () => {
    for (const e of lib) {
      const v = resolveVisual(e.id, e.name);
      expect(v?.src).toBe(LIBRARY_MEDIA[Number(e.id.slice(4))]);
      expect(v?.src).toMatch(/^\/__l5e\/assets-v1\/.+\/im_ex\d+\.gif$/);
    }
  });

  it("todos os 34 seeds têm imagem, inclusive os 8 que estavam sem", () => {
    for (const e of seeds) expect(resolveVisual(e.id, e.name)?.src, e.id).toBeTruthy();
    for (const id of MISSING_BEFORE) expect(resolveVisual(id)?.source).toBe("original");
  });

  it("não inventa aprovação: sem registro persistido, fica pendente", () => {
    for (const e of all) if (!REVIEW_LOG[e.id]) expect(resolveVisual(e.id)?.reviewStatus).toBe("pending");
  });
});
