import React, { use, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
export default function LikedTodoContainer() {

    const closeBox = useSelector((state) => state.states.close)

     let color = ['#FF7070','#44A194','#44A194','#F1FF5E','#c07aeb','#FF52A0','#FF5B5B','#96f18f','#bdd591','#E8E2D8','#B153D7','#d910dc','#FACE68','#e87272','#FEB05D','#ED985F']

    let [arrCat, setArrCat] = useState('')
    let [category, setCategory] = useState(() => {
        let cateo = localStorage.getItem('category')
        return cateo ? JSON.parse(cateo) : []
    })

    useEffect(() => {
        localStorage.setItem('category', JSON.stringify(category))
        
    }, [category])
    
    function createCategoryFun(){
        if(arrCat.trim()=='')return
        // if(category.includes(arrCat)) return
        setCategory(prev=>
         [...prev,arrCat]
        )
        setArrCat('')
    }

    function updateCategory(){
        setCategory((prem)=>{
            
        })
    }



    return (
        <div className='Like-todo-container' style={{ display: closeBox ? 'block' : 'none' }}>
            <div className="Like-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="make-category">
                    <h4>⌂ Your Category</h4>
                </div>
                <div className="make-category">
                        <input type="text" placeholder='Write your Category' value={arrCat}  onChange={(e) =>{ setArrCat(e.target.value); }} onKeyDown={(e)=>e.key == 'Enter'&&createCategoryFun()} />
                </div>
            </div>
            <div className="category">
                {category.map((item)=>(
                     <div className="my-cat" style={{display:'flex',justifyContent:'space-between'}} key={item}>

                    <h3 style={{color:'white',fontFamily:'sans-serif'}} ># {item}</h3>
                    <h3 style={{cursor:'pointer'}} onClick={()=>{}} >🗑️</h3>
                    </div>
                ))}
            </div>
        </div>
    )
}
