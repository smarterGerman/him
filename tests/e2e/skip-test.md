# E2E Test Instructions

This folder contains a small Puppeteer test to simulate a user pressing the skip button through the main flow.

To run:

1. Install dependencies:
   npm init -y
   npm i puppeteer
2. Run the test:
   node tests/e2e/skip-test.js

The test will open the local HTTP server at http://localhost:8000 and press the Skip button at a few steps.

If you prefer Playwright, replace puppeteer usage with Playwright commands.
