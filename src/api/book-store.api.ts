import { APIRequestContext, expect } from '@playwright/test';

const bookStoreApiUrl = 'https://bookstore.toolsqa.com';

export type UserCredentials = {
    username: string;
    password: string;
    uuid: string;
};

export type Book = {
    isbn: string;
    title: string;
};

export class BookStoreApi {
    constructor(private readonly request: APIRequestContext) { }

    /** Creates a new book store user. */
    async createUser(username: string, password: string): Promise<UserCredentials> {
        const response = await this.request.post(`${bookStoreApiUrl}/Account/v1/User`, {
            data: { userName: username, password },
        });
        expect(response.ok()).toBeTruthy();
        const body = await response.json() as { userID?: string; username?: string };

        if (!body.userID) {
            throw new Error('User creation response did not include a userID.');
        }

        return {
            username: body.username ?? username,
            password,
            uuid: body.userID,
        };
    }

    /** Generates an authentication token for a user. */
    async generateToken({ username, password }: UserCredentials): Promise<string> {
        const response = await this.request.post(`${bookStoreApiUrl}/Account/v1/GenerateToken`, {
            data: { userName: username, password },
        });
        expect(response.ok()).toBeTruthy();
        const body = await response.json() as { token?: string };

        if (!body.token) {
            throw new Error('GenerateToken response did not include a token.');
        }

        return body.token;
    }

    /** Returns all books available in the store. */
    async getBooks(): Promise<Book[]> {
        const response = await this.request.get(`${bookStoreApiUrl}/BookStore/v1/Books`);
        expect(response.ok()).toBeTruthy();
        const body = await response.json() as { books?: Book[] };
        return body.books ?? [];
    }

    /** Adds a book to a user's collection. */
    async addBook(token: string, userId: string, isbn: string): Promise<void> {
        const response = await this.request.post(`${bookStoreApiUrl}/BookStore/v1/Books`, {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                userId,
                collectionOfIsbns: [{ isbn }],
            },
        });
        expect(response.ok()).toBeTruthy();
    }

    /** Returns the books in a user's collection. */
    async getUserBooks(token: string, userId: string): Promise<Book[]> {
        const response = await this.request.get(`${bookStoreApiUrl}/BookStore/v1/Books?UserId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(response.ok()).toBeTruthy();
        const body = await response.json() as { books?: Book[] };
        return body.books ?? [];
    }

    /** Removes a book from a user's collection. */
    async deleteBook(token: string, userId: string, isbn: string): Promise<void> {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const response = await this.request.delete(`${bookStoreApiUrl}/BookStore/v1/Book`, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { isbn, userId },
                    timeout: 10000,
                });
                expect(response.ok()).toBeTruthy();
                return;
            } catch (error) {
                if (attempt === 3) {
                    throw error;
                }
            }
        }
    }
}
