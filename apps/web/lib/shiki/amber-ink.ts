import type { ThemeRegistration } from "shiki";

export const amberInk: ThemeRegistration = {
  name: "amber-ink",
  type: "dark",
  colors: {
    "editor.background": "#08090c",
    "editor.foreground": "#e6e9ee",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#565d6b", fontStyle: "italic" },
    },
    {
      scope: ["string", "string.quoted", "string.template"],
      settings: { foreground: "#7fd88f" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "storage.type",
        "storage.modifier",
        "keyword.operator.new",
      ],
      settings: { foreground: "#f5a623" },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "variable.other.constant",
      ],
      settings: { foreground: "#ff7a6b" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call entity.name.function",
      ],
      settings: { foreground: "#e2c88a" },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
        "entity.other.inherited-class",
      ],
      settings: { foreground: "#6cb6ff" },
    },
    {
      scope: ["variable", "variable.other", "variable.parameter"],
      settings: { foreground: "#e6e9ee" },
    },
    {
      scope: ["variable.other.property", "support.variable.property", "meta.object-literal.key"],
      settings: { foreground: "#cdd2db" },
    },
    {
      scope: ["keyword.operator", "punctuation"],
      settings: { foreground: "#98a0ad" },
    },
    {
      scope: ["entity.name.tag"],
      settings: { foreground: "#f5a623" },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: "#6cb6ff" },
    },
  ],
};
