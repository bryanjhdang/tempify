import axios from "axios";
import { Pet, Project, TimeEntry, User } from "./models";
        
// Account
export function getAccount(accountId: string): Promise<User> {
	const createUser = (any : any): User => {
		return new User(
			any.data.id,
			any.data.displayName,
			any.data.pet,
			any.data.timeEntries,
			any.data.currentTimerStart,
			any.data.projects,
			any.data.totalCoins,
			any.data.currentTimeEntry
		);
	}

	return new Promise<User>((resolve, reject) => {
		axios({
			method: 'get',
			url: `${import.meta.env.VITE_API_SERVER_URL}/account/?id=${accountId}` 
		})
		.then((response) => {
			resolve(createUser(response));
		}, (error) => {
			reject(error);
		});
	})
}

export function postAccountCreate(): void {

}

// Pet
export function getPet(): Promise<Pet> {
	const createPet = (any: any): Pet => {
		return new Pet(any.data.id, any.data.name, any.data.imageUrl);
	}

	return new Promise<Pet>((resolve, reject) => {
		axios({
			method: 'get',
			url: `${import.meta.env.VITE_API_SERVER_URL}/pet` 
		})
		.then((response) => {
			resolve(createPet(response));
		}, (error) => {
			reject(error);
		});
	})
}

export function getCoins(): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		axios({
			method: 'get',
			url: `${import.meta.env.VITE_API_SERVER_URL}/pet/coins`
		})
		.then((response) => {
			console.log(response);
			resolve(response.data);
		}, (error) => {
			reject(error);
		});
	})
}

// TimeEntry
export function getTimeEntry(): Promise<TimeEntry[]> {
	const createTimeEntries = (any : any): TimeEntry[] => {
		return any.data.timeEntries.map((element: any) => {
			return new TimeEntry(
				element.id,
				element.startTime,
				element.endTime,
				element.project,
				element.name,
				element.earnedCoins
			);
		});
	}

	return new Promise<TimeEntry[]>((resolve, reject) => {	
		axios({
			method: 'get',
			url: `${import.meta.env.VITE_API_SERVER_URL}/timeEntry`
		})
		.then((response) => {
			resolve(createTimeEntries(response));
		}, (error) => {
			reject(error);
		})
	})
}

export function postTimeEntryStart(timeEntry : TimeEntry): void {
	axios({
		method: 'post',
		url: `${import.meta.env.VITE_API_SERVER_URL}/timeEntry/start`,
		data: {
			entryName: timeEntry.name,
			projectId: timeEntry.projectId,
			startTime: timeEntry.startTime,
			endTime: timeEntry.endTime
		}
	})
	.then((response) => {
		console.log(response);
	}, (error) => {
		throw(error);
	});
}

export function postTimeEntryStop(endTimeNumber : number): void {
	axios({
		method: 'post',
		url: `${import.meta.env.VITE_API_SERVER_URL}/timeEntry/stop`,
		data: {
			endTime: endTimeNumber
		}
	})
	.then((response) => {
		console.log(response);
	}, (error) => {
		throw(error);
	});
}

// Projects
export async function postProject(project: Project) {
	axios({
		method: 'post',
		url: `${import.meta.env.VITE_API_SERVER_URL}/timeEntry/project`,
		data: {
			hex: project.hex,
			name: project.name
		}
	})
	.then((response) => {
		project.id = response.data.projectId;
	}, (error) => {
		console.log(error);
	});
}

export async function getProjects(): Promise<Project[]> {
	const createProjects = (any: any): Project[] => {
		return any.data.projects.map((element: any) => {
			return new Project(element.id, element.hex, element.name);
		});
	}

	return new Promise<Project[]>((resolve, reject) => {
		axios({
			method: 'get',
			url: `${import.meta.env.VITE_API_SERVER_URL}/timeEntry/project`
		})
		.then((response) => {
			resolve(createProjects(response));
		}, (error) => {
			reject(error)
		});
	})
}