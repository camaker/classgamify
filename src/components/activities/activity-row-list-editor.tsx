import { splitActivityContentRow } from '@/activities/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { m } from '@/locale/paraglide/messages';
import { cn } from '@/lib/utils';
import { IconChevronDown, IconPlus, IconTrash } from '@tabler/icons-react';
import { type ComponentProps, useEffect, useId, useRef, useState } from 'react';

type ActivityRowListColumn = {
  key: string;
  label: string;
  placeholder?: string;
  /** Wider inputs take a full row on small screens. */
  wide?: boolean;
};

type ActivityRowListEditorProps = {
  addLabel: string;
  columns: ActivityRowListColumn[];
  onChange: (value: string) => void;
  rowLabel: (rowNumber: number) => string;
  /** Props for the plain-text fallback, which keeps the form field name. */
  textareaProps: ComponentProps<typeof Textarea>;
  value: string;
};

const ROW_SEPARATOR = ' | ';

/**
 * Edits one-row-per-line activity content (questions, pairs, groups) as a
 * list of labeled inputs. The form value stays the same pipe-separated text
 * the validator parses, and "Edit as text" still allows bulk pasting.
 */
export function ActivityRowListEditor({
  addLabel,
  columns,
  onChange,
  rowLabel,
  textareaProps,
  value,
}: ActivityRowListEditorProps) {
  const baseId = useId();
  const [rows, setRows] = useState(() => parseRows(value, columns.length));
  const lastEmitted = useRef(value);

  // Content loaded from outside the editor (starter scaffold, AI draft,
  // text mode) replaces the rows. Blank rows the teacher just added stay.
  useEffect(() => {
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    setRows(parseRows(value, columns.length));
  }, [value, columns.length]);

  function commit(nextRows: string[][]) {
    setRows(nextRows);
    const serialized = serializeRows(nextRows);
    lastEmitted.current = serialized;
    onChange(serialized);
  }

  function updateCell(rowIndex: number, columnIndex: number, text: string) {
    commit(
      rows.map((row, index) =>
        index === rowIndex
          ? row.map((cell, cellIndex) =>
              cellIndex === columnIndex ? text : cell
            )
          : row
      )
    );
  }

  return (
    <div className="grid gap-3">
      <ol className="grid gap-3">
        {rows.map((row, rowIndex) => {
          const label = rowLabel(rowIndex + 1);

          return (
            <li
              // Rows have no stable id until saved; position is the identity.
              key={rowIndex}
              className="grid gap-3 rounded-lg border bg-background p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm">{label}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={m.activity_form_rows_remove({ label })}
                  onClick={() =>
                    commit(rows.filter((_, index) => index !== rowIndex))
                  }
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {columns.map((column, columnIndex) => {
                  const inputId = `${baseId}-${rowIndex}-${column.key}`;

                  return (
                    <div
                      key={column.key}
                      className={cn(
                        'grid gap-1.5',
                        column.wide && 'sm:col-span-2'
                      )}
                    >
                      <label
                        htmlFor={inputId}
                        className="font-medium text-muted-foreground text-sm"
                      >
                        {column.label}
                      </label>
                      <Input
                        id={inputId}
                        value={row[columnIndex] ?? ''}
                        placeholder={column.placeholder}
                        onChange={(event) =>
                          updateCell(rowIndex, columnIndex, event.target.value)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={() =>
          setRows([...rows, Array.from({ length: columns.length }, () => '')])
        }
      >
        <IconPlus className="size-4" />
        {addLabel}
      </Button>

      <details className="group">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-muted-foreground text-sm hover:text-foreground [&::-webkit-details-marker]:hidden">
          <IconChevronDown
            aria-hidden="true"
            className="size-4 transition-transform group-open:rotate-180"
          />
          {m.activity_form_rows_edit_as_text()}
        </summary>
        <Textarea
          {...textareaProps}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'mt-2 max-h-60 font-mono text-sm',
            textareaProps.className
          )}
          rows={Math.min(Math.max(rows.length, 3), 10)}
        />
      </details>
    </div>
  );
}

function parseRows(value: string, columnCount: number): string[][] {
  return value
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const parts = splitActivityContentRow(line);
      // Extra separators stay in the last column so nothing is lost.
      const cells = parts.slice(0, columnCount);
      if (parts.length > columnCount) {
        cells[columnCount - 1] = parts
          .slice(columnCount - 1)
          .join(ROW_SEPARATOR);
      }
      while (cells.length < columnCount) cells.push('');
      return cells;
    });
}

/**
 * Keeps every column in its position (an empty middle column stays empty so
 * a later column is not read as the wrong field), drops trailing empty
 * columns, and skips rows that are still completely blank.
 */
function serializeRows(rows: string[][]): string {
  return rows
    .map((row) => {
      const cells = row.map((cell) =>
        cell.replace(/[|｜\t\r\n]+/gu, ' ').trim()
      );
      while (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
      return cells.join(ROW_SEPARATOR);
    })
    .filter((line) => line.length > 0)
    .join('\n');
}
