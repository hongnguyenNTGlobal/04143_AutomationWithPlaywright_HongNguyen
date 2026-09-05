import { test as base } from '@playwright/test';
import { BookStoreApi, UserCredentials } from '../api/book-store.api';
import { BookStorePage } from '../pages/book-store.page';
import { LoginPage } from '../pages/login.page';

export type UserSession = UserCredentials & {
    token: string;
};

export type AppFixtures = {
};

type WorkerFixtures = {
    bookStoreApi: BookStoreApi;
    userSession: UserSession;
    bookStorePage: BookStorePage;
};

export const test = base.extend<AppFixtures, WorkerFixtures>({
    bookStoreApi: [async ({ playwright }, use) => {
        const request = await playwright.request.newContext();
        await use(new BookStoreApi(request));
        await request.dispose();
    }, { scope: 'worker' }],
    userSession: [async ({ bookStoreApi }, use) => {
        const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const credentials = await bookStoreApi.createUser(`User-${suffix}`, `Test@${suffix}a1`);
        await use({ ...credentials, token: '' });
    }, { scope: 'worker' }],
    bookStorePage: [async ({ browser, bookStoreApi, userSession }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const bookStorePage = new BookStorePage(page);
        await page.goto('https://demoqa.com/login');
        const loginPage = new LoginPage(page);
        await loginPage.login(userSession.username, userSession.password);
        await loginPage.expectLoggedIn();
        userSession.token = await bookStoreApi.generateToken(userSession);
        await bookStorePage.setAuthorizationToken(userSession.token);
        await use(bookStorePage);
        await context.close();
    }, { scope: 'worker' }],
});

export { expect } from '@playwright/test';
