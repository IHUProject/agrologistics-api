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

  constructor() {
    this.transporter = nodemailer.createTransport({});
    this.email = '';
  }

  private async initVariables() {
    const credentials = await Credential.findOne();
    const accountant = await Accountant.findOne();

    this.email = accountant?.email as string;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: credentials?.email,
        pass: credentials?.pass,
      },
    });
  }

  private async sendEmail(
    to: string,
    model: IExpense | IPurchase,
    subject: EmailSubjects,
    images?: string[]
  ) {
    const html = `<p>${model.description ?? 'Δεν υπαρχει description'}</p>`;

    const attachments = images?.map((image, index) => ({
      filename: `Image_${image.substring(image.lastIndexOf('/') + 1)}`,
      path: image,
      cid: `image${index}`,
    }));

    const mailOptions = {
      from: this.email,
      to,
      subject,
      html,
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
      const images = exp.images.filter(
        (img) => img.link !== DefaultImage.EXPENSE_IMAGE
      );

      await this.sendEmail(
        'stevegkortsopoulos@gmail.com',
        exp,
        EmailSubjects.EXPENSE,
        images.map((img) => img.link)
      );

      const { _id } = exp;
      await this.updateEntity(_id, Expense);
    }
  }

  public async sendPurchases() {
    const purchases = await Purchase.find({ isSend: false });
    await this.initVariables();
    for (const purch of purchases) {
      await this.sendEmail(
        'stevegkortsopoulos@gmail.com',
        purch,
        EmailSubjects.PURCHASE
      );

      const { _id } = purch;
      await this.updateEntity(_id, Purchase);
    }
  }

  public async sendSingleExpense(id: string) {
    const expense = await Expense.findById(id);
    await this.initVariables();
    const images = expense?.images.filter(
      (img) => img.link !== DefaultImage.EXPENSE_IMAGE
    );

    await this.sendEmail(
      'stevegkortsopoulos@gmail.com',
      expense as IExpense,
      EmailSubjects.EXPENSE,
      images?.map((img) => img.link)
    );

    await this.updateEntity(id, Expense);
  }

  public async sendSinglePurchase(id: string) {
    const purchase = await Purchase.findById(id);
    await this.initVariables();
    await this.sendEmail(
      'stevegkortsopoulos@gmail.com',
      purchase as IPurchase,
      EmailSubjects.PURCHASE
    );

    await this.updateEntity(id, Purchase);
  }
}
