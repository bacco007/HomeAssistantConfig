export default async ({ page }) => {
  await page.goto("https://planefinder.net/coverage/receiver/226414");

  const html = await page.content();

  return html;
};
