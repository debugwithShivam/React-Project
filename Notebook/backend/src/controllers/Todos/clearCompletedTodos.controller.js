import Todo from "../../module/todo.schema.js";

async function clearCompletedTodos(req, res) {
    try {
        const result = await Todo.deleteMany({
            userId: req.user._id,
            done: true,
        });

        return res.status(200).json({
            success: true,
            message: "Completed tasks cleared",
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Completed tasks could not be cleared",
        });
    }
}

export default clearCompletedTodos;
