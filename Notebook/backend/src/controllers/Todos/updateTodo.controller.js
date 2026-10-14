import mongoose from "mongoose";
import Todo from "../../module/todo.schema.js";

async function updateTodo(req, res) {
    const { id, done } = req.body ?? {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid task id" });
    }

    try {
        const todo = await Todo.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { done: Boolean(done) },
            { new: true }
        );

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task updated",
            data: todo,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Your task could not be saved",
        });
    }
}

export default updateTodo;
