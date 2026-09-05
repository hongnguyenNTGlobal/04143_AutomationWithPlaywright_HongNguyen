import { bookSearchData } from '../src/test-data/book-search.data';
import { expect, test } from '../src/fixtures/test-fixtures';

test.describe('Book Store search', () => {
    test.describe.configure({ mode: 'default' });

    test.beforeEach(async ({ bookStorePage }) => {
        await bookStorePage.open();
    });

    /** Verifies that the shared authenticated user can search for matching books. */
    test('searches books with matching results', async ({ bookStorePage, userSession }) => {
        console.log(`Created user: username=${userSession.username}, password=${userSession.password}, UUID=${userSession.uuid}`);

        await bookStorePage.open();
        await bookStorePage.search(bookSearchData.multipleMatchTerm);
        await bookStorePage.expectMultipleMatchingBooks(bookSearchData.multipleMatchTerm);

    });

    /** Verifies that an authenticated user can delete a book through the API. */
    test('deletes a book through the API', async ({ bookStoreApi, bookStorePage, userSession }) => {
        test.setTimeout(120000);

        const books = await bookStoreApi.getBooks();
        const bookToDelete = books[0];
        if (!bookToDelete) {
            throw new Error('Book Store API returned no books to delete.');
        }

        await bookStoreApi.addBook(userSession.token, userSession.uuid, bookToDelete.isbn);
        await expect.poll(async () => {
            const userBooks = await bookStoreApi.getUserBooks(userSession.token, userSession.uuid);
            return userBooks.some(({ isbn }) => isbn === bookToDelete.isbn);
        }).toBeTruthy();

        await bookStorePage.openProfile();
        await bookStorePage.expectBookInProfile(bookToDelete.isbn);

        await bookStoreApi.deleteBook(userSession.token, userSession.uuid, bookToDelete.isbn);
        await bookStorePage.reload();
        await bookStorePage.expectBookNotInProfile(bookToDelete.isbn);
    });
});
