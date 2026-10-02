import { Fragment } from 'react';

/** Splits copy into per-word spans so scroll animations can drive each word.
 *  Purely presentational — the text itself is unchanged. */
export default function Words({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="fx-w"><i>{w}</i></span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}
