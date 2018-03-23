import { atEndPattern, openedCurlyBracket, variablePattern, wordEndPattern } from './globals';
import unclosed from './unclosed';

export default function tokenizeAtRule (state) {
    // it's an interpolation
  if (state.css.charCodeAt(state.pos + 1) === openedCurlyBracket) {
    state.nextPos = state.css.indexOf('}', state.pos + 2);

    if (state.nextPos === -1) {
      unclosed(state, 'interpolation');
    }

    state.cssPart = state.css.slice(state.pos, state.nextPos + 1);
    state.lines = state.cssPart.split('\n');
    state.lastLine = state.lines.length - 1;

    if (state.lastLine > 0) {
      state.nextLine = state.line + state.lastLine;
      state.nextOffset = state.nextPos - state.lines[state.lastLine].length;
    }
    else {
      state.nextLine = state.line;
      state.nextOffset = state.offset;
    }

    state.tokens.push([
      'word', state.cssPart,
      state.line, state.pos - state.offset,
      state.nextLine, state.nextPos - state.nextOffset
    ]);

    state.offset = state.nextOffset;
    state.line = state.nextLine;
  }
  else {
    atEndPattern.lastIndex = state.pos + 1;
    atEndPattern.test(state.css);
    const spaceColonPos = state.css.indexOf(' :', state.pos);

    if (atEndPattern.lastIndex === 0) {
      state.nextPos = state.css.length - 1;
    }
    // for cases where there is extra whitespace between a variable name and ":" (#92)
    // the regex passes if there is only whitespace (or nothing) between the at-word and " :"
    else if (
        spaceColonPos > state.pos &&
        /^\s*$/.test(state.css.slice(state.css.indexOf(' ', state.pos), spaceColonPos)) &&
        state.css.slice(state.pos, state.pos + 5) !== "@page"
    ) {
      state.nextPos = spaceColonPos + 1;
    }
    else {
      state.nextPos = atEndPattern.lastIndex - 2;
    }

    state.cssPart = state.css.slice(state.pos, state.nextPos + 1);
    state.token = 'at-word';

        // check if it's a variable
    if (variablePattern.test(state.cssPart)) {
      wordEndPattern.lastIndex = state.pos + 1;
      wordEndPattern.test(state.css);
      if (wordEndPattern.lastIndex === 0) {
        state.nextPos = state.css.length - 1;
      }
      else {
        state.nextPos = wordEndPattern.lastIndex - 2;
      }

      state.cssPart = state.css.slice(state.pos, state.nextPos + 1);
      state.token = 'word';
    }

    state.tokens.push([
      state.token, state.cssPart,
      state.line, state.pos - state.offset,
      state.line, state.nextPos - state.offset
    ]);
  }

  state.pos = state.nextPos;
}
