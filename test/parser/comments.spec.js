// chai uses expressions for validation
/* eslint no-unused-expressions: 0 */

import {expect} from 'chai';
import parse from '../../lib/less-parse';

describe('Parser', () => {
    describe('Comments', () => {
        it('parses inline comments', () => {
            const root = parse('\n// here is the first comment \n/* here is the second comment */');

            expect(root.nodes.length).to.eql(2);
            expect(root.first.text).to.equal('here is the first comment');
            expect(root.first.raws).to.eql({
                before: '\n',
                content: '// here is the first comment ',
                begin: '//',
                inline: true,
                left: ' ',
                right: ' '
            });
            expect(root.first.inline).to.equal(true);
            expect(root.first.block).to.equal(false);
            expect(root.first.toString()).to.equal('/* here is the first comment */');
            
            expect(root.last.text).to.eql('here is the second comment');
            expect(root.last.raws).to.eql({
                before: '\n',
                content: '/* here is the second comment */',
                begin: '/*',
                inline: false,
                left: ' ',
                right: ' '
            });
            expect(root.last.inline).to.equal(false);
            expect(root.last.block).to.equal(true);
            expect(root.last.toString()).to.equal('/* here is the second comment */');
        });

        it('parses empty inline comments', () => {
            const root = parse(' //\n// ');

            expect(root.first.text).to.eql('');
            expect(root.first.raws).to.eql({
                before: ' ',
                begin: '//',
                content: '//',
                inline: true,
                left: '',
                right: ''
            });
            expect(root.last.inline).to.equal(true);
            expect(root.last.block).to.equal(false);
            
            expect(root.last.text).to.eql('');
            expect(root.last.raws).to.eql({
                before: '\n',
                begin: '//',
                content: '// ',
                inline: true,
                left: ' ',
                right: ''
            });
            expect(root.last.inline).to.equal(true);
            expect(root.last.block).to.equal(false);
        });
        
        it('parses multiline comments', () => {
            const text = 'Hello!\n I\'m a multiline \n comment!';
            const comment = ` /*   ${ text }*/ `;
            const root = parse(comment);
            
            expect(root.nodes.length).to.eql(1);
            expect(root.first.text).to.eql(text);
            expect(root.first.raws).to.eql({
                before: ' ',
                begin: '/*',
                content: comment.trim(),
                inline: false,
                left: '   ',
                right: ' '
            });
            expect(root.first.inline).to.equal(false);
            expect(root.first.block).to.equal(true);
            expect(root.first.toString()).to.equal(`/*   ${ text } */`);
        });

        it('does not parse pseudo-comments constructions inside parentheses', () => {
            const root = parse('a { cursor: url(http://site.com) }');

            expect(root.first.first.value).to.eql('url(http://site.com)');
        });
    });
});