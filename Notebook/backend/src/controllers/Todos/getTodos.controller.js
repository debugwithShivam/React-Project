import Todo from "../../module/todo.schema.js";

async function getTodos(req, res) {
    try {
        const todos = await Todo.find({ userId: req.user._id }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            message: "Data Was Found",
            data: todos,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "No Data Found",
        });
    }
}

export default getTodos;
