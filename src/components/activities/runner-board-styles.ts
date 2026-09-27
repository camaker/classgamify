/**
 * Shared look for student runner boards (group sort, line match, matching
 * pairs, listening, open box, fill blank). One framed board per activity,
 * large tap targets, and a selected state that reads from across a room.
 */

/** The single frame around a board. Progress lives in the submit bar. */
export const RUNNER_BOARD_FRAME =
  'grid gap-5 rounded-2xl border bg-background p-4 shadow-sm md:p-6';

/** One-line instruction at the top of a board. */
export const RUNNER_BOARD_HELP = 'text-base text-muted-foreground leading-7';

/** A tappable card: prompt, choice, item, track, or box. */
export const RUNNER_TILE =
  'min-h-14 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-left text-base font-medium ' +
  'shadow-[0_2px_0_rgb(0_0_0/0.06)] transition-[border-color,background-color,transform] ' +
  'hover:border-primary/60 active:translate-y-px ' +
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50 ' +
  'disabled:cursor-default disabled:hover:border-border';

/** The tile the student is currently acting on. */
export const RUNNER_TILE_SELECTED =
  'border-primary bg-primary/10 ring-2 ring-primary/30 hover:border-primary';

/** A tile that already holds an answer. */
export const RUNNER_TILE_ANSWERED = 'border-primary/40 bg-primary/5';

/** A drop target that can take the selected tile right now. */
export const RUNNER_TARGET_READY =
  'border-dashed border-primary/70 bg-primary/5 hover:bg-primary/10';

/** Section label inside a board, such as a column or group name. */
export const RUNNER_BOARD_LABEL = 'font-semibold text-base';
