import type { ThemeRegistration } from "shiki";

export const amberPaper: ThemeRegistration = {
  name: "amber-paper",
  type: "light",
  colors: {
    "editor.background": "#f2f3f6",
    "editor.foreground": "#1a1e26",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#8b93a3", fontStyle: "italic" },
    },
    {
      scope: ["string", "string.quoted", "string.template"],
      settings: { foreground: "#1e7b3c" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "storage.type",
        "storage.modifier",
        "keyword.operator.new",
      ],
      settings: { foreground: "#9a5b00" },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "variable.other.constant",
      ],
      settings: { foreground: "#c22f1f" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call entity.name.function",
      ],
      settings: { foreground: "#7a5a10" },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
        "entity.other.inherited-class",
      ],
      settings: { foreground: "#0b62c4" },
    },
    {
      scope: ["variable", "variable.other", "variable.parameter"],
      settings: { foreground: "#1a1e26" },
    },
    {
      scope: ["variable.other.property", "support.variable.property", "meta.object-literal.key"],
      settings: { foreground: "#3d434d" },
    },
    {
      scope: ["keyword.operator", "punctuation"],
      settings: { foreground: "#6f7683" },
    },
    {
      scope: ["entity.name.tag"],
      settings: { foreground: "#9a5b00" },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: "#0b62c4" },
    },
  ],
};
