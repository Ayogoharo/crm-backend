import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import {
  mockPayment,
  mockCreatePaymentDto,
  mockUpdatePaymentDto,
  mockRecordedByUser,
} from './__mocks__/payment-test-data';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let repository: jest.Mocked<Repository<Payment>>;
  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    repository = module.get(getRepositoryToken(Payment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a payment', async () => {
      const createdPayment = { ...mockPayment };
      repository.create.mockReturnValue(createdPayment);
      repository.save.mockResolvedValue(createdPayment);

      const result = await service.create(mockCreatePaymentDto);

      expect(repository.create).toHaveBeenCalledWith(mockCreatePaymentDto);
      expect(repository.save).toHaveBeenCalledWith(createdPayment);
      expect(result).toEqual({ id: mockPayment.id });
    });

    it('should throw InternalServerErrorException when repository throws error', async () => {
      const error = new Error('Database error');
      repository.create.mockReturnValue(mockPayment);
      repository.save.mockRejectedValue(error);

      await expect(service.create(mockCreatePaymentDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.create(mockCreatePaymentDto)).rejects.toThrow(
        'Error creating payment: Database error',
      );
    });

    it('should handle unknown errors', async () => {
      repository.create.mockReturnValue(mockPayment);
      repository.save.mockRejectedValue('Unknown error');

      await expect(service.create(mockCreatePaymentDto)).rejects.toThrow(
        'Error creating payment: Unknown error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all payments with relations', async () => {
      const payments = [mockPayment, { ...mockPayment, id: 2 }];
      repository.find.mockResolvedValue(payments);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['invoice', 'recordedByUser'],
      });
      expect(result).toEqual({ payments });
    });

    it('should return empty array when no payments exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual({ payments: [] });
    });

    it('should throw InternalServerErrorException when repository throws error', async () => {
      const error = new Error('Database connection failed');
      repository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.findAll()).rejects.toThrow(
        'Error finding payments: Database connection failed',
      );
    });
  });

  describe('findById', () => {
    it('should return payment when found', async () => {
      repository.findOne.mockResolvedValue(mockPayment);

      const result = await service.findById(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['invoice', 'recordedByUser'],
      });
      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException when payment not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      await expect(service.findById(999)).rejects.toThrow(
        'Payment with ID 999 not found',
      );
    });

    it('should throw InternalServerErrorException when repository throws error', async () => {
      const error = new Error('Database error');
      repository.findOne.mockRejectedValue(error);

      await expect(service.findById(1)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.findById(1)).rejects.toThrow(
        'Error finding payment: Database error',
      );
    });
  });

  describe('update', () => {
    it('should successfully update a payment', async () => {
      const updatedPayment = { ...mockPayment, ...mockUpdatePaymentDto };
      repository.findOneBy.mockResolvedValue(mockPayment);
      repository.update.mockResolvedValue({
        affected: 1,
        generatedMaps: [],
        raw: [],
      });

      // Mock the findById method call within update
      jest.spyOn(service, 'findById').mockResolvedValue(updatedPayment);

      const result = await service.update(1, mockUpdatePaymentDto);

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: mockUpdatePaymentDto.id,
      });
      expect(repository.update).toHaveBeenCalledWith(
        mockUpdatePaymentDto.id,
        mockUpdatePaymentDto,
      );
      expect(service.findById).toHaveBeenCalledWith(mockUpdatePaymentDto.id);
      expect(result).toEqual(updatedPayment);
    });

    it('should throw NotFoundException when payment to update not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.update(999, mockUpdatePaymentDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(999, mockUpdatePaymentDto)).rejects.toThrow(
        'Payment with ID 1 not found',
      );
    });

    it('should throw InternalServerErrorException when repository throws error', async () => {
      const error = new Error('Update failed');
      repository.findOneBy.mockRejectedValue(error);

      await expect(service.update(1, mockUpdatePaymentDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.update(1, mockUpdatePaymentDto)).rejects.toThrow(
        'Error updating payment: Update failed',
      );
    });
  });

  describe('delete', () => {
    it('should successfully delete a payment', async () => {
      repository.findOneBy.mockResolvedValue(mockPayment);
      repository.remove.mockResolvedValue(mockPayment);

      await service.delete(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.remove).toHaveBeenCalledWith(mockPayment);
    });

    it('should throw NotFoundException when payment to delete not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      await expect(service.delete(999)).rejects.toThrow(
        'Payment with ID 999 not found',
      );
    });

    it('should throw InternalServerErrorException when repository throws error', async () => {
      const error = new Error('Delete failed');
      repository.findOneBy.mockResolvedValue(mockPayment);
      repository.remove.mockRejectedValue(error);

      await expect(service.delete(1)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.delete(1)).rejects.toThrow(
        'Error deleting payment: Delete failed',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle payment with minimal data', async () => {
      const minimalPayment: Payment = {
        ...mockPayment,
        id: 1,
        amount: 100,
        method: 'cash',
        recordedBy: mockRecordedByUser.id,
        paymentDate: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15T10:00:00Z'),
      };
      const minimalDto = {
        ...mockCreatePaymentDto,
        amount: 100,
        method: 'cash' as const,
        recordedBy: undefined,
        reference: undefined,
      };

      repository.create.mockReturnValue(minimalPayment);
      repository.save.mockResolvedValue(minimalPayment);

      const result = await service.create(minimalDto);

      expect(result).toEqual({ id: minimalPayment.id });
    });

    it('should handle different payment methods', async () => {
      const methods: Array<
        'cash' | 'bank_transfer' | 'credit_card' | 'paypal'
      > = ['cash', 'bank_transfer', 'credit_card', 'paypal'];

      for (const method of methods) {
        const paymentWithMethod = { ...mockPayment, method };
        const dtoWithMethod = { ...mockCreatePaymentDto, method };

        repository.create.mockReturnValue(paymentWithMethod);
        repository.save.mockResolvedValue(paymentWithMethod);

        const result = await service.create(dtoWithMethod);
        expect(result).toEqual({ id: paymentWithMethod.id });
      }
    });

    it('should handle large payment amounts', async () => {
      const largeAmountPayment = { ...mockPayment, amount: 999999.99 };
      const largeAmountDto = { ...mockCreatePaymentDto, amount: 999999.99 };

      repository.create.mockReturnValue(largeAmountPayment);
      repository.save.mockResolvedValue(largeAmountPayment);

      const result = await service.create(largeAmountDto);

      expect(result).toEqual({ id: largeAmountPayment.id });
    });
  });
});
