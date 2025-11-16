const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:8000');

  // Wait for page and skip button
  await page.waitForSelector('#skipButton');

  // Press skip once
  await page.click('#skipButton');
  console.log('Clicked SKIP once');

  // Wait a bit and press skip again
  await page.waitForTimeout(500); // shim for older puppeteer versions
  // fallback to setTimeout if not available
  if (typeof page.waitForTimeout !== 'function') await new Promise(r => setTimeout(r, 500));
  await page.click('#skipButton');
  console.log('Clicked SKIP twice quickly');

  // Check that DNA visualizer is visible and background music still playing
  const visualizerVisible = await page.$eval('#visualizer', el => window.getComputedStyle(el).opacity === '1');
  console.log('Visualizer visible:', visualizerVisible);

  // Check if background music still playing
  const bgPlaying = await page.$eval('#backgroundMusic', audio => !audio.paused && audio.currentTime >= 0);
  console.log('Background music playing:', bgPlaying);

  await browser.close();
})();