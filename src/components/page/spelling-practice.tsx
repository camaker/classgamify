import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  buildSpellingHint,
  countCorrectSpellings,
  isSpellingCorrect,
  parseSpellingWords,
  SPELLING_MAX_WORDS,
  SPELLING_SAMPLE_WORDS,
  shuffleWords,
} from '@/pages/spelling-practice';
import { IconCheck, IconRefresh, IconVolume, IconX } from '@tabler/icons-react';
import { useEffect, useId, useState } from 'react';

/**
 * Working spelling drill for the spelling generator guide. The teacher pastes
 * a word list, students type each word from its hint, and answers are checked
 * in the browser. Nothing is saved; saving as a scored assignment is the
 * teacher-account flow linked from the page.
 */
export function SpellingPractice() {
  const textId = useId();
  const [text, setText] = useState(SPELLING_SAMPLE_WORDS.join('\n'));
  const [words, setWords] = useState<string[]>(SPELLING_SAMPLE_WORDS);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    setSpeechSupported(
      'speechSynthesis' in window &&
        typeof SpeechSynthesisUtterance !== 'undefined'
    );
  }, []);

  function reset(nextWords: string[]) {
    setWords(nextWords);
    setAnswers({});
    setChecked(false);
  }

  function speak(word: string) {
    if (!speechSupported) return;
    const utterance = new SpeechSynthesisUtterance(word);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  const parsedCount = parseSpellingWords(text).length;
  const correct = countCorrectSpellings(words, answers);

  return (
    <div className="grid gap-5 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="grid gap-2">
        <label className="font-semibold text-sm" htmlFor={textId}>
          Your word list (one word per line, up to {SPELLING_MAX_WORDS})
        </label>
        <Textarea
          id={textId}
          rows={5}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            disabled={parsedCount === 0}
            onClick={() => reset(parseSpellingWords(text))}
          >
            Make spelling practice
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={words.length < 2}
            onClick={() => reset(shuffleWords(words))}
          >
            <IconRefresh className="size-4" aria-hidden="true" />
            Shuffle
          </Button>
        </div>
      </div>

      {words.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Add at least one word to start.
        </p>
      ) : (
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setChecked(true);
          }}
        >
          <ol className="grid gap-3 sm:grid-cols-2">
            {words.map((word, index) => {
              const answer = answers[word] ?? '';
              const isCorrect = isSpellingCorrect(word, answer);

              return (
                <li
                  className={cn(
                    'grid gap-2 rounded-lg border bg-background p-3',
                    checked &&
                      (isCorrect ? 'border-primary' : 'border-destructive')
                  )}
                  key={word}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-base tracking-widest">
                      {buildSpellingHint(word)}
                    </span>
                    {speechSupported ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Hear word ${index + 1}`}
                        onClick={() => speak(word)}
                      >
                        <IconVolume className="size-4" aria-hidden="true" />
                      </Button>
                    ) : null}
                  </div>
                  <Input
                    aria-label={`Spell word ${index + 1}`}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={answer}
                    onChange={(event) => {
                      setChecked(false);
                      setAnswers((current) => ({
                        ...current,
                        [word]: event.target.value,
                      }));
                    }}
                  />
                  {checked ? (
                    <p
                      className={cn(
                        'flex items-center gap-1.5 text-sm',
                        isCorrect ? 'text-primary' : 'text-destructive'
                      )}
                    >
                      {isCorrect ? (
                        <IconCheck className="size-4" aria-hidden="true" />
                      ) : (
                        <IconX className="size-4" aria-hidden="true" />
                      )}
                      {isCorrect ? 'Correct' : `Answer: ${word}`}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit">Check answers</Button>
            <Button type="button" variant="ghost" onClick={() => reset(words)}>
              Start over
            </Button>
            {checked ? (
              <output className="font-semibold text-sm">
                {correct} of {words.length} correct
              </output>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
