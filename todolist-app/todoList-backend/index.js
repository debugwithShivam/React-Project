import express from 'express'
import task from './database/search_module.js';
import cors from 'cors'
import { connectDataBase } from './database/db.js';
import { TodoPage } from './database/TodoPage.js';
import { Todo } from './database/TodoPage.js';
import Login from './database/Login.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
connectDataBase();

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.send('server start');
});

app.post('/search', async (req, res) => {
    try {
        const { searchInput, currantDate, complet, paused, timer } = req.body
        await task.create({
            searchInput: searchInput,
            currantDate: currantDate,
            complet: complet,
            paused: paused,
            timer
        });
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });

    };
});



app.get('/searchTask', async (req, res) => {
    try {
        let todo = await task.find()
        res.json({ success: true, data: todo })
    } catch (err) {
        res.status(500).json({ seccess: false })

    }
})

app.patch('/completed', async (req, res) => {
    try {
        const { complet, id, paused, searchInput, isDisabled } = req.body
        const update = await task.findByIdAndUpdate(
            id,
            { complet, paused, searchInput, isDisabled },
            { new: true }
        )
        res.status(200).json({ success: true, data: update, })
    } catch (err) {
        res.status(500).json({ success: false })
    }
})


app.patch('/timer', async (req, res) => {
    try {
        const { id, duration, isDisabled } = req.body


        const updateTask = await task.findByIdAndUpdate(
            id,
            { isDisabled: isDisabled, duration },
            { new: true }
        )
        res.status(200).json({ success: true, data: updateTask })
    } catch (err) {
        res.status(500).json({ data: null, success: false })
    }
})

app.patch('/updateTimer', async (req, res) => {
    try {
        const { id, duration, isDisabled } = req.body
        await task.findByIdAndUpdate(
            id,
            { duration: duration, isDisabled: isDisabled },
            { new: true }
        )
    } catch (err) {
        console.log(err);
    }
})

app.delete('/deteleTodo/:id', async (req, res) => {
  try {
    const { id } = req.params

    await task.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: "Todo deleted"
    })

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

app.patch('/allChange', async (req, res) => {
    try {
        const { paused, complet } = req.body
        let result = await task.updateMany(
            {},
            {
                $set: {
                    paused: paused,
                    complet: complet,
                }
            }
        )
        res.json({
            message: "All documents updated",
            modifiedCount: result.modifiedCount
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/createPage', async (req, res) => {
    try {
        const { pageName, pageDescription, pagetag, favourite, date } = req.body
        await TodoPage.create({
            pageName: pageName,
            pageDescription: pageDescription,
            pagetag: pagetag,
            favourite: favourite,
            date: date
        });
        res.status(201).json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
})

app.get('/getPages', async (req, res) => {
    try {
        let pages = await TodoPage.find()
        res.json({ success: true, data: pages })
    } catch (err) {
        res.status(500).json({ success: false })
    }
})

app.post('/SetTodo', async (req, res) => {
    try {
        const { title, Pasued, complet, createdAt, pageId, duration,date } = req.body
        let cerate = await Todo.create({
            title: title,
            Pasued: Pasued,
            complet: complet,
            createdAt: createdAt,
            pageId: pageId,
            duration: duration,
            date:date
        })
        res.status(201).json({ success: true, data: cerate })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

app.get('/GetTodo', async (req, res) => {
    try {
        let cerate = await Todo.find()
        res.status(201).json({ success: true, data: cerate })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})


// delete page and todo
app.delete('/pageTodoDelet', async (req, res) => {
    try {
        let { id } = req.body
        let res = await Todo.deleteMany({
            pageId: id
        });
        let detelePages = await TodoPage.findByIdAndDelete(id)
        res.status(201).json({ success: true, data: 'done' })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

app.patch('/favouritePage', async (req, res) => {
    try {
        let { favourite, id } = req.body
        let update = await TodoPage.findByIdAndUpdate(
            id,
            { favourite },
            { new: true }
        );
        res.status(201).json({ success: true, data: 'done' })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})


app.patch('/todoChange', async (req, res) => {
    try {
        let { id, pageId, Pasued, complet, title } = req.body
        let update = await Todo.findByIdAndUpdate(
            id,
            { pageId, Pasued, complet, title },
            { new: true }
        )
        res.status(201).json({ success: true, data: 'done' })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

app.delete('/removeTodo', async (req, res) => {
    try {
        let { id, pageId } = req.body
        let update = await Todo.findByIdAndDelete(
            id,
            { pageId },
            { new: true }
        )
        res.status(201).json({ success: true, data: 'done' })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
});

app.patch('/changePageId', async (req,res)=>{
    try{
        let {id,pageId} = req.body
        let updatePageId = await Todo.findByIdAndUpdate(
            id,
            {pageId},
            {new:true}
        )
         res.status(200).json({ success: true, data: updatePageId })
    }catch(err){
        res.status(500).json({
            success:false,
            message: err.message
        })
    }
})


app.patch('/updateMany', async (req,res)=>{
    try{
        let {pageId,complet,Pasued} = req.body
        let updateMany = await Todo.updateMany(
             { pageId },   // filter
            { $set: { complet, Pasued } }
        )
        res.status(200).json({success:true,data:updateMany})
    }catch(err){
        res.status(500).json({success:false,data:err.message})
    }
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});