import type { ThemeRegistration } from "shiki";

export const amberPaper: ThemeRegistration = {
  name: "amber-paper",
  type: "light",
  colors: {
    "editor.background": "#fbfaf7",
    "editor.foreground": "#1a1d21",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#8a857c", fontStyle: "italic" },
    },
    {
      scope: ["string", "string.quoted", "string.template"],
      settings: { foreground: "#55742d" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "storage.type",
        "storage.modifier",
        "keyword.operator.new",
      ],
      settings: { foreground: "#a05c08" },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "variable.other.constant",
      ],
      settings: { foreground: "#b4512e" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call entity.name.function",
      ],
      settings: { foreground: "#7a5a1e" },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
        "entity.other.inherited-class",
      ],
      settings: { foreground: "#2e6b99" },
    },
    {
      scope: ["variable", "variable.other", "variable.parameter"],
      settings: { foreground: "#1a1d21" },
    },
    {
      scope: ["variable.other.property", "support.variable.property", "meta.object-literal.key"],
      settings: { foreground: "#44494f" },
    },
    {
      scope: ["keyword.operator", "punctuation"],
      settings: { foreground: "#6f7680" },
    },
    {
      scope: ["entity.name.tag"],
      settings: { foreground: "#a05c08" },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: "#2e6b99" },
    },
  ],
};
