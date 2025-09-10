import { useState } from "react";
import { Loader2, Mail, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_HOST}/api/forgot-password/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                }
            );
            const data = await response.json();
            if (data.success) {
                toast.success(data.msg, { autoClose: 2000 });
                setStep(2);
            } else {
                toast.error(data.msg, { autoClose: 2000 });
            }
        } catch (err) {
            console.error(err);
            setMessage("Server error. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_HOST}/api/verify-reset-code/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, code }),
                }
            );
            const data = await response.json();
            if (data.success) {
                toast.success("Code verified! Enter new password.", { autoClose: 2000 });
                setStep(3);
            } else {
                toast.error(data.msg, { autoClose: 2000 });
            }
        } catch (err) {
            console.error(err);
            setMessage("Server error. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_HOST}/api/reset-password/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, code, password }),
                }
            );
            const data = await response.json();
            if (data.success) {
                toast.success("Password reset successfully!", { autoClose: 2000 });
                setStep(1);
                navigate("/login");
                setEmail("");
                setCode("");
                setPassword("");
                setConfirmPassword("");
            } else {
                toast.error(data.msg, { autoClose: 2000 });
            }
        } catch (err) {
            console.error(err);
            setMessage("Server error. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gray-900 px-4">
            <div className="absolute inset-0">
                <img src="/assets/images/login.jpg" alt="Background" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/50" />
            </div>
            <div className="w-full relative z-10 max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-lg bg-white/10 border border-white/20">
                <h2 className="text-3xl font-bold text-center text-white drop-shadow mb-8">
                    Forgot Password
                </h2>
                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="space-y-5">
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 pl-10 rounded-lg border border-white/30 bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                                required
                            />
                            <Mail className="absolute left-3 top-4 text-gray-300" size={20} />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={` ${loading ? 'cursor-wait' : 'cursor-pointer'} w-full mt-10 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50`}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Code"}
                        </button>
                    </form>
                )}
                {step === 2 && (
                    <form onSubmit={handleCodeSubmit} className="space-y-5">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter reset code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                                required />
                        </div>
                        <div className="flex justify-end mt-2 mr-2">
                            <button
                                type="button"
                                onClick={handleEmailSubmit}
                                className="text-indigo-400 hover:text-indigo-500 text-sm font-medium">
                                Resend Code
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={` ${loading ? 'cursor-wait' : 'cursor-pointer'} w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50`}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify Code"}
                        </button>
                    </form>
                )}
                {step === 3 && (
                    <form onSubmit={handlePasswordReset} className="space-y-5">
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="New password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pl-10 rounded-lg border border-white/30 bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                                required/>
                            <Lock className="absolute left-3 top-4 text-gray-300" size={20} />
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 pl-10 rounded-lg border border-white/30 bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                                required />
                            <Lock className="absolute left-3 top-4 text-gray-300" size={20} />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`${loading ? 'cursor-wait' : 'cursor-pointer'} w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50`}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
                        </button>
                    </form>
                )}
                {message && (
                    <p className="text-center mt-4 text-sm font-medium text-gray-100">{message}</p>
                )}
            </div>
        </div>
    );
};

export default ForgetPassword;
