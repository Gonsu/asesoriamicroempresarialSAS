import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Nada de HTML sin escapar: el contenido editable y los mensajes se muestran como texto.
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: "No uses dangerouslySetInnerHTML: muestra el contenido como texto.",
        },
        {
          selector: "AssignmentExpression[left.property.name=/^(innerHTML|outerHTML)$/]",
          message: "No asignes innerHTML/outerHTML: usa textContent o JSX.",
        },
        {
          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
          message: "No uses insertAdjacentHTML.",
        },
      ],
    },
  },
  {
    // zod siempre desde @/lib/zod, que desactiva el JIT (la CSP no permite eval).
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/zod.ts"],
    rules: {
      "no-restricted-imports": ["error", { paths: [{ name: "zod", message: "Importa z desde @/lib/zod." }] }],
    },
  },
  {
    // Los fixtures de Playwright reciben una función `use` que no es un hook de React.
    files: ["e2e/**/*.ts"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
  {
    // Los tests pueden limpiar el DOM con innerHTML.
    files: ["**/*.test.{ts,tsx}"],
    rules: { "no-restricted-syntax": "off" },
  },
);
