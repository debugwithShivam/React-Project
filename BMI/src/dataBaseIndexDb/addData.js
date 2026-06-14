import { dbPromise } from "./createDB";


export async function addAccount(params) {
    const db = await dbPromise;
    await db.add('Bmi',params)
}