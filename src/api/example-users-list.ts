import { http } from "../core/http";

export const getUsers = () => http("https://jsonplaceholder.typicode.com/users");
