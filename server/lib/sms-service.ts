export class SmsService {
  static async sendSms(phone: string, message: string): Promise<boolean> {
    console.log(`[SMS SENDED] To: ${phone}, Msg: ${message}`);
    return true;
  }
}

export default SmsService;
