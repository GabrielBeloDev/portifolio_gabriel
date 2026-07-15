import type { ThemeRegistration } from "shiki";

/** Dark syntax theme derived from the site palette (ADR-0004): warm ink,
 *  amber keywords, one cool blue for types to balance the heat. */
export const amberInk: ThemeRegistration = {
  name: "amber-ink",
  type: "dark",
  colors: {
    "editor.background": "#0b0e12",
    "editor.foreground": "#e6e1d8",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#6f7683", fontStyle: "italic" },
    },
    {
      scope: ["string", "string.quoted", "string.template"],
      settings: { foreground: "#a8c08a" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "storage.type",
        "storage.modifier",
        "keyword.operator.new",
      ],
      settings: { foreground: "#ffb020" },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "variable.other.constant",
      ],
      settings: { foreground: "#e8927c" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call entity.name.function",
      ],
      settings: { foreground: "#ead9b0" },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
        "entity.other.inherited-class",
      ],
      settings: { foreground: "#8fb8d8" },
    },
    {
      scope: ["variable", "variable.other", "variable.parameter"],
      settings: { foreground: "#e6e1d8" },
    },
    {
      scope: ["variable.other.property", "support.variable.property", "meta.object-literal.key"],
      settings: { foreground: "#c9cfd6" },
    },
    {
      scope: ["keyword.operator", "punctuation"],
      settings: { foreground: "#9aa3ad" },
    },
    {
      scope: ["entity.name.tag"],
      settings: { foreground: "#ffb020" },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: "#8fb8d8" },
    },
  ],
};
