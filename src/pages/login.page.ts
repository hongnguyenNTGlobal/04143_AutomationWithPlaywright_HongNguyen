import { expect, Page } from '@playwright/test';

export class LoginPage {
    constructor(private readonly page: Page) { }

    private get usernameInput() { return this.page.getByPlaceholder('UserName'); }
    private get passwordInput() { return this.page.getByPlaceholder('Password'); }
    private get loginButton() { return this.page.getByRole('button', { name: 'Login' }); }

    /** Submits the supplied credentials. */
    async login(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    /** Verifies that the authenticated user indicator is visible. */
    async expectLoggedIn(): Promise<void> {
        await expect(this.page.locator('#userName-value')).toBeVisible({ timeout: 15000 });
    }
}
