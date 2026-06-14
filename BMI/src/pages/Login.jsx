import React from 'react'
import imagesObj from '../images/imagesObj'
import { useState } from 'react'
import { addAccount } from '../dataBaseIndexDb/addData'

export default function Login() {
    let [hidden, setPasswordVisibility] = useState(true)
    let [userName,setName]=useState('')
    let [userPassword,setPassword]=useState()
    async function  handleAdd(name,password) {
        await addAccount({
            name:name,
            password:password,
            completed:false
        })
    }

    return (
        <div className=''>
            <img src={imagesObj.loging} className='fixed z-[-1] h-screen w-screen' alt="" />
            <div className="login z-999 flex justify-center items-center h-screen text-white" >
                <div className="border-3 border-white h-125 w-100 rounded-2xl p-3 bg-black opacity-55">
                    <div className="pl-4">
                        <h1 className='text-4xl'>SingUp</h1>
                        <p className='pt-3'>Welcome to BMI calculator Website For SingUp</p>
                    </div>
                    <div className="">
                        <form action="" className='border-red flex flex-col p-3'>
                            <input type="text" name='name' value={userName} onChange={(e)=>setName(e.target.value)} placeholder='User Name' className='border-2 rounded-sm p-3 mt-4 placeholder:text-white text-xl outline-none' />
                            <input type={hidden ? 'password' : 'text'} name="password" id="" placeholder='Password' value={userPassword} onChange={(e)=>setPassword(e.target.value)} className='border-2 rounded-sm p-3 mt-4 placeholder:text-white text-xl outline-none' />
                            <div className="mt-4">
                                <input type="checkbox" name="visibility" id="visibility" onClick={() => setPasswordVisibility(prev => !prev)} value='' />
                                <label htmlFor="visibility" className='text-white'>{hidden ? 'Password is not visibility' : 'Password is visibility'}</label>
                            </div>
                        </form>
                    </div>
                    <div className="flex flex-col p-2 justify-center items-center">
                        <div className="flex justify-center flex-col items-center pt-5">
                            <button onClick={()=>handleAdd(userName,userPassword)} className='rounded-2xl bg-green-500 text-white font-mono font-semibold p-2 text-2xl w-35 h-15'>SingUp</button>
                            <p>Create Your account And Join Your Family</p>
                        </div>
                        <div className="pt-15">
                            <p>
                                Body Mass Index Website
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
