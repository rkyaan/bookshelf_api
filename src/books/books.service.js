import { nanoid } from 'nanoid';
import Books from './books.data.js';
import Response from '../libs/response.js';

const BooksService = {
  getBooks(request, h) {
    const { name, reading, finished } = request.query;
    
    const filteredBooks = Books.filter((book) => (
      (!name || new RegExp(name, 'gi').test(book.name)) &&
      (reading === undefined || Number(book.reading) === Number(reading)) &&
      (finished === undefined || Number(book.finished) === Number(finished))
    ));

    return Response.dataOnly(h, 200, {
      books: filteredBooks.map(({ id, name, publisher }) => ({ id, name, publisher })),
    });
  },

  getBookById(request, h) {
    const book = Books.find((book) => book.id === request.params.bookId);
    return book 
      ? Response.dataOnly(h, 200, { book }) 
      : Response.message(h, 404, 'Buku tidak ditemukan');
  },

  postBook(request, h) {
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
    
    if (!name) 
      return Response.message(h, 400, 'Gagal menambahkan buku. Mohon isi nama buku');
    if (readPage > pageCount) 
      return Response.message(h, 400, 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount');
    
    const id = nanoid(16);
    const timestamp = new Date().toISOString();
    const newBook = { 
      id, name, year, author, summary, publisher, pageCount, 
      readPage, finished: pageCount === readPage, reading, 
      insertedAt: timestamp, updatedAt: timestamp 
    };

    Books.push(newBook);
    
    return Books.some((book) => book.id === id)
      ? Response.data(h, 201, 'Buku berhasil ditambahkan', { bookId: id })
      : Response.message(h, 500, 'Buku gagal ditambahkan');
  },

  putBook(request, h) {
    const { bookId } = request.params;
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
    
    if (!name) 
      return Response.message(h, 400, 'Gagal memperbarui buku. Mohon isi nama buku');
    if (readPage > pageCount) 
      return Response.message(h, 400, 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount');
    
    const index = Books.findIndex((book) => book.id === bookId);
    
    if (index === -1) 
      return Response.message(h, 404, 'Gagal memperbarui buku. Id tidak ditemukan');
    
    const updatedAt = new Date().toISOString();
    Books[index] = { 
      ...Books[index], name, year, author, summary, 
      publisher, pageCount, readPage, reading, 
      finished: pageCount === readPage, updatedAt 
    };
    
    return Response.message(h, 200, 'Buku berhasil diperbarui');
  },

  deleteBook(request, h) {
    const index = Books.findIndex((book) => book.id === request.params.bookId);
    
    if (index === -1) 
      return Response.message(h, 404, 'Buku gagal dihapus. Id tidak ditemukan');
    
    Books.splice(index, 1);
    return Response.message(h, 200, 'Buku berhasil dihapus');
  },
};


export default BooksService;
