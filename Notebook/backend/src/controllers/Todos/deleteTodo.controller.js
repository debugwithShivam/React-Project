import Todo from "../../module/todo.schema.js";

async function deleteTodo(req, res) {
    const { id } = req.params;

    try {
        const deleted = await Todo.findOneAndDelete({
            _id: id,
            userId: req.user._id,
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task deleted",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Your task could not be deleted",
        });
    }
}

export default deleteTodo;
