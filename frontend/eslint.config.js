import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
    // Ignore build output
    {
        ignores: ["dist"],
    },

    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },

        settings: {
            react: {
                version: "detect",
            },
        },

        plugins: {
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },

        rules: {
            // Base JS rules
            ...js.configs.recommended.rules,

            // React rules
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,

            // Vite + React Fast Refresh
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],

            // Optional but recommended
            "react/react-in-jsx-scope": "off", // React 17+
            "react/prop-types": "off", // nếu không dùng prop-types
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        },
    },
];
