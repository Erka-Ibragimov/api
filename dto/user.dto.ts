import { User } from "../module/user-module";

export class UserDto {
  email: string;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  constructor(model: User) {
    this.email = model.email;
    this.id = model.id;
    this.createdAt = model.created_at;
    this.updatedAt = model.updated_at;
  }
}
