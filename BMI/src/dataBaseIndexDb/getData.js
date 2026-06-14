import { dbPromise } from "./createDB";


export async function getAccountData(params) {
    const db = await dbPromise;
    return await db.getAll('Bmi')
}