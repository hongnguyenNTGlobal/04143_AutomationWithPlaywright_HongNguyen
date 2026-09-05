import { expect, Page } from '@playwright/test';
import { LoginPage } from './login.page';

export class BookStorePage {
    constructor(private readonly page: Page) { }

    private get loginLink() { return this.page.getByRole('link', { name: 'Login' }); }
    private get profileLink() { return this.page.getByRole('link', { name: 'Profile' }); }
    private get searchInput() { return this.page.getByPlaceholder('Type to search'); }
    private get bookRows() { return this.page.getByRole('row').filter({ has: this.page.getByRole('link') }); }
    private get bookTitles() { return this.bookRows.getByRole('link'); }

    /** Opens the book store page. */
    async open(): Promise<void> {
        await this.page.goto('/books');
    }

    /** Opens the authenticated user's profile. */
    async openProfile(): Promise<void> {
        await this.profileLink.click();
        await expect(this.page).toHaveURL(/\/profile$/);
    }

    /** Reloads the current page. */
    async reload(): Promise<void> {
        await this.page.reload();
    }

    /** Adds the user's token to subsequent browser requests. */
    async setAuthorizationToken(token: string): Promise<void> {
        await this.page.setExtraHTTPHeaders({ Authorization: `Bearer ${token}` });
    }

    /** Opens the login page and returns its page object. */
    async openLogin(): Promise<LoginPage> {
        await this.loginLink.click();
        await expect(this.page).toHaveURL(/\/login$/);
        return new LoginPage(this.page);
    }

    /** Filters the visible books by search term. */
    async search(term: string): Promise<void> {
        await this.searchInput.fill(term);
    }

    /** Verifies that multiple visible book titles match the search term. */
    async expectMultipleMatchingBooks(term: string): Promise<void> {
        await expect(this.bookTitles).not.toHaveCount(0);
        const titles = await this.bookTitles.allTextContents();
        for (const title of titles) {
            expect(title.toLocaleLowerCase()).toContain(term.toLocaleLowerCase());
        }
    }

    /** Verifies that a book is visible in the user's profile. */
    async expectBookInProfile(isbn: string): Promise<void> {
        await expect(this.page.locator(`a[href="/books?search=${isbn}"]`)).toBeVisible();
    }

    /** Verifies that a book is absent from the user's profile. */
    async expectBookNotInProfile(isbn: string): Promise<void> {
        await expect(this.page.locator(`a[href="/books?search=${isbn}"]`)).toHaveCount(0);
    }

}
