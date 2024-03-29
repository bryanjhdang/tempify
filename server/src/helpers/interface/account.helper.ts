import { User } from "../../models/User";

export interface AccountHelper {
    getUser(id: string) : Promise<User>;
}