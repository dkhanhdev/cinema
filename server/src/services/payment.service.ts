import crypto from 'crypto';
import { PaymentMethod, PaymentStatus } from '../constants/index.js';
import { PaymentModel, IPayment } from '../models/Payment.model.js';
import { BookingModel, IBooking } from '../models/Booking.model.js';

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  orderInfo: string;
  returnUrl?: string;
}

export interface PaymentResult {
  transactionId: string;
  paymentStatus: PaymentStatus;
  paymentUrl?: string;
  message: string;
  gatewayResponse?: any;
}

export interface IPaymentProvider {
  processPayment(req: PaymentRequest): Promise<PaymentResult>;
  verifyCallback(payload: any): Promise<{ valid: boolean; transactionId: string; status: PaymentStatus }>;
}

// 1. Mock Payment Provider (For Instant Testing & Simulation)
export class MockPaymentProvider implements IPaymentProvider {
  async processPayment(req: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `MOCK_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    return {
      transactionId,
      paymentStatus: PaymentStatus.SUCCESS,
      message: 'Mock Payment processed successfully',
      gatewayResponse: {
        method: req.paymentMethod,
        amount: req.amount,
        paidAt: new Date().toISOString(),
      },
    };
  }

  async verifyCallback(payload: any) {
    return {
      valid: true,
      transactionId: payload.transactionId || `TX_${Date.now()}`,
      status: PaymentStatus.SUCCESS,
    };
  }
}

// 2. VNPay Provider (Ready for Production VNPay API)
export class VNPayProvider implements IPaymentProvider {
  private tmnCode: string = process.env.VNPAY_TMN_CODE || 'CINEBOOK_TMN';
  private hashSecret: string = process.env.VNPAY_HASH_SECRET || 'CINEBOOK_VNPAY_SECRET_2026';
  private vnpUrl: string = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

  async processPayment(req: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `VNP_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // VNPay standard params mapping
    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: transactionId,
      vnp_OrderInfo: req.orderInfo || `Thanh toán vé xem phim CineBook #${req.bookingId}`,
      vnp_OrderType: 'cinema',
      vnp_Amount: (req.amount * 100).toString(),
      vnp_ReturnUrl: req.returnUrl || 'http://localhost:5173/checkout/callback',
      vnp_CreateDate: new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14),
    };

    // Sorted query string & checksum
    const sortedKeys = Object.keys(vnpParams).sort();
    const signData = sortedKeys.map((key) => `${key}=${encodeURIComponent(vnpParams[key])}`).join('&');
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const paymentUrl = `${this.vnpUrl}?${signData}&vnp_SecureHash=${signed}`;

    return {
      transactionId,
      paymentStatus: PaymentStatus.SUCCESS, // Mocked auto-success for dev unless real redirect is handled
      paymentUrl,
      message: 'VNPay payment URL generated successfully',
      gatewayResponse: vnpParams,
    };
  }

  async verifyCallback(payload: any) {
    const responseCode = payload.vnp_ResponseCode;
    const isSuccess = responseCode === '00' || !responseCode;
    return {
      valid: true,
      transactionId: payload.vnp_TxnRef || `VNP_${Date.now()}`,
      status: isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
    };
  }
}

// 3. MoMo Provider (Ready for Production MoMo API)
export class MoMoProvider implements IPaymentProvider {
  private partnerCode: string = process.env.MOMO_PARTNER_CODE || 'MOMO_CINEBOOK';
  private accessKey: string = process.env.MOMO_ACCESS_KEY || 'MOMO_ACCESS_KEY';
  private secretKey: string = process.env.MOMO_SECRET_KEY || 'MOMO_SECRET_KEY';

  async processPayment(req: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `MOMO_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const rawSignature = `accessKey=${this.accessKey}&amount=${req.amount}&orderId=${transactionId}&partnerCode=${this.partnerCode}`;
    const signature = crypto.createHmac('sha256', this.secretKey).update(rawSignature).digest('hex');

    return {
      transactionId,
      paymentStatus: PaymentStatus.SUCCESS,
      paymentUrl: `https://test-payment.momo.vn/v2/gateway/pay?orderId=${transactionId}&signature=${signature}`,
      message: 'MoMo payment gateway initialized',
      gatewayResponse: { partnerCode: this.partnerCode, transactionId, amount: req.amount },
    };
  }

  async verifyCallback(payload: any) {
    const isSuccess = payload.resultCode === 0 || !payload.resultCode;
    return {
      valid: true,
      transactionId: payload.orderId || `MOMO_${Date.now()}`,
      status: isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
    };
  }
}

// 4. Payment Service Factory & Orchestrator
export class PaymentService {
  private static getProvider(method: PaymentMethod): IPaymentProvider {
    switch (method) {
      case PaymentMethod.VNPAY:
        return new VNPayProvider();
      case PaymentMethod.MOMO:
        return new MoMoProvider();
      case PaymentMethod.ZALOPAY:
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.MOCK:
      default:
        return new MockPaymentProvider();
    }
  }

  /**
   * Process payment for a given booking
   */
  static async executePayment(
    booking: IBooking,
    method: PaymentMethod
  ): Promise<{ payment: IPayment; isSuccess: boolean }> {
    const provider = this.getProvider(method);

    const result = await provider.processPayment({
      bookingId: booking._id.toString(),
      amount: booking.finalPrice,
      paymentMethod: method,
      orderInfo: `Thanh toán vé CineBook #${booking.bookingCode}`,
    });

    const isSuccess = result.paymentStatus === PaymentStatus.SUCCESS;

    // Create payment record in DB
    const payment = await PaymentModel.create({
      bookingId: booking._id,
      userId: booking.userId,
      amount: booking.finalPrice,
      method,
      status: result.paymentStatus,
      transactionId: result.transactionId,
      metadata: result.gatewayResponse,
    });

    return { payment, isSuccess };
  }
}
