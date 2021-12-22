import {HttpService} from './http-service';

export interface HttpInterface {
	getSnapShot(url: string): Promise<Blob|null>;
}

export const NewHttpInterface = (): HttpInterface => {
	return new HttpService();
}