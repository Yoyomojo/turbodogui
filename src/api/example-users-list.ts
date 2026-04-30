import { http } from "./http";

export const getUsers = () => http("https://jsonplaceholder.typicode.com/users");
