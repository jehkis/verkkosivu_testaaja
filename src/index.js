import { chromium } from 'playwright';

const DEFAULT_TIMEOUT_MS = 30000;

function toAbsoluteUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

async function checkLinks(page, baseUrl) {
  const hrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href'))
  );

  const base = new URL(baseUrl);
  const seen = new Set();
  const links = [];

  for (const href of hrefs) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }
    const absolute = toAbsoluteUrl(href, baseUrl);
    if (!absolute || seen.has(absolute)) continue;
    seen.add(absolute);
    links.push(absolute);
  }

  const broken = [];
  const request = page.context().request;

  await Promise.all(
    links.map(async (link) => {
      try {
        const response = await request.fetch(link, { method: 'GET', timeout: 10000 });
        const status = response.status();
        if (status >= 400) {
          broken.push({ url: link, status });
        }
      } catch (error) {
        broken.push({ url: link, status: null, error: error.message });
      }
    })
  );

  return { total: links.length, internal: links.filter((l) => new URL(l).host === base.host).length, broken };
}

async function checkImages(page) {
  const images = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.alt,
      broken: img.complete && img.naturalWidth === 0,
    }))
  );

  return {
    total: images.length,
    missingAlt: images.filter((img) => !img.alt).length,
    broken: images.filter((img) => img.broken).map((img) => img.src),
  };
}

async function checkForms(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('form')).map((form) => ({
      action: form.getAttribute('action') || '(ei asetettu)',
      method: (form.getAttribute('method') || 'get').toUpperCase(),
      inputs: form.querySelectorAll('input, textarea, select').length,
    }))
  );
}

export async function testWebsite(url, options = {}) {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
  const browser = await chromium.launch({
    headless: options.headless ?? true,
    executablePath: options.executablePath ?? process.env.PLAYWRIGHT_CHROMIUM_PATH,
  });

  const consoleErrors = [];
  const pageErrors = [];

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const start = Date.now();
    const response = await page.goto(url, { timeout, waitUntil: 'load' });
    const loadTimeMs = Date.now() - start;

    const status = response ? response.status() : null;
    const title = await page.title();

    const [links, images, forms] = await Promise.all([
      checkLinks(page, url),
      checkImages(page),
      checkForms(page),
    ]);

    return {
      url,
      status,
      ok: response ? response.ok() : false,
      title,
      loadTimeMs,
      consoleErrors,
      pageErrors,
      links,
      images,
      forms,
    };
  } finally {
    await browser.close();
  }
}
