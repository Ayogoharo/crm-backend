import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from '../../../src/payments/payments.controller';
import { PaymentsService } from '../../../src/payments/payments.service';
import { CreatePaymentBodyDto } from '../../../src/payments/dto/create-payment-body.dto';
import { UpdatePaymentBodyDto } from '../../../src/payments/dto/update-payment-body.dto';
import { PatchPaymentBodyDto } from '../../../src/payments/dto/patch-payment-body.dto';
import {
  mockCreatePaymentDto,
  mockPayment,
  mockUpdatePaymentDto,
} from '../../mocks/payment-test-data';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: jest.Mocked<PaymentsService>;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a payment and return the response', async () => {
      const expectedResponse = { id: 1 };
      service.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(mockCreatePaymentDto);

      expect(service.create).toHaveBeenCalledWith(mockCreatePaymentDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle service errors during creation', async () => {
      const error = new Error('Service error');
      service.create.mockRejectedValue(error);

      await expect(controller.create(mockCreatePaymentDto)).rejects.toThrow(
        error,
      );
      expect(service.create).toHaveBeenCalledWith(mockCreatePaymentDto);
    });

    it('should create payment with minimal required fields', async () => {
      const minimalDto: CreatePaymentBodyDto = {
        invoiceId: 1,
        paymentDate: '2024-01-15',
        amount: 100,
        method: 'cash',
      };
      const expectedResponse = { id: 2 };
      service.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(minimalDto);

      expect(service.create).toHaveBeenCalledWith(minimalDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle different payment methods', async () => {
      const methods: Array<
        'cash' | 'bank_transfer' | 'credit_card' | 'paypal'
      > = ['cash', 'bank_transfer', 'credit_card', 'paypal'];

      for (const method of methods) {
        const dtoWithMethod = { ...mockCreatePaymentDto, method };
        const expectedResponse = { id: 1 };
        service.create.mockResolvedValue(expectedResponse);

        const result = await controller.create(dtoWithMethod);

        expect(service.create).toHaveBeenCalledWith(dtoWithMethod);
        expect(result).toEqual(expectedResponse);
      }
    });
  });

  describe('findAll', () => {
    it('should return all payments', async () => {
      const expectedResponse = { payments: [mockPayment] };
      service.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should return empty array when no payments exist', async () => {
      const expectedResponse = { payments: [] };
      service.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should handle service errors during findAll', async () => {
      const error = new Error('Service error');
      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a payment by id', async () => {
      service.findById.mockResolvedValue(mockPayment);

      const result = await controller.findOne(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPayment);
    });

    it('should handle service errors during findOne', async () => {
      const error = new Error('Payment not found');
      service.findById.mockRejectedValue(error);

      await expect(controller.findOne(999)).rejects.toThrow(error);
      expect(service.findById).toHaveBeenCalledWith(999);
    });

    it('should handle different id types through ParseIntPipe', async () => {
      service.findById.mockResolvedValue(mockPayment);

      const result = await controller.findOne(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPayment);
    });
  });

  describe('update', () => {
    it('should update a payment and return the response', async () => {
      const updatedPayment = { ...mockPayment, amount: 1500.75 };
      service.update.mockResolvedValue(updatedPayment);

      const result = await controller.update(1, mockUpdatePaymentDto);

      expect(service.update).toHaveBeenCalledWith(1, mockUpdatePaymentDto);
      expect(result).toEqual(updatedPayment);
    });

    it('should handle service errors during update', async () => {
      const error = new Error('Update failed');
      service.update.mockRejectedValue(error);

      await expect(controller.update(1, mockUpdatePaymentDto)).rejects.toThrow(
        error,
      );
      expect(service.update).toHaveBeenCalledWith(1, mockUpdatePaymentDto);
    });

    it('should update payment with partial data using PATCH', async () => {
      const partialPatchDto: PatchPaymentBodyDto = {
        amount: 2000,
      };
      const updatedPayment = { ...mockPayment, amount: 2000 };
      service.patch.mockResolvedValue(updatedPayment);

      const result = await controller.patch(1, partialPatchDto);

      expect(service.patch).toHaveBeenCalledWith(1, partialPatchDto);
      expect(result).toEqual(updatedPayment);
    });

    it('should handle updating payment method using PATCH', async () => {
      const methodPatchDto: PatchPaymentBodyDto = {
        method: 'paypal',
      };
      const updatedPayment = { ...mockPayment, method: 'paypal' };
      service.patch.mockResolvedValue(updatedPayment);

      const result = await controller.patch(1, methodPatchDto);

      expect(service.patch).toHaveBeenCalledWith(1, methodPatchDto);
      expect(result).toEqual(updatedPayment);
    });
  });

  describe('remove', () => {
    it('should delete a payment', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(service.delete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should handle service errors during deletion', async () => {
      const error = new Error('Delete failed');
      service.delete.mockRejectedValue(error);

      await expect(controller.remove(999)).rejects.toThrow(error);
      expect(service.delete).toHaveBeenCalledWith(999);
    });

    it('should handle different id types through ParseIntPipe', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(service.delete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete payment lifecycle', async () => {
      // Create
      const createResponse = { id: 1 };
      service.create.mockResolvedValue(createResponse);

      const createResult = await controller.create(mockCreatePaymentDto);
      expect(createResult).toEqual(createResponse);

      // Find
      service.findById.mockResolvedValue(mockPayment);
      const findResult = await controller.findOne(1);
      expect(findResult).toEqual(mockPayment);

      // Update
      const updatedPayment = { ...mockPayment, amount: 2000 };
      service.update.mockResolvedValue(updatedPayment);
      const updateResult = await controller.update(mockUpdatePaymentDto);
      expect(updateResult).toEqual(updatedPayment);

      // Delete
      service.delete.mockResolvedValue(undefined);
      const deleteResult = await controller.remove(1);
      expect(deleteResult).toBeUndefined();
    });

    it('should handle bulk operations', async () => {
      const payments = [mockPayment, { ...mockPayment, id: 2 }];
      service.findAll.mockResolvedValue({ payments });

      const result = await controller.findAll();

      expect(result.payments).toHaveLength(2);
      expect(result.payments[0].id).toBe(1);
      expect(result.payments[1].id).toBe(2);
    });
  });

  describe('Error handling', () => {
    it('should propagate service exceptions correctly', async () => {
      const serviceError = new Error('Database connection failed');
      service.create.mockRejectedValue(serviceError);

      await expect(controller.create(mockCreatePaymentDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle undefined service responses', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      service.findById.mockResolvedValue(undefined);

      const result = await controller.findOne(1);

      expect(result).toBeUndefined();
    });
  });
});
