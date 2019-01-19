const puppeteer = require('puppeteer')

let browser, page
beforeEach(async() => {
   browser = await puppeteer.launch({
    headless: false
  })

  page = await browser.newPage()
  await page.goto('http://127.0.0.1:3000')

})

afterEach(async () => {
  await browser.close()
})

test('launch browser', async () => {

  const text = await page.$eval('a.someclass', el => el.innerHTML)
  expect(text).toEqual("some text")
})

test('clicking on smth', async () => {
  await page.click('.right a')
  const url = await page.url()
  expect(url).toMatch(/someurl/)
})
