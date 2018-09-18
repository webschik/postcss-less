/* eslint no-await-in-loop: off */

// TODO: enable when interpolation has been fixed
// const { readFileSync } = require('fs');
// const { join } = require('path');

const test = require('ava');
const cheerio = require('cheerio');
const isAbsoluteUrl = require('is-absolute-url');
const fetch = require('node-fetch');
const postcss = require('postcss');
const urljoin = require('url-join');

const syntax = require('../lib');

const sites = ['https://github.com', 'https://news.ycombinator.com'];

for (const site of sites) {
  test(`integration: ${site}`, async (t) => {
    const res = await fetch(site);
    const html = await res.text();
    const $ = cheerio.load(html);

    const hrefs = $('head link[rel=stylesheet]')
      .map((index, sheet) => {
        let { href } = sheet.attribs;

        if (!isAbsoluteUrl(href)) {
          href = urljoin(site, href);
        }

        return href;
      })
      .get();

    for (const href of hrefs) {
      const req = await fetch(href);
      const css = await req.text();

      await postcss().process(css, {
        parser: syntax.parse,
        map: { annotation: false },
        from: null
      });
    }

    t.pass();
  });
}

// sanity check - issue #99
// TODO: enable when interpolation has been fixed
// test('should not fail wikimedia sanity check', (t) => {
//   const less = readFileSync(join(__dirname, './integration/ext.cx.dashboard.less'), 'utf-8');
//   const root = syntax.parse(less);
//
//   t.is(root.first.type, 'import');
// });
