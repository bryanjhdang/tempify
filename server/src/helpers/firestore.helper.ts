import { DatabaseHelper } from "./interface/database.helper";
import dotenv from "dotenv";
import * as admin from "firebase-admin"
import { User } from "../models/User";
import rootPath from "get-root-path";
import { TimeEntry } from "../models/TimeEntry";
import { Pet } from "../models/Pet";
import { Project } from "../models/Project";
import { resolve } from "path";
import { rejects } from "assert";
import { time } from "console";
dotenv.config();


export class FirestoreHelper implements DatabaseHelper {
  private db: admin.firestore.Firestore;
  private userDB: admin.firestore.CollectionReference;
  private timeEntryDB: admin.firestore.CollectionReference;
  private projectDB: admin.firestore.CollectionReference;

  constructor() {
    try {
      if (process.env.FIRESTORE_KEY != "CLOUD") {
        var serviceAccount = rootPath + process.env.FIRESTORE_KEY || "oopsie whoopsie" as admin.ServiceAccount;

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
    } else {
        admin.initializeApp();
      console.log("\x1b[34m", "Connecting to Firestore over Google Cloud, make sure you authorized the instance to connect");
    }


      this.db = admin.firestore();
      this.userDB = this.db.collection("users");
      this.timeEntryDB = this.db.collection("timeEntries");
      this.projectDB = this.db.collection("projects");

    } catch (error) {
      console.log("\x1b[31m", "ERROR: Unable to connect to Firestore Instance, did you include your Firestore key in the keys folder?");
      throw error;
    }
  }

  private deserializeUser(userId: string, data: admin.firestore.DocumentData): User {
    return new User(
      userId,
      data!.displayName,
      new Pet(data!.pet.id, data!.pet.name, data!.pet.imageUrl),
      data?.currentTimeEntry ? this.deserializeTimeEntry(data.currentTimeEntry) : undefined,
      data!.totalCoins
    );
  }

  private deserializeTimeEntry(element: any): TimeEntry {
    return new TimeEntry(element.id, element.startTime, element.endTime, element.projectId, element.name, element.earnedCoins);
  }

  private deserializeProject(project: any): Project {
    return new Project(project.id, project.hex, project.name)
  }


  updateUser(user: User) {
    this.userDB.doc(user.id).update(user.makeSimple());
  }

  getUser(userId: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.userDB.doc(userId).get().then(snap => {
        const data = snap.data();
        if (data) {
          resolve(this.deserializeUser(userId, data));
        } else {
          reject(Error(`Unable to find data for user with id ${userId}`));
        }
      })
        .catch(err => {
          reject(Error(`Unable to find user with id ${userId}`));
        })
    })
  }

  async deleteUser(user: User): Promise<void> {
    this.userDB.doc(user.id).delete();
  }

  async addUser(user: User): Promise<string> {
    let document = this.userDB.doc();
    user.id = document.id;
    this.userDB.doc(user.id).set(user.makeSimple());
    return user.id;
  }

  createTimeEntry(userId: string, timeEntry: TimeEntry): Promise<TimeEntry> {
    return new Promise<TimeEntry>((resolve, reject) => {
      let doc = this.timeEntryDB.doc();
      timeEntry.id = doc.id;
      this.timeEntryDB.doc(timeEntry.id).set(timeEntry.makeSimple(userId))
        .then((res) => {
          resolve(timeEntry);
        })
        .catch(() => {
          reject(Error("Unable to create time entry"));
        })
    });
  }

  createProject(userId: string, project: Project): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let doc = this.projectDB.doc();
      project.id = doc.id;
      this.projectDB.doc(project.id).set(project.makeSimple(userId))
        .then((res) => {
          resolve(project.id);
        }).catch(() => {
          reject(Error(`Unable to create project with name ${project.name}`));
        });

    });
  }

  getTimeEntries(userId: string): Promise<TimeEntry[]> {
    return new Promise<TimeEntry[]>((resolve, reject) => {
      this.timeEntryDB.where('userId', "==", userId).get()
        .then(snap => {
          let result: TimeEntry[] = [];
          snap.forEach(doc => {
            if (doc) {
              result.push(this.deserializeTimeEntry(doc.data()));
            }
          });

          resolve(result);
        })
        .catch(() => {
          reject(Error(`Unable to find time entries for user ${userId}`));
        })
    });
  }

  getProjects(userId: string): Promise<Project[]> {
    return new Promise<Project[]>((resolve, reject) => {
      this.projectDB.where('userId', "==", userId).get()
        .then(snap => {
          let result: Project[] = [];
          snap.forEach(doc => {
            if (doc) {
              result.push(this.deserializeProject(doc.data()));
            }
          });

          resolve(result);
        })
        .catch(() => {
          reject(Error(`Unable to find projects for user ${userId}`));
        })
    })
  }

}

const firestoreHelper = new FirestoreHelper();

export { firestoreHelper };