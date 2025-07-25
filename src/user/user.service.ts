import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserEntity, UserDocument } from './user.model';
import { CreateUserDTO } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserDocument>,
  ) {}

  async createUser(createUserDto: CreateUserDTO): Promise<UserDocument> {
    const { email, username, password } = createUserDto;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : '';
    const nextDLA = new Date(Date.now() + 12 * 60 * 60 * 1000);

    const user = new this.userModel({
      email,
      username,
      password: hashedPassword,
      actionPoints: 10,
      nextDLA,
      drafted: false,
    });

    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  // Vérifie si une nouvelle DLA a commencé et met à jour l'utilisateur => Trigger au login ? Penser au refresh sur la page ?
  async checkAndUpdateDLA(
    userId: string | Types.ObjectId,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');

    await this.migrateUserIfNeeded(user);

    const now = new Date();

    if (now >= user.nextDLA) {
      user.actionPoints = 10;
      user.drafted = false;
      user.nextDLA = new Date(now.getTime() + 12 * 60 * 60 * 1000);
      await user.save();
    }

    return user;
  }

  // Utilise des points d'action
  async useActionPoints(
    userId: string | Types.ObjectId,
    points: number,
  ): Promise<UserDocument> {
    const user = await this.checkAndUpdateDLA(userId);

    if (user.actionPoints < points) {
      throw new Error("Points d'action insuffisants");
    }

    user.actionPoints -= points;
    await user.save();
    return user;
  }

  // Fait une draft (une fois par DLA)
  async makeDraft(userId: string | Types.ObjectId): Promise<UserDocument> {
    const user = await this.checkAndUpdateDLA(userId);

    if (user.drafted) {
      throw new Error('Draft déjà effectuée pour cette DLA');
    }

    user.drafted = true;
    await user.save();
    return user;
  }

  // Récupère le statut complet de l'utilisateur avec DLA à jour
  async getUserStatus(
    userId: string | Types.ObjectId,
  ): Promise<
    UserDocument & { timeUntilNextDLA: { hours: number; minutes: number } }
  > {
    const user = await this.checkAndUpdateDLA(userId);

    const now = new Date();
    const timeLeft = user.nextDLA.getTime() - now.getTime();

    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

    return Object.assign(user, {
      timeUntilNextDLA: {
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
      },
    });
  }

  // Migration automatique des utilisateurs existants
  private async migrateUserIfNeeded(user: UserDocument): Promise<UserDocument> {
    let needsSave = false;

    if (!user.nextDLA) {
      user.nextDLA = new Date(Date.now() + 12 * 60 * 60 * 1000);
      needsSave = true;
    }

    if (user.drafted === undefined || user.drafted === null) {
      user.drafted = false;
      needsSave = true;
    }

    if (user.actionPoints === undefined || user.actionPoints === null) {
      user.actionPoints = 10;
      needsSave = true;
    }

    if (needsSave) {
      await user.save();
    }

    return user;
  }
}
