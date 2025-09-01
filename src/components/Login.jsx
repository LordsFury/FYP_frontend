import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", password: "" });

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
            <div className="relative z-10 backdrop-blur-lg bg-white/10 border border-white/30 rounded-2xl shadow-2xl p-6 md:p-10 lg:p-10 xl:p-10 w-full max-w-md mx-6">
                <h2 className="lg:text-3xl text-2xl font-bold text-center text-white mb-6">
                    Admin Login
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit} method='POST'>
                    <div>
                        <label className="block text-sm font-medium text-white mb-1">
                            Username <span className="text-red-400">*</span>
                        </label>
                        <input type="text" name='username' value={formData.username} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Enter your username" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white mb-1">
                            Password <span className="text-red-400">*</span>
                        </label>
                        <input type="password" name='password' value={formData.password} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Enter your password" />
                    </div>
                    <button type="submit" className="cursor-pointer w-full py-2 mt-6 px-4 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg shadow-lg transition">
                        Login
                    </button>
                </form>
                <p className="text-center text-gray-300 mt-4 text-sm">
                    Forgot your password?{" "}
                    <a href="#" className="text-blue-400 hover:underline">
                        Reset here
                    </a>
                </p>
            </div>
        </div>

    )
}

export default Login