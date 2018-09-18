const test = require('ava');

const { parse, nodeToString } = require('../../lib');

test('should allow case-insensitive !important (#89)', (t) => {
  const less = 'a{k: v !IMPORTANT;}';
  const root = parse(less);
  const node = root.first.first;

  t.is(node.value, 'v');
  t.true(node.important);
  t.is(nodeToString(root), less);
});
