export interface CreatePlayerOptions {
	parentElementId: string;
	id: string;
	url: string;
	protocol: string;
	host: string;
	transcode: number;
	errorMsgFunc?: (err: IErrorMsg | boolean) => void;
	startDate?: number;
	endDate?: number;
	autoPlay?: boolean;
	snapshot?: boolean;
	capture?: boolean;
	searchDate?: boolean;
	scale?: number;
}

export interface IErrorMsg {
	code: number;
	funcName: string;
	msg: string;
}