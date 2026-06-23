import { expect, test } from '@playwright/test'

function uniqueSerial(prefix = 'SER') {
  return `${prefix}-${Date.now()}`
}

test.describe('Anagrafica Radiologica - full-stack integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({
      Authorization: `Basic ${Buffer.from('admin:admin').toString('base64')}`,
      'X-User-Role': 'ADMIN',
    })
  })
  test('caricamento app', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Anagrafica Radiologica', { exact: true })).toBeVisible()
    await expect(page.getByText('Controlli', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /Carica/i })).toBeVisible()
    await expect(page.getByText('Crea apparecchiatura', { exact: true })).toBeVisible()
  })

  test('caricamento albero organizzazione', async ({ page }) => {
    await page.goto('/')

    const loadButton = page.getByRole('button', { name: /Carica/i })

    await expect(loadButton).toBeVisible()
    await expect(page.locator('#orgId')).toBeVisible()

    await loadButton.click()

    await page
        .getByText(/Caricamento albero/i)
        .waitFor({ state: 'detached', timeout: 15_000 })
        .catch(() => {
          // Il loading può non comparire o sparire rapidamente.
        })

    await expect(page.getByText('ID Organizzazione', { exact: true })).toBeVisible()
    await expect(page.getByText('Crea apparecchiatura', { exact: true })).toBeVisible()
  })

  test('creazione apparecchiatura con seriale univoco', async ({ page }) => {
    const seriale = uniqueSerial('IT')

    await page.goto('/')

    const createForm = page.locator('form.create_form')
    await expect(createForm).toBeVisible()

    await createForm.getByLabel('Nome', { exact: true }).fill('TAC Integration Test')

    const tipologiaSelect = createForm.locator('select').first()
    await expect(tipologiaSelect).toBeVisible()
    await tipologiaSelect.selectOption('TAC')

    await createForm.getByLabel('Numero di serie', { exact: true }).fill(seriale)
    await createForm.getByLabel('Data installazione', { exact: true }).fill('2024-03-15')

    // Usa ID numerico perché il backend espone l'albero come /organizzazioni/1/tree.
    const orgInput = createForm.getByLabel('ID organizzazione', { exact: true })
    await orgInput.click()
    await orgInput.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A')
    await orgInput.fill('1')

    const createButton = createForm.getByRole('button', { name: /^Crea$/ })

    await expect(createButton).toBeEnabled({ timeout: 10_000 })

    const requestPromise = page.waitForRequest((request) => {
      return (
          request.url().includes('/api/apparecchiature') &&
          request.method() === 'POST'
      )
    })

    const responsePromise = page.waitForResponse((response) => {
      return (
          response.url().includes('/api/apparecchiature') &&
          response.request().method() === 'POST'
      )
    })

    await createButton.click()

    const request = await requestPromise
    const response = await responsePromise

    const requestBody = request.postData() ?? ''
    const responseBody = await response.text().catch(() => '')

    expect(
        response.ok(),
        `POST /api/apparecchiature fallita.
Status: ${response.status()}
Request URL: ${request.url()}
Request body: ${requestBody}
Response body: ${responseBody}`,
    ).toBeTruthy()

    await expect(
        page.getByRole('status').filter({
          hasText: /Apparecchiatura creata con successo/i,
        }),
    ).toBeVisible({
      timeout: 15_000,
    })
  })
})