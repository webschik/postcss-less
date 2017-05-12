import Stringifier from 'postcss/lib/stringifier';

export default class LessStringifier extends Stringifier {
  comment (node) {
    this.builder(node.raws.content, node);
  }

  import (node) {
    this.builder(`@${ node.name }`);
    this.builder((node.raws.afterName || '') +
                     (node.directives || '') +
                     (node.raws.between || '') +
                     (node.importPath || '') +
                     (node.raws.after || ''));

    if (node.raws.semicolon) {
      this.builder(';');
    }
  }

  rule (node) {
    super.rule(node);

    if (node.empty && node.raws.semicolon) {
      if (node.important) {
        this.builder(' !important');
      }

      if (node.raws.semicolon) {
        this.builder(';');
      }
    }
  }

  block (node, start) {
    const { empty } = node;
    const between = this.raw(node, 'between', 'beforeOpen');
    let after = '';

    if (empty) {
      this.builder(start + between, node, 'start');
    }
    else {
      this.builder(`${ start + between }{`, node, 'start');
    }

    if (node.nodes && node.nodes.length) {
      this.body(node);
      after = this.raw(node, 'after');
    }
    else {
      after = this.raw(node, 'after', 'emptyBody');
    }

    if (after) {
      this.builder(after);
    }

    if (!empty) {
      this.builder('}', node, 'end');
    }
  }
}
