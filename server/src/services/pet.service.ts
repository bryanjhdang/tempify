import { firestoreHelper } from "../helpers/firestore.helper";
import { DatabaseHelper } from "../helpers/interface/database.helper";
import { Pet } from "../models/Pet";
import { User } from "../models/User";

export class PetService {
    constructor(private db: DatabaseHelper) { };

    getCoins(user : User) : number {
        return user.totalCoins;
    }

    addCoins(user: User, count : number) : number {
        // TODO: Call Database helper function to add to user coin count
        return user.totalCoins + count;
    }

    getPet(user: User) : Pet {
        return user.pet;
    }
}

const petService = new PetService(
    firestoreHelper
);

export { petService }

