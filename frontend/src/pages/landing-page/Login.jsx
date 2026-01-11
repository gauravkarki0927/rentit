import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/API.js';
import logo from '../pictures/auclogo.jpg';
import toast from 'react-hot-toast'


function Login() {

    const PasswordVisibility = () => {
        const field1 = document.getElementById('password');
        const x = document.getElementById('eye1');
        const y = document.getElementById('slash1');
        if (field1.type === "password") {
            field1.type = "text";
            x.style.display = 'none';
            y.style.display = 'block';
        } else {
            field1.type = "password";
            x.style.display = 'block';
            y.style.display = 'none';
        }
    };

    const [values, setValues] = useState({
        email: '',
        password: ''
    });

    const handleInput = (event) => {
        setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
    }

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('/login', values);
    
            if (response.status === 201) {
                localStorage.setItem('token', response.data.token);
                if (response.data.role === "admin") {
                    navigate('/admin');
                } else {
                    navigate('/access/userdash');
                }
            } else {
                toast.error(response.data.error || 'Login failed. Please try again.', {position: "top-right"});
            }            
        } catch (err) {
            if (err.response && err.response.data?.error) {
                toast.error(err.response.data.error, { position: "top-right" });

            } else {
                toast.error('Login failed. Please try again.', { position: "top-right" });
            }
        }
    };
    

    return (
        <div className="min-h-screen">
            <div className="min-h-screen flex">
                <div className="w-full lg:w-1/2 flex items-center justify-center p-0">
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-2xl lg:shadow-xl p-8">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full">
                                    <img src={logo} alt="" srcSet="" />
                                </div>
                                <p className="text-center font-semibold text-[24px] xl:text-[32px] md:text[28px]">
                                    <a href="/">
                                        <span className="text-rose-700">My</span>Auction
                                    </a>
                                </p>
                            </div>
                            <form className="lg:space-y-4 space-y-6" onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-sm font-medium">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        className="w-full mt-1 border-gray-300 outline-none p-2 rounded shadow-sm border border-gray-100"
                                        onChange={handleInput} required
                                    />
                                </div>
                                <div className="mb-4">
                                    <div className="flex justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium">
                                        Password
                                    </label>
                                    <a className="text-[13px] text-red-500" href="/forget">Forget password?</a>
                                    </div>
                                    <div className="bg-transparent mt-1 rounded-md shadow-sm relative">
                                        <input id="password" name="password" type="password" placeholder="*********"
                                            className="w-full mt-1 border-gray-300 outline-none p-2 rounded shadow-sm border border-gray-100 transition duration-150 ease-in-out" onChange={handleInput} required />
                                        <i onClick={() => PasswordVisibility('password1')} id="eye1" className="fa-regular fa-eye-slash text-[13px] text-gray-500 absolute right-2 top-4 hidden cursor-pointer"></i>
                                        <i onClick={() => PasswordVisibility('password1')} id="slash1" className="fa-regular fa-eye text-[13px] text-gray-500 h-4 absolute right-2 top-4 cursor-pointer"></i>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        className="w-full py-2 px-4 bg-black rounded-md text-white font-semibold outline-none cursor-pointer"
                                    >
                                        Login
                                    </button>
                                    <div>
                                        <p className="text-[14px]">
                                            Don't have an account? <a className="text-green-600 italic" href="/signup">Register here</a>
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block lg:w-1/2 login-bg">
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center text-white px-12">
                            <h2 className="text-4xl font-bold mb-6">Login To Your Account</h2>
                            <p className="text-xl">Upload your products and get a fair price at sell or bid the item you are interested, it might be your lucky day!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;