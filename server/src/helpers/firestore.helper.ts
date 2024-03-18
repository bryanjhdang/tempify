import { DatabaseHelper } from "./interface/database.helper";

export class FirestoreHelper implements DatabaseHelper {
  addCoins(id: string, newCoins: number) : number {
    // TODO: Implement Firestore so we can update the user with coins earned 
    return 0;
  }
}

const firestoreHelper = new FirestoreHelper();

export { firestoreHelper };