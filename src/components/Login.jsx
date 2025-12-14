import { LockIcon, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/admin-login/`, {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem("accessToken", data.access);
                localStorage.setItem("refreshToken", data.refresh);
                window.dispatchEvent(new Event("storage"));
                toast.success(data.msg, { autoClose: 2000 });
                navigate("/");
            }
            else {
                toast.error(data.msg, { autoClose: 2000 });
            }
        } catch (error) {
            console.error("Error accepting changes:", error);
        }
    }

    return (
        <div className="relative h-screen w-screen flex items-center justify-center">
            <div className="absolute inset-0">
                <img src="/assets/images/login.jpg" alt="Login background" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
            </div>
            <div className="relative z-10 backdrop-blur-lg bg-white/10 border border-white/30 rounded-2xl shadow-2xl mt-0 lg:mt-10 p-6 md:p-10 lg:p-10 xl:p-10 w-full max-w-md mx-6">
                <h2 className="lg:text-3xl text-2xl font-bold text-center text-white mb-6">
                    Admin Login
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit} method='POST'>
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Email <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter your email"
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 pl-10 rounded-xl border border-white/30 bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                                required />
                            <Mail className="absolute left-3 top-3.5 text-gray-300" size={20} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Password <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Enter your password"
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 pl-10 rounded-lg border border-white/30 bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                                required />
                            <LockIcon className="absolute left-3 top-4 text-gray-300" size={20} />
                        </div>
                    </div>
                    <button type="submit" className="cursor-pointer w-full py-2 mt-6 px-4 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg shadow-lg transition">
                        Login
                    </button>
                </form>
                <p className="text-center text-gray-300 mt-4 text-sm">
                    Forgot your password?{" "}
                    <Link to="/forget-password" className="text-blue-400 hover:underline">
                        Reset here
                    </Link>
                </p>
            </div>
        </div>

    )
}

export default Login