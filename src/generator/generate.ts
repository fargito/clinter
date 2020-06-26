import { Linter } from "eslint";
import { generateTestESLintConfig } from "./testFramework";
import { generateTypescriptESLintConfig } from "./typescript";
import { generateEnvESLintConfig } from "./env";
import { generateFrontFrameworkESLintConfig } from "./frontFramework";
import { generatePrettierESlintConfig } from "./prettier";
import { pipe } from "../utility";
import { eslintBaseConfig } from "./baseConfigs/eslintBaseConfig";
import { AnswerObject } from "../types";
import { ESLintGenerator } from "./types";

function concatESlintObjects<T extends Record<string, unknown>>(prevObject: T, nextObject: T): T {
  return { ...prevObject, ...nextObject };
}

function concatESlintArrays<T extends Array<string> | string>(prev: T, next: T): Array<string> {
  const prevArray = typeof prev === "string" ? [prev] : prev;
  const nextArray = typeof next === "string" ? [next] : next;

  return [...prevArray, ...nextArray];
}

export function concatConfig(config: Linter.Config): (prevConfig: Linter.Config) => Linter.Config {
  return (prevConfig) => ({
    ...prevConfig,
    ...config,
    extends: concatESlintArrays(prevConfig.extends ?? [], config.extends ?? []),
    rules: concatESlintObjects(prevConfig.rules ?? {}, config.rules ?? {}),
    plugins: concatESlintArrays(prevConfig.plugins ?? [], config.plugins ?? []),
    parserOptions: concatESlintObjects(prevConfig.parserOptions ?? [], config.parserOptions ?? []),
    env: concatESlintObjects(prevConfig.env ?? {}, config.env ?? {}),
  });
}

const generateBaseESLintConfig: ESLintGenerator = (_userAnswers) => {
  return concatConfig(eslintBaseConfig);
};

export function generateEslintConfig(userAnswers: AnswerObject): Linter.Config {
  return pipe(
    generateBaseESLintConfig(userAnswers),
    generateTypescriptESLintConfig(userAnswers),
    generateEnvESLintConfig(userAnswers),
    generateTestESLintConfig(userAnswers),
    generateFrontFrameworkESLintConfig(userAnswers),
    // Prettier must be at the end of the list to avoid potential conflicts
    generatePrettierESlintConfig(userAnswers)
  )({});
}
