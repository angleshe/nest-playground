import tsEslint from 'typescript-eslint';
import eslint from '@eslint/js';
/**
 * @type {import('eslint').Linter.Config}
 */
export default tsEslint.config(eslint.configs.recommended, tsEslint.configs.recommended, [
  {
    // rules: {
    //   '@typescript-eslint/consistent-type-imports': [
    //     'error',
    //     { prefer: 'type-imports', disallowTypeAnnotations: false },
    //   ],
    // },
  },
]);
