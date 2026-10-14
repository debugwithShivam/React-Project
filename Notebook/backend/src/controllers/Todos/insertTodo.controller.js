import Todo from "../../module/todo.schema.js";

async function insertTodo(req, res) {
    const text = String(req.body?.text ?? "").trim();

    if (!text) {
        return res.status(400).json({
            success: false,
            message: "Task text is required",
        });
    }

    try {
        const todo = await Todo.create({
            userId: req.user._id,
            text,
        });

        return res.status(201).json({
            success: true,
            message: "Task created",
            data: todo,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Your task could not be saved",
        });
    }
}

export default insertTodo;
