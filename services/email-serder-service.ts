import nodemailer, { Transporter } from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import Expense from '../models/Expense';
import { DefaultImage, EmailSubjects } from '../interfaces/enums';
import Purchase from '../models/Purchase';
import { IExpense, IPurchase } from '../interfaces/interfaces';
import { Model } from 'mongoose';
import Credential from '../models/Credential';
import Accountant from '../models/Accountant';

export class EmailSenderService {
  private transporter: Transporter<SentMessageInfo>;
  private email: string;
  private emailToSend: string;

  constructor() {
    this.transporter = nodemailer.createTransport({});
    this.email = '';
    this.emailToSend = '';
  }

  private async initVariables() {
    const credentials = await Credential.findOne();
    const accountant = await Accountant.findOne();

    this.email = credentials?.email as string;
    this.emailToSend = accountant?.email as string;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: credentials?.email,
        pass: credentials?.pass,
      },
    });
  }

  private async sendEmail(
    entity: IExpense | IPurchase,
    subject: EmailSubjects,
    images?: string[]
  ) {
    const formattedDate = entity.date
      ? entity.date.toLocaleDateString('el-GR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Δεν προσδιορίζεται ημερομηνία';

    const htmlTemplate = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { background: #f3f3f3; padding: 20px; text-align: center; }
          .content { margin: 20px; }
          .footer { background: #f3f3f3; padding: 10px; text-align: center; }
          img { max-width: 350px; margin: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${subject}</h2>
        </div>
        <div class="content">
          <p>Περιγραφη: <b>${
            entity.description ?? 'Δεν υπάρχει περιγραφή.'
          }</b></p>
          <p>Ημερομινία: <b>${formattedDate}</b></p>
          <p>Τρόπος πληρωμής: <b>${entity.paymentMethod}</b></p>
          ${
            images && images.length > 0
              ? '<div>' +
                images
                  .map((image) => `<img src="${image}" alt="Image">`)
                  .join('') +
                '</div>'
              : '<p>Δεν βρέθηκαν εικόνες.</p>'
          }
        </div>
        <div class="footer">
          <p>Ευχαριστούμε.</p>
        </div>
      </body>
    </html>`;

    const attachments = images?.map((image, index) => ({
      filename: `Image_${image.substring(image.lastIndexOf('/') + 1)}`,
      path: image,
      cid: `image${index}`,
    }));

    const mailOptions = {
      from: this.email,
      to: this.emailToSend,
      subject,
      html: htmlTemplate,
      attachments,
    };

    await this.transporter.sendMail(mailOptions);
  }

  private async updateEntity<T>(id: string, model: Model<T>) {
    await model.findByIdAndUpdate(id, { isSend: true }, { new: true });
  }

  public async sendExpenses() {
    const expenses = await Expense.find({ isSend: false });
    await this.initVariables();

    for (const exp of expenses) {
      const images = exp?.images
        .filter((img) => img.link !== DefaultImage.EXPENSE_IMAGE)
        .map((img) => img.link);
      const { _id } = exp;
      await this.sendEmail(exp, EmailSubjects.EXPENSE, images);
      await this.updateEntity(_id, Expense);
    }
  }

  public async sendPurchases() {
    const purchases = await Purchase.find({ isSend: false });
    await this.initVariables();
    for (const purch of purchases) {
      const { _id } = purch;
      await this.sendEmail(purch, EmailSubjects.PURCHASE);
      await this.updateEntity(_id, Purchase);
    }
  }

  public async sendSingleExpense(id: string) {
    const expense = await Expense.findById(id);
    const images = expense?.images
      .filter((img) => img.link !== DefaultImage.EXPENSE_IMAGE)
      .map((img) => img.link);

    await this.initVariables();
    await this.sendEmail(expense!, EmailSubjects.EXPENSE, images);
    await this.updateEntity(id, Expense);
  }

  public async sendSinglePurchase(id: string) {
    const purchase = await Purchase.findById(id);

    await this.initVariables();
    await this.sendEmail(purchase!, EmailSubjects.PURCHASE);
    await this.updateEntity(id, Purchase);
  }
}
