// tslint:disable-next-line: no-console
export const log = { debug: (message: string, metadata?: object) => console.log(message, JSON.stringify(metadata, null, 2)) };
