export const APP_ENV = process.env.APP_ENV || "dev";
export const isDevApp = APP_ENV === "dev";
export const isProdApp = APP_ENV === "prod";