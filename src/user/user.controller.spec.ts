import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserEntity } from './user.model';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  // Mock UserService
  const mockUserService = {
    createUser: jest.fn(),
    getUserStatus: jest.fn(),
    useActionPoints: jest.fn(),
    makeDraft: jest.fn(),
    findByEmail: jest.fn(),
  };

  // Mock Mongoose Model
  const mockUserModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: getModelToken(UserEntity.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have userService injected', () => {
    expect(userService).toBeDefined();
  });
});
