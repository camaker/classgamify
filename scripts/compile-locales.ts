import { compile } from '@inlang/paraglide-js';
import { getParaglideCompilerOptions } from './paraglide-compiler-options';

await compile(getParaglideCompilerOptions());
