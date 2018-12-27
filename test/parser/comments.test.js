const test = require('ava');
const Comment = require('postcss/lib/comment');

const { parse, nodeToString } = require('../../lib');

test('inline comment', (t) => {
  const less = '// batman';
  const root = parse(less);
  const { first } = root;

  t.truthy(root);
  t.true(first instanceof Comment);
  t.true(first.inline);
  t.is(first.text, 'batman');
  t.is(nodeToString(root), less);
});

test('inline comment without leading space', (t) => {
  const less = '//batman';
  const root = parse(less);
  const { first } = root;

  t.truthy(root);
  t.true(first instanceof Comment);
  t.true(first.inline);
  t.is(first.text, 'batman');
  t.is(nodeToString(root), less);
});

test('inline comment with unclosed characters', (t) => {
  const less = `// unclosed ' test { test ( test /*`;
  const root = parse(less);
  const { first } = root;

  t.truthy(root);
  t.true(first instanceof Comment);
  t.true(first.inline);
  t.is(first.text, less.slice(3));
  t.is(nodeToString(root), less);
});

test('close empty', (t) => {
  const less = '// \n//';
  const root = parse(less);
  const { first, last } = root;

  t.truthy(root.nodes.length);
  t.is(first.text, '');
  t.is(last.text, '');
  t.is(nodeToString(root), less);
});

test('close inline and block', (t) => {
  const less = '// batman\n/* cleans the batcave */';
  const root = parse(less);
  const { first, last } = root;

  t.truthy(root.nodes.length);
  t.is(first.text, 'batman');
  t.is(last.text, 'cleans the batcave');
  t.is(nodeToString(root), less);
});

test('parses multiline comments', (t) => {
  const text = 'batman\n   robin\n   joker';
  const less = ` /* ${text} */ `;
  const root = parse(less);
  const { first } = root;

  t.is(root.nodes.length, 1);
  t.is(first.text, text);
  t.deepEqual(first.raws, {
    before: ' ',
    left: ' ',
    right: ' '
  });
  t.falsy(first.inline);
  t.is(nodeToString(root), less);
});

test('ignores pseudo-comments constructions', (t) => {
  const less = 'a { cursor: url(http://site.com) }';
  const root = parse(less);
  const { first } = root;

  t.false(first instanceof Comment);
  t.is(nodeToString(root), less);
});

test('newlines are put on the next node', (t) => {
  const less = '// a comment\n.a {}';

  const root = parse(less);
  const { first, last } = root;

  t.is(first.raws.right, '');
  t.is(last.raws.before, '\n');
});
