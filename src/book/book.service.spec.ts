import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { Book, Category } from './entities/book.entity';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('BookService', () => {
  let service: BookService;
  let mockDb: Model<Book>;

  const mockBook = {
    _id: '60d6c7e9207bd130b8f8c3a6',
    title: 'Mock Book Title',
    description: 'This is a mock book for testing purposes.',
    author: 'Mock Author',
    price: 19.99,
    category: Category.FANTASY,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getModelToken(Book.name),
          useValue: {
            find: jest.fn().mockResolvedValue([mockBook]),
            create: jest.fn().mockResolvedValue(mockBook),
            findById: jest.fn().mockResolvedValue(mockBook),
            findByIdAndUpdate: jest
              .fn()
              .mockResolvedValue({ ...mockBook, title: 'Updated Title' }),
            findByIdAndDelete: jest.fn().mockResolvedValue(mockBook),
            delete: jest.fn().mockResolvedValue(mockBook),
          },
        },
      ],
    }).compile();
    service = module.get<BookService>(BookService);
    mockDb = module.get<Model<Book>>(getModelToken(Book.name));
  });

  it('Create new book', async () => {
    const bookResult = await service.create(mockBook);
    expect(mockDb.create).toHaveBeenCalled();
    expect(bookResult).toBeDefined();
    expect(bookResult).toEqual(mockBook);
  });

  it('Undefined when create book with no title ', async () => {
    const bookResult = await service.create({
      title: undefined,
      description: 'bonjour.',
      author: 'Mock Author',
      category: Category.FANTASY,
      price: 21.0,
    });
    expect(mockDb.create).toHaveBeenCalledTimes(0); // should not be called because of invalid book's title
    expect(bookResult).toBeUndefined();
  });

  it('should find all books', async () => {
    const books = await service.findAll();
    expect(books).toBeDefined();
    expect(books).toEqual([mockBook]);
  });

  it('should find a book by ID', async () => {
    const book = await service.findById(mockBook._id);
    expect(book).toBeDefined();
    expect(book).toEqual(mockBook);
  });

  it('should update a book', async () => {
    const result = await service.updateById(mockBook._id, {
      ...mockBook,
      title: 'Updated Title',
    });
    expect(result).toBeDefined();
    expect(result).toEqual(result);
  });

  it('should remove a book', async () => {
    const deletedBook = await service.deleteById(mockBook._id);
    expect(deletedBook).toBeDefined();
    expect(deletedBook).toEqual(mockBook);
  });
});
