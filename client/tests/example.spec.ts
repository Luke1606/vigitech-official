import { test, expect } from '@playwright/test';

test('título de la página', async ({ page }) => {
  // Navegar a la página principal
  await page.goto('http://localhost:5173/vigitech/portal');

  // Verificar que el título de la página es correcto
  // Cambia 'Mi App React' por el título real de tu aplicación
  await expect(page).toHaveTitle('Vigitech');
});

///////////////////////////
// Pruebas de navegación //
///////////////////////////

test('ir a faq', async ({ page }) => {
  await page.goto('http://localhost:5173/vigitech/portal');

  // Buscar un elemento por texto y hacer clic
  await page.click('text=FAQ');

  // Verificar que la navegación fue exitosa
  await expect(page).toHaveURL(/.*faq/);
  // O verificar que aparece algún texto específico de la página
  await expect(page.getByText('Need Help?')).toBeVisible();
});

test('ir a acerca de', async ({ page }) => {
  await page.goto('http://localhost:5173/vigitech/portal');

  // Buscar un elemento por texto y hacer clic
  await page.click('text=ABOUT');

  // Verificar que la navegación fue exitosa
  await expect(page).toHaveURL(/.*about/);
  // O verificar que aparece algún texto específico de la página
  await expect(page.getByText('About Vigitech')).toBeVisible();
});

test('ir a homepage del radar', async ({ page }) => {
  await page.goto('http://localhost:5173/vigitech/portal');

  // Buscar un elemento por texto y hacer clic
  await page.click('text=SERVICES');
  await page.click('text=Technology Radar');
  // Verificar que la navegación fue exitosa
  await expect(page).toHaveURL('http://localhost:5173/vigitech/technology-radar');
  // O verificar que aparece algún texto específico de la página
  await expect(page.getByText('Technology Radar')).toBeVisible();
});

test('ir a servicio del radar', async ({ page }) => {
  await page.goto('http://localhost:5173/vigitech/technology-radar');

  // Buscar un elemento por texto y hacer clic
  await page.click('text=Radar');
  // Verificar que la navegación fue exitosa
  await expect(page).toHaveURL(/.*radar/);
  // O verificar que aparece algún texto específico de la página
  await expect(page.getByText('Hold')).toBeVisible();
});

////////////////////////////
// Pruebas de formularios //
////////////////////////////

test('register exitoso', async ({ page }) => {

  await page.goto('https://casual-salmon-59.accounts.dev/sign-up');

  // Llenar el formulario
  await page.getByPlaceholder('First name').fill('Mi nombre');
  await page.getByPlaceholder('Last name').fill('Mi apellido');
  await page.fill('input[name=username]', 'Mi username');
  await page.getByPlaceholder('Enter your email address').fill('miemail@gmail.com');
  await page.getByPlaceholder('Enter your password').fill('micontrasena123');
  await page.click('text=Continue');

  // Redirección

  await expect(page).toHaveURL('https://casual-salmon-59.accounts.dev/sign-up');
});

/*test('register fallido', async ({ page }) => {
  await page.goto('https://casual-salmon-59.accounts.dev/sign-up');

  // Llenar el formulario
  await page.getByPlaceholder('First name').fill('Mi nombre');
  await page.getByPlaceholder('Last name').fill('Mi apellido');
  await page.fill('input[name=username]', 'mi username');
  await page.getByPlaceholder('Enter your email address').fill('abel04.mata@gmail.com');
  await page.getByPlaceholder('Enter your password').fill('micontrasena123');
  await page.click('text=Continue');

  // Redirección

  await expect(page.getByText("That email address is taken.Please try another.")).toBeVisible();
  await expect(page).toHaveURL('https://casual-salmon-59.accounts.dev/sign-up');
});*/

test('login exitoso', async ({ page }) => {
  await page.goto('https://casual-salmon-59.accounts.dev/sign-in');

  // Llenar el formulario
  await page.fill('input[type="text"]', 'abel04.mata@gmail.com');
  await page.fill('input[type="password"]', 'Blockstory0075*');

  // Hacer clic en el botón de login
  await page.click('text=Continue');

  // Verificar redirección después del login
  await expect(page).toHaveURL(/(\/|\/vigitech\/technology-radar)/);
});

test('login fallido', async ({ page }) => {
  await page.goto('https://casual-salmon-59.accounts.dev/sign-in');

  // Esperar a que la página cargue completamente
  await page.waitForLoadState('networkidle');

  // Llenar con credenciales incorrectas
  await page.fill('input[type="text"]', 'wrong@example.com');
  await page.fill('input[type="password"]', 'wrongpassword');

  // Hacer clic en boton con texto Continue
  await page.click('button:has-text("Continue")');

  // Verificar que muestra mensaje de error
  await expect(page.getByText("Couldn't find your account.")).toBeVisible();
  // Verificar que NO redirige
  await expect(page).toHaveURL('https://casual-salmon-59.accounts.dev/sign-in');
});

test('crear lista', async ({ page }) => {
  await page.goto('http://localhost:5173/vigitech/technology-radar/');
  await page.click('text=Radar');
  await expect(page).toHaveURL(/.*radar/);
  await page.click('text=Create');

  await page.getByPlaceholder('Name of the list').fill('mi lista');

  await page.click('button[name=crearLista]');
  await expect(page.getByText('mi lista')).toBeVisible();
});

test('renombrar lista', async ({ page }) => {
  await page.goto('http://localhost:5173/vigitech/technology-radar/');
  await page.click('text=Radar');
  await expect(page).toHaveURL(/.*radar/);
  await page.click('text=Create');

  await page.getByPlaceholder('Name of the list').fill('mi lista');

  await page.click('button[name=crearLista]');
  await expect(page.getByText('mi lista')).toBeVisible();
  await page.click('text=mi lista');
  await page.click('text=Cambiar nombre');
  await page.fill('input', 'mi lista renombrada');
  await page.click('button[name=renombrarLista]');

  await expect(page.getByText('mi lista renombrada')).toBeVisible();

});

test('eliminar lista', async ({ page }) => {
  await page.goto('http://localhost:5173/vigitech/technology-radar/');
  await page.click('text=Radar');
  await expect(page).toHaveURL(/.*radar/);

  await page.click('text=Create');
  await page.getByPlaceholder('Name of the list').fill('mi lista');
  await page.click('button[name=crearLista]');

  await expect(page.getByText('mi lista')).toBeVisible();
  await page.click('text=mi lista');
  await page.click('text=Eliminar lista');
  await page.click('button[name=eliminarLista]');

  await expect(page.getByText('No lists here')).toBeVisible();

});

test('agregar elementos a la lista', async ({ page }) => {
  await page.goto('http://localhost:5173/vigitech/technology-radar/');
  await page.click('text=Radar');
  await expect(page).toHaveURL(/.*radar/);

  await page.click('text=Create');
  await page.getByPlaceholder('Name of the list').fill('mi lista');
  await page.click('button[name=crearLista]');

  await expect(page.getByText('mi lista')).toBeVisible();
  await page.click('text=mi lista');
  await page.click('text=Agregar elemento');
  await page.click('input[type=checkbox]');

  await page.click('button[name=agregarElementos]');
  await page.click('text=mi lista');

  await expect(page.locator('div:has-text("TypeScript")').first()).toBeVisible();

});

test('desagregar elementos de la lista', async ({ page }) => {
  await page.goto('http://localhost:5173/vigitech/technology-radar/');
  await page.click('text=Radar');
  await expect(page).toHaveURL(/.*radar/);

  await page.click('text=Create');
  await page.getByPlaceholder('Name of the list').fill('mi lista');
  await page.click('button[name=crearLista]');

  await expect(page.getByText('mi lista')).toBeVisible();
  await page.click('text=mi lista');
  await page.click('text=Agregar elemento');
  await page.click('input[type=checkbox]');
  await page.click('button[name=agregarElementos]');

  await page.click('text=mi lista');
  await page.click('button[name=cesto]');
  await page.click('button[name=eliminarElemento]');

  await expect(page.getByText('Sin elementos')).toBeVisible();

});