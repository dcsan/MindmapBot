import { JsonDatabase } from "wio.db";

export class Database extends JsonDatabase<any> {
    constructor() {
        super({ databasePath: "./database/database.json" });
    };
};